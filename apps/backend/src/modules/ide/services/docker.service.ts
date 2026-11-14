import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FileNode, IProject } from '@modules/project';
import Docker from 'dockerode';
import type WebSocket from 'ws';
import { IServiceResponse } from '@core/types/response.type';
import { DockerError } from '../types/docker-error.types';
import { IContainerResult } from '../types/docker-result.types';
import { DockerRuntimeCoordinator } from './docker-runtime-coordinator.service';
import { DockerImageService } from './docker-image.service';
import { DockerSessionStore } from './docker-session.store';
import { DockerWorkspaceService } from './docker-workspace.service';
import { getErrorMessage } from '@core/helpers/error-message';
import { DockerInteractiveSessionService } from './docker-interactive-session.service';
import {
  createRuntimeKey,
  createSourceHash,
  getPortMapping,
  isDockerNotFound,
  normalizeContainerId,
  resolveMemoryLimitMb,
} from '../utils/docker-runtime.utils';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly stopOperations = new Map<
    string,
    Promise<IServiceResponse<boolean, DockerError>>
  >();
  private readonly docker: Docker;
  async assertOwner(containerId: string, userId: string): Promise<void> {
    if (typeof containerId !== 'string' || !/^[a-f0-9]{64}$/.test(containerId))
      throw new BadRequestException('Invalid container id');
    try {
      const info = await this.docker.getContainer(containerId).inspect();
      if (info.Config.Labels?.['project.user'] !== userId) throw new Error();
    } catch {
      throw new NotFoundException('Container not found');
    }
  }

  validateProject(project: IProject): void {
    const safe = (name: unknown) =>
      typeof name === 'string' &&
      name.length <= 128 &&
      /^[a-zA-Z0-9_.-]+$/.test(name) &&
      name !== '.' &&
      name !== '..';
    if (!safe(project._id) || !safe(project.userId) || !safe(project.meta.name))
      throw new BadRequestException('Invalid project path');
    let count = 0;
    let bytes = 0;
    const walk = (nodes: FileNode[], depth: number) => {
      if (!Array.isArray(nodes) || depth > 20)
        throw new BadRequestException('Invalid project tree');
      for (const node of nodes) {
        if (
          ++count > 1000 ||
          !safe(node.name) ||
          node.name.toLowerCase() === 'dockerfile'
        )
          throw new BadRequestException('Invalid file name');
        bytes +=
          typeof node.content === 'string'
            ? Buffer.byteLength(node.content)
            : 0;
        if (bytes > 5 * 1024 * 1024)
          throw new BadRequestException('Project too large');
        if (node.type === 'folder') walk(node.children || [], depth + 1);
        else if (node.type !== 'file' || typeof node.content !== 'string')
          throw new BadRequestException('Invalid file');
      }
    };
    walk(project.dir, 0);
  }

  constructor(
    private readonly workspace: DockerWorkspaceService,
    private readonly coordinator: DockerRuntimeCoordinator,
    private readonly sessionStore: DockerSessionStore,
    private readonly imageService: DockerImageService,
    private readonly interactiveSession: DockerInteractiveSessionService,
  ) {
    this.docker = new Docker({
      socketPath: '/var/run/docker.sock',
    });
  }

  async createAndRunContainer(
    project: IProject,
    dockerfileContent: string,
    startCommand: string[],
    stepId: string,
    memoryLimitMb?: number,
    terminal = false,
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    const runtimeKey = createRuntimeKey(project.userId, stepId);

    return this.coordinator.withRuntimeLock(runtimeKey, async () => {
      const basePath = this.workspace.getRuntimePath(
        project.userId,
        runtimeKey,
      );
      const sourceHash = createSourceHash(project.dir, dockerfileContent);
      const imageName = `icodeme-runtime-${runtimeKey}-${sourceHash}:latest`;
      let reservedSlot = false;
      let container: Docker.Container | null = null;
      try {
        const capacityAvailable = await this.coordinator.reserveRuntimeSlot(
          this.docker,
          runtimeKey,
        );
        if (!capacityAvailable) {
          return {
            success: false,
            error: DockerError.RUNTIME_CAPACITY_REACHED,
          };
        }
        reservedSlot = this.coordinator.hasReservation(runtimeKey);

        if (!(await this.imageService.hasImage(this.docker, imageName))) {
          await this.workspace.syncProjectFiles(
            basePath,
            project.dir,
            dockerfileContent,
            project.meta.language,
          );
          await this.imageService.buildImage(this.docker, basePath, imageName);
        }
        container = await this.createAndStartContainer(
          imageName,
          project,
          runtimeKey,
          memoryLimitMb,
        );
        this.coordinator.releaseRuntimeSlot(runtimeKey);
        reservedSlot = false;
        this.scheduleCleanup(container.id);
        const result = await this.startInteractiveSession(
          container,
          startCommand,
          terminal,
        );
        return {
          success: true,
          data: {
            containerId: container.id,
            imageName,
            status: result.status,
            running: result.running,
            exitCode: result.exitCode,
            output: result.output || 'No output available',
            requiresInput: result.requiresInput,
            startedAt: result.startedAt,
            finishedAt: result.finishedAt,
          },
        };
      } catch (error) {
        this.logger.error(
          `Container startup failed: ${getErrorMessage(error)}`,
        );
        if (container) await this.stopContainer(container.id);
        return { success: false, error: DockerError.IMAGE_NOT_BUILD };
      } finally {
        if (reservedSlot) this.coordinator.releaseRuntimeSlot(runtimeKey);
      }
    });
  }

  async sendInputToContainer(
    containerId: string,
    input: string,
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    return this.interactiveSession.sendInput(containerId, input, () =>
      this.scheduleCleanup(containerId),
    );
  }

  attachTerminalSocket(containerId: string, socket: WebSocket): boolean {
    return this.interactiveSession.attachSocket(containerId, socket);
  }

  async stopContainer(
    containerId: string,
  ): Promise<IServiceResponse<boolean, DockerError>> {
    const normalizedId = normalizeContainerId(containerId);
    if (!normalizedId) {
      this.logger.warn(`Invalid container id: ${JSON.stringify(containerId)}`);
      return { success: false, error: DockerError.INVALID_CONTAINER_ID };
    }

    const pendingOperation = this.stopOperations.get(normalizedId);
    if (pendingOperation) return pendingOperation;

    const operation = this.stopContainerById(normalizedId).finally(() => {
      this.stopOperations.delete(normalizedId);
    });
    this.stopOperations.set(normalizedId, operation);
    return operation;
  }

  private async stopContainerById(
    normalizedId: string,
  ): Promise<IServiceResponse<boolean, DockerError>> {
    try {
      const container = this.docker.getContainer(normalizedId);

      let runtimeKey: string | undefined;
      let userId: string | undefined;
      try {
        const info = await container.inspect();
        runtimeKey = info.Config.Labels?.['project.runtime'];
        userId = info.Config.Labels?.['project.user'];
      } catch (error) {
        this.logger.error(
          `Container inspection failed: ${getErrorMessage(error)}`,
        );
      }

      try {
        await container.stop({ t: 3 });
      } catch (stopError) {
        if (isDockerNotFound(stopError)) {
          throw stopError;
        }
        this.logger.warn(
          `Container stop failed; forcing removal: ${getErrorMessage(stopError)}`,
        );
      }

      await container.remove({ force: true, v: true });

      if (
        userId &&
        runtimeKey &&
        /^[a-zA-Z0-9_.-]+$/.test(userId) &&
        /^[a-f0-9]{40}$/.test(runtimeKey)
      ) {
        await this.workspace.deleteRuntime(userId, runtimeKey);
        this.coordinator.releaseRuntimeSlot(runtimeKey);
      }

      this.sessionStore.dispose(normalizedId);
      this.coordinator.clearCleanupTimer(normalizedId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Container removal failed: ${getErrorMessage(error)}`);
      return {
        success: false,
        error: isDockerNotFound(error)
          ? DockerError.CONTAINER_NOT_FOUND
          : DockerError.CONTAINER_NOT_RUNNING,
      };
    }
  }

  private async startInteractiveSession(
    container: Docker.Container,
    startCommand: string[],
    tty = false,
  ): Promise<Omit<IContainerResult, 'containerId' | 'imageName'>> {
    return this.interactiveSession.start(container, startCommand, tty, () => {
      void this.stopContainer(container.id);
    });
  }

  private async createAndStartContainer(
    imageName: string,
    project: IProject,
    runtimeKey: string,
    memoryLimitMb?: number,
  ): Promise<Docker.Container> {
    const portMapping = getPortMapping(project.meta.language);
    const memoryBytes = resolveMemoryLimitMb(memoryLimitMb) * 1024 * 1024;

    try {
      const containerName = `icodeme-runtime-${runtimeKey}`;
      const existingContainers = await this.docker.listContainers({
        all: true,
        filters: {
          name: [containerName],
        },
      });

      const matchingContainers = existingContainers.filter((candidate) =>
        candidate.Names?.includes(`/${containerName}`),
      );
      const oldImageIds = new Set<string>();

      for (const candidate of matchingContainers) {
        const existingContainerId = candidate.Id;
        const existingContainer = this.docker.getContainer(existingContainerId);
        await this.assertOwner(existingContainerId, project.userId);
        try {
          const info = await existingContainer.inspect();
          if (
            info.Config.Labels?.['project.user'] !== project.userId ||
            info.Config.Labels?.['project.runtime'] !== runtimeKey
          )
            throw new NotFoundException('Container not found');
          if (info.Image) oldImageIds.add(info.Image);
        } catch (error) {
          this.logger.error(
            `Existing container inspection failed: ${getErrorMessage(error)}`,
          );
          throw error;
        }

        this.sessionStore.dispose(existingContainerId);
        this.coordinator.clearCleanupTimer(existingContainerId);
        if (candidate.State === 'running') {
          try {
            await existingContainer.stop({ t: 3 });
          } catch (error) {
            if (!isDockerNotFound(error)) throw error;
          }
        }

        await existingContainer.remove({ force: true, v: true });
      }

      const container = await this.docker.createContainer({
        Image: imageName,
        name: containerName,
        ExposedPorts: {
          [`${portMapping.container}/tcp`]: {},
        },
        HostConfig: {
          PortBindings: {
            [`${portMapping.container}/tcp`]: [
              {
                HostPort: portMapping.host.toString(),
              },
            ],
          },
          RestartPolicy: {
            Name: 'no',
          },
          Memory: memoryBytes,
          MemorySwap: memoryBytes,
          CpuShares: 256,
          NanoCpus: 500_000_000,
          PidsLimit: 128,
        },
        Env: [
          `PROJECT_ID=${project._id}`,
          `PROJECT_NAME=${project.meta.name}`,
          `NODE_ENV=production`,
        ],
        Labels: {
          'project.managed': 'icodeme',
          'project.id': project._id,
          'project.user': project.userId,
          'project.name': project.meta.name,
          'project.runtime': runtimeKey,
        },
      });

      await container.start();

      const currentImageId = (await container.inspect()).Image;
      for (const oldImageId of oldImageIds) {
        if (oldImageId !== currentImageId) {
          await this.imageService.removeImage(this.docker, oldImageId);
        }
      }
      await this.imageService.removeObsoleteRuntimeImages(
        this.docker,
        runtimeKey,
        imageName,
      );

      return container;
    } catch (error) {
      this.logger.error(`Container creation failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  private scheduleCleanup(containerId: string): void {
    this.coordinator.scheduleCleanup(containerId, () => {
      void this.stopContainer(containerId);
    });
  }
}
