import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  NotFoundException,
  OnModuleInit,
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
  isDockerNotFound,
  normalizeContainerId,
  resolveMemoryLimitMb,
  resolveRuntimeTtl,
} from '../utils/docker-runtime.utils';

@Injectable()
export class DockerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DockerService.name);
  private readonly timeLimitedContainers = new Set<string>();
  private housekeepingTimer?: NodeJS.Timeout;
  private readonly stopOperations = new Map<
    string,
    Promise<IServiceResponse<boolean, DockerError>>
  >();
  private readonly docker: Docker;
  async assertOwner(containerId: string, userId: string): Promise<void> {
    if (typeof containerId !== 'string' || !/^[a-f0-9]{64}$/.test(containerId))
      throw new BadRequestException('Некорректный идентификатор контейнера');
    try {
      const info = await this.docker.getContainer(containerId).inspect();
      if (info.Config.Labels?.['project.user'] !== userId) throw new Error();
    } catch {
      throw new NotFoundException('Контейнер не найден');
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
      throw new BadRequestException('Некорректный путь проекта');
    let count = 0;
    let bytes = 0;
    const walk = (nodes: FileNode[], depth: number) => {
      if (!Array.isArray(nodes) || depth > 20)
        throw new BadRequestException('Некорректная структура проекта');
      for (const node of nodes) {
        if (
          ++count > 1000 ||
          !safe(node.name) ||
          node.name.toLowerCase() === 'dockerfile'
        )
          throw new BadRequestException('Некорректное имя файла');
        bytes +=
          typeof node.content === 'string'
            ? Buffer.byteLength(node.content)
            : 0;
        if (bytes > 5 * 1024 * 1024)
          throw new BadRequestException('Проект слишком большой');
        if (node.type === 'folder') walk(node.children || [], depth + 1);
        else if (node.type !== 'file' || typeof node.content !== 'string')
          throw new BadRequestException('Некорректный файл');
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

  async onModuleInit(): Promise<void> {
    await this.housekeeping();
    this.housekeepingTimer = setInterval(
      () => void this.housekeeping(),
      60 * 60 * 1000,
    );
    this.housekeepingTimer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.housekeepingTimer) clearInterval(this.housekeepingTimer);
  }

  private async housekeeping(): Promise<void> {
    try {
      const stale = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['project.managed=icodeme'],
          status: ['exited', 'dead', 'created'],
        },
      });
      await Promise.all(
        stale.map((container) => this.stopContainer(container.Id)),
      );
      const running = await this.docker.listContainers({
        all: false,
        filters: { label: ['project.managed=icodeme'] },
      });
      for (const container of running) {
        const info = await this.docker.getContainer(container.Id).inspect();
        if (info.Config.Labels?.['project.timeLimited'] === 'true')
          this.timeLimitedContainers.add(container.Id);
        const configuredDeadline = Number(
          info.Config.Labels?.['project.deadline'],
        );
        const createdAt = Date.parse(info.Created);
        const deadline =
          Number.isFinite(configuredDeadline) && configuredDeadline > 0
            ? configuredDeadline
            : createdAt + resolveRuntimeTtl();
        if (!Number.isFinite(deadline) || deadline <= Date.now())
          void this.stopContainer(container.Id);
        else this.scheduleCleanup(container.Id, deadline - Date.now());
      }
      await this.imageService.removeOrphanedRuntimeImages(this.docker);
      await this.workspace.pruneOrphans(
        new Set(
          running
            .map((container) => container.Labels?.['project.runtime'])
            .filter((key): key is string => Boolean(key)),
        ),
      );
    } catch (error) {
      this.logger.warn(
        `Docker startup cleanup failed: ${getErrorMessage(error)}`,
      );
    }
  }

  async createAndRunContainer(
    project: IProject,
    dockerfileContent: string,
    startCommand: string[],
    stepId: string,
    memoryLimitMb?: number,
    terminal = false,
    timeLimitMs?: number,
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    const runtimeKey = createRuntimeKey(project.userId, stepId);
    const executionLimitMs =
      Number.isFinite(timeLimitMs) && timeLimitMs !== undefined
        ? Math.max(1000, Math.min(timeLimitMs, 300000))
        : undefined;

    return this.coordinator.withRuntimeLock(runtimeKey, async () => {
      const basePath = this.workspace.getRuntimePath(
        project.userId,
        runtimeKey,
      );
      const sourceHash = createSourceHash(project.dir, dockerfileContent);
      const imageName = `icodeme-runtime-${runtimeKey}-${sourceHash}:latest`;
      let reservedSlot = false;
      let container: Docker.Container | null = null;
      let builtImage = false;
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
          builtImage = true;
        }
        container = await this.createAndStartContainer(
          imageName,
          project,
          runtimeKey,
          memoryLimitMb,
          executionLimitMs,
        );
        this.coordinator.releaseRuntimeSlot(runtimeKey);
        reservedSlot = false;
        if (executionLimitMs !== undefined)
          this.timeLimitedContainers.add(container.id);
        this.scheduleCleanup(container.id, executionLimitMs);
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
        await this.workspace
          .deleteRuntime(project.userId, runtimeKey)
          .catch((cleanupError: unknown) =>
            this.logger.warn(
              `Workspace cleanup failed: ${getErrorMessage(cleanupError)}`,
            ),
          );
        if (builtImage)
          await this.imageService
            .removeImageIfUnused(this.docker, imageName)
            .catch((cleanupError: unknown) =>
              this.logger.warn(
                `Image cleanup failed: ${getErrorMessage(cleanupError)}`,
              ),
            );
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
    timedOut = false,
  ): Promise<IServiceResponse<boolean, DockerError>> {
    const normalizedId = normalizeContainerId(containerId);
    if (!normalizedId) {
      this.logger.warn(`Invalid container id: ${JSON.stringify(containerId)}`);
      return { success: false, error: DockerError.INVALID_CONTAINER_ID };
    }

    const pendingOperation = this.stopOperations.get(normalizedId);
    if (pendingOperation) return pendingOperation;

    const operation = this.stopContainerById(normalizedId, timedOut).finally(
      () => {
        this.stopOperations.delete(normalizedId);
      },
    );
    this.stopOperations.set(normalizedId, operation);
    return operation;
  }

  private async stopContainerById(
    normalizedId: string,
    timedOut: boolean,
  ): Promise<IServiceResponse<boolean, DockerError>> {
    try {
      const container = this.docker.getContainer(normalizedId);

      let runtimeKey: string | undefined;
      let userId: string | undefined;
      let imageId: string | undefined;
      try {
        const info = await container.inspect();
        runtimeKey = info.Config.Labels?.['project.runtime'];
        userId = info.Config.Labels?.['project.user'];
        imageId = info.Image;
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

      await this.removeContainer(container);
      if (imageId)
        await this.imageService
          .removeImageIfUnused(this.docker, imageId)
          .catch((cleanupError: unknown) =>
            this.logger.warn(
              `Image cleanup failed: ${getErrorMessage(cleanupError)}`,
            ),
          );

      if (
        userId &&
        runtimeKey &&
        /^[a-zA-Z0-9_.-]+$/.test(userId) &&
        /^[a-f0-9]{40}$/.test(runtimeKey)
      ) {
        await this.workspace.deleteRuntime(userId, runtimeKey);
        this.coordinator.releaseRuntimeSlot(runtimeKey);
      }

      this.sessionStore.dispose(normalizedId, timedOut);
      this.timeLimitedContainers.delete(normalizedId);
      this.coordinator.forgetRuntime(normalizedId);
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

  private async removeContainer(container: Docker.Container): Promise<void> {
    try {
      await container.remove({ force: true, v: true });
    } catch (error) {
      if (isDockerNotFound(error)) return;
      const status = (error as { statusCode?: unknown })?.statusCode;
      const message =
        typeof (error as { message?: unknown })?.message === 'string'
          ? (error as { message: string }).message
          : getErrorMessage(error);
      if (status !== 409 || !/removal .* already in progress/i.test(message))
        throw error;

      // Docker has accepted another removal request. Wait until its name is
      // released before replacing this runtime with a new container.
      for (let attempt = 0; attempt < 50; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        try {
          await container.inspect();
        } catch (inspectError) {
          if (isDockerNotFound(inspectError)) return;
          throw inspectError;
        }
      }
      throw new Error(
        `Timed out waiting for container removal: ${container.id}`,
      );
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
    timeLimitMs?: number,
  ): Promise<Docker.Container> {
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
        try {
          const info = await existingContainer.inspect();
          if (
            info.Config.Labels?.['project.user'] !== project.userId ||
            info.Config.Labels?.['project.runtime'] !== runtimeKey
          )
            throw new NotFoundException('Контейнер не найден');
          if (info.Image) oldImageIds.add(info.Image);
        } catch (error) {
          if (isDockerNotFound(error)) continue;
          this.logger.error(
            `Existing container inspection failed: ${getErrorMessage(error)}`,
          );
          throw error;
        }

        this.sessionStore.dispose(existingContainerId);
        this.timeLimitedContainers.delete(existingContainerId);
        this.coordinator.forgetRuntime(existingContainerId);
        if (candidate.State === 'running') {
          try {
            await existingContainer.stop({ t: 3 });
          } catch (error) {
            if (!isDockerNotFound(error)) throw error;
          }
        }

        await this.removeContainer(existingContainer);
      }

      const container = await this.docker.createContainer({
        Image: imageName,
        name: containerName,
        User: '10001:10001',
        HostConfig: {
          NetworkMode: 'none',
          CapDrop: ['ALL'],
          SecurityOpt: ['no-new-privileges:true'],
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
          'project.timeLimited': String(timeLimitMs !== undefined),
          'project.deadline': String(
            Date.now() +
              (Number.isFinite(timeLimitMs) && timeLimitMs !== undefined
                ? Math.max(1000, Math.min(timeLimitMs, 300000))
                : resolveRuntimeTtl()),
          ),
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

  private scheduleCleanup(containerId: string, timeLimitMs?: number): void {
    this.coordinator.scheduleCleanup(
      containerId,
      () => {
        void this.stopContainer(
          containerId,
          this.timeLimitedContainers.has(containerId),
        );
      },
      timeLimitMs,
    );
  }
}
