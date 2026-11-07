import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { FileNode, IProject } from '@models/project';
import { BaseFileStorage } from '@core/storage';
import * as path from 'path';
import * as fs from 'fs';
import Docker from 'dockerode';
import * as tar from 'tar-fs';
import { Readable } from 'stream';
import { IServiceResponse } from '@core/types/Response.type';
import { DockerError } from './types/Error.types';
import { IContainerResult } from './types/DockerResult.types';

@Injectable()
export class DockerService {
  private path = 'data/containers';
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

  private docker: Docker;
  private sessions: Map<
    string,
    {
      container: Docker.Container;
      exec: any;
      stream: any;
      output: string;
      consumed: number;
      ended: boolean;
    }
  > = new Map();
  private containerBaseImages: Map<string, string> = new Map();

  constructor(private fileStorage: BaseFileStorage) {
    this.docker = new Docker({
      socketPath: '/var/run/docker.sock',
    });
  }

  async createAndRunContainer(
    project: IProject,
    dockerfileContent: string,
    startCommand: string[],
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    const basePath = path.join(this.path, project.userId, project.meta.name);

    if (project.dir) {
      try {
        const dockerfilePath = path.join(basePath, 'Dockerfile');

        this.fileStorage.createDir(basePath);
        this.createNodeRecursive(project.dir, basePath);
        this.fileStorage.writeFile(dockerfilePath, dockerfileContent);
      } catch (error) {
        return { success: false, error: DockerError.NOT_CREATED_DIR };
      }
    }

    const imageName = `project-${project._id}-${Date.now()}`;
    const baseImageName = DockerService.extractBaseImageName(dockerfileContent);

    try {
      await this.buildImage(basePath, imageName);
      const container = await this.createAndStartContainer(
        imageName,
        project,
        baseImageName,
      );

      const result = await this.startInteractiveSession(container, startCommand);

      return {
        success: true,
        data: {
          containerId: container.id,
          imageName: imageName,
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
      console.error('Error:', error);
      return { success: false, error: DockerError.IMAGE_NOT_BUILD };
    }
  }

  async sendInputToContainer(
    containerId: string,
    input: string,
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    const session = this.sessions.get(containerId);
    if (!session) {
      return { success: false, error: DockerError.CONTAINER_NOT_FOUND };
    }

    try {
      const fromIndex = session.consumed;

      if (session.stream.writable) {
        session.stream.write(input + '\n');
      }

      const rawOutput = session.stream.writable
        ? await this.waitForOutput(session, fromIndex, 5000)
        : session.output.slice(fromIndex);
      const output = rawOutput.trim();
      session.consumed = session.output.length;

      const container = session.container;
      const [execState, finalStatus] = await Promise.all([
        this.getExecRunState(session),
        container.inspect(),
      ]);
      const requiresInput = this.computeRequiresInput(
        session.output,
        execState.running,
      );

      return {
        success: true,
        data: {
          containerId: containerId,
          imageName: '',
          status: execState.running ? finalStatus.State.Status : 'exited',
          running: String(execState.running),
          exitCode: String(execState.exitCode ?? 0),
          output: output,
          requiresInput: requiresInput,
          startedAt: finalStatus.State.StartedAt,
          finishedAt: finalStatus.State.FinishedAt,
        },
      };
    } catch (error) {
      console.error('[sendInput] error:', error);
      return { success: false, error: DockerError.CONTAINER_NOT_RUNNING };
    }
  }

  async stopContainer(
    containerId: string,
  ): Promise<IServiceResponse<boolean, DockerError>> {
    const normalizedId = this.normalizeContainerId(containerId);
    if (!normalizedId) {
      console.error(
        '[stopContainer] Invalid container id:',
        JSON.stringify(containerId),
      );
      return { success: false, error: DockerError.INVALID_CONTAINER_ID };
    }

    try {
      const container = this.docker.getContainer(normalizedId);

      let imageName: string | undefined;
      try {
        const info = await container.inspect();
        imageName = info.Config && info.Config.Image;
      } catch (error) {
        console.error(
          '[stopContainer] inspect failed:',
          (error as any)?.message || error,
        );
      }

      try {
        await container.stop({ t: 3 });
      } catch (stopError: any) {
        if (this.isContainerMissing(stopError)) {
          throw stopError;
        }
        console.error(
          '[stopContainer] stop failed (forcing remove):',
          stopError?.message || stopError,
        );
      }

      await container.remove({ force: true, v: true });

      if (imageName) {
        await this.removeImage(imageName);
      }

      const baseImageName = this.containerBaseImages.get(normalizedId);
      this.containerBaseImages.delete(normalizedId);
      if (baseImageName && baseImageName !== imageName) {
        await this.removeImage(baseImageName);
      }

      this.sessions.delete(containerId);
      return { success: true };
    } catch (error: any) {
      console.error('[stopContainer] Error:', error?.message || error);
      return {
        success: false,
        error: this.isContainerMissing(error)
          ? DockerError.CONTAINER_NOT_FOUND
          : DockerError.CONTAINER_NOT_RUNNING,
      };
    }
  }

  private async removeImage(imageName: string): Promise<void> {
    if (!imageName) {
      return;
    }

    try {
      const image = this.docker.getImage(imageName);
      await image.remove({ force: true });
      console.log('[removeImage] removed image:', imageName);
    } catch (error: any) {
      console.error(
        '[removeImage] failed to remove image',
        imageName,
        '->',
        error?.message || error,
      );
    }
  }

  private static extractBaseImageName(dockerfileContent: string): string {
    const fromMatch = dockerfileContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^FROM\s+/i.test(line))
      .pop();
    if (!fromMatch) {
      return '';
    }

    const tokens = fromMatch.split(/\s+/);
    let image = '';
    let skipNext = false;
    for (const token of tokens) {
      if (token === '--platform' || token.startsWith('--platform=')) {
        if (token === '--platform') {
          skipNext = true;
        }
        continue;
      }
      if (skipNext) {
        skipNext = false;
        continue;
      }
      if (/^FROM$/i.test(token)) {
        continue;
      }
      image = token;
      break;
    }

    return image.replace(/\s+AS\s+[\w-]+$/i, '');
  }

  private isContainerMissing(error: any): boolean {
    return (
      error?.statusCode === 404 ||
      (error?.json && error.json.statusCode === 404) ||
      /no such container/i.test(error?.message || '')
    );
  }

  private normalizeContainerId(containerId: any): string {
    const raw = typeof containerId === 'string' ? containerId : '';
    const id = raw.trim();

    if (/^[0-9a-fA-F]{12,64}$/.test(id)) {
      return id;
    }

    return '';
  }

  private waitForOutput(
    session: { stream: any; output: string },
    fromIndex: number,
    timeoutMs: number,
  ): Promise<string> {
    return new Promise((resolve) => {
      let settled = false;
      let settleTimeout: NodeJS.Timeout | null = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(overallTimeout);
        if (settleTimeout) clearTimeout(settleTimeout);
        session.stream.removeListener('data', onData);
        session.stream.removeListener('end', onEnd);
        resolve(session.output.slice(fromIndex));
      };

      const onData = () => {
        if (settleTimeout) clearTimeout(settleTimeout);
        settleTimeout = setTimeout(finish, 120);
      };
      const onEnd = () => finish();

      session.stream.on('data', onData);
      session.stream.on('end', onEnd);

      const overallTimeout = setTimeout(finish, timeoutMs);
    });
  }

  private async startInteractiveSession(
    container: Docker.Container,
    startCommand: string[],
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      container.exec(
        {
          Cmd: startCommand,
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          Tty: false,
        },
        (err, exec) => {
          if (err) {
            reject(err);
            return;
          }

          exec.start({ hijack: true, stdin: true }, (err, stream) => {
            if (err) {
              reject(err);
              return;
            }

            const session = {
              container,
              exec,
              stream,
              output: '',
              consumed: 0,
              ended: false,
            };

            this.sessions.set(container.id, session);

            const decoder = this.createOutputDecoder((text) => {
              session.output += text;
            });

            stream.on('data', (chunk) => decoder(chunk));

            const resolveSession = async () => {
              try {
                const [info, execState] = await Promise.all([
                  container.inspect(),
                  this.getExecRunState(session),
                ]);
                const output = session.output.trim();
                session.consumed = session.output.length;
                return resolve({
                  output,
                  requiresInput: this.computeRequiresInput(
                    session.output,
                    execState.running,
                  ),
                  status: execState.running ? info.State.Status : 'exited',
                  running: String(execState.running),
                  exitCode: String(execState.exitCode ?? 0),
                  startedAt: info.State.StartedAt,
                  finishedAt: info.State.FinishedAt,
                });
              } catch (e) {
                reject(e);
              }
            };

            stream.on('end', () => {
              session.ended = true;
              resolveSession();
            });

            stream.on('close', () => {
              session.ended = true;
            });

            stream.on('error', (err) => {
              reject(err);
            });

            setTimeout(resolveSession, 2000);
          });
        },
      );
    });
  }

  private async getExecRunState(session: {
    exec: any;
    ended: boolean;
  }): Promise<{ running: boolean; exitCode: number | null }> {
    let running = !session.ended;
    let exitCode: number | null = null;

    try {
      const execInfo = await session.exec.inspect();
      running = !!execInfo.Running && !session.ended;
      exitCode = running ? null : (execInfo.ExitCode ?? 0);
    } catch (error) {
      running = !session.ended;
      exitCode = running ? null : 0;
    }

    return { running, exitCode };
  }

  private computeRequiresInput(output: string, running: boolean): boolean {
    if (!running) {
      return false;
    }

    const lastLine = (
      output.split('\n').filter(Boolean).pop() || ''
    ).toLowerCase();
    const hasPrompt =
      lastLine.includes('?') ||
      lastLine.includes('enter') ||
      lastLine.includes('input');

    return hasPrompt || !output.endsWith('\n');
  }

  private createOutputDecoder(
    onText: (text: string) => void,
  ): (chunk: Buffer) => void {
    let pending = Buffer.alloc(0);
    let framed = true;

    return (chunk) => {
      pending = Buffer.concat([pending, chunk]);

      if (framed) {
        while (pending.length >= 8) {
          const streamType = pending.readUInt8(0);
          const length = pending.readUInt32BE(4);
          const validHeader =
            (streamType === 1 || streamType === 2) &&
            pending.readUInt8(1) === 0 &&
            pending.readUInt8(2) === 0 &&
            pending.readUInt8(3) === 0;

          if (!validHeader || pending.length < 8 + length) {
            if (!validHeader) {
              framed = false;
            }
            break;
          }

          onText(pending.slice(8, 8 + length).toString('utf-8'));
          pending = pending.slice(8 + length);
        }
      }

      if (!framed && pending.length > 0) {
        onText(pending.toString('utf-8'));
        pending = Buffer.alloc(0);
      }
    };
  }

  private createNodeRecursive(nodes: FileNode[], currentPath: string): void {
    try {
      for (const node of nodes) {
        const nodePath = path.join(currentPath, node.name);

        if (node.type === 'folder') {
          this.fileStorage.createDir(nodePath);

          if (node.children && node.children.length > 0) {
            this.createNodeRecursive(node.children, nodePath);
          }
        } else {
          this.fileStorage.writeFile(nodePath, node.content || '');
        }
      }
    } catch (error) {
      console.error(`[createNodeRecursive] Error processing nodes:`, error);
      throw error;
    }
  }

  private async buildImage(
    projectPath: string,
    imageName: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(projectPath)) {
          console.error(`[buildImage] Project dir not found: ${projectPath}`);
          return reject(new Error(`Project dir not found: ${projectPath}`));
        }

        const tarStream = this.createTarStream(projectPath);

        this.docker.buildImage(
          tarStream,
          {
            t: imageName,
            rm: true,
            nocache: false,
            pull: 'missing',
          },
          (err, stream) => {
            if (err) {
              return reject(err);
            }

            if (!stream) {
              console.error('[buildImage] No stream returned from Docker');
              return reject(new Error('No stream returned from build'));
            }

            let buildError = '';

            this.docker.modem.followProgress(
              stream,
              (err, output) => {
                if (err) {
                  console.error('[buildImage] progress error:', err);
                  return reject(err);
                }

                const failedEvents = (output || []).filter(
                  (event: any) =>
                    event && (event.error || event.errorDetail?.message),
                );

                if (failedEvents.length > 0 || buildError) {
                  const first = failedEvents[0] || {};
                  const message =
                    first.error ||
                    first.errorDetail?.message ||
                    buildError ||
                    'Docker build failed';
                  console.error('[buildImage] build failed:', message);
                  return reject(new Error(message));
                }

                resolve();
              },
              (event) => {
                if (event?.errorDetail?.message) {
                  buildError = event.errorDetail.message;
                } else if (event?.error) {
                  buildError = event.error;
                } else if (event?.errorDetail) {
                  buildError = String(event.errorDetail);
                }
              },
            );
          },
        );
      } catch (error) {
        console.error('[buildImage] Unexpected error:', error);
        reject(error);
      }
    });
  }

  private createTarStream(projectPath: string): Readable {
    try {
      const pack = tar.pack(projectPath);

      pack.on('error', (error) => {
        console.error('[createTarStream] Tar stream error:', error);
      });

      return pack;
    } catch (error) {
      throw error;
    }
  }

  private async createAndStartContainer(
    imageName: string,
    project: IProject,
    baseImageName?: string,
  ): Promise<Docker.Container> {
    const portMapping = this.getPortMapping(project.meta.language);

    try {
      const containerName = `project-${project.userId}-${project._id}`;
      const existingContainers = await this.docker.listContainers({
        all: true,
        filters: {
          name: [containerName],
        },
      });

      if (existingContainers.length > 0) {
        const existingContainerId = existingContainers[0].Id;
        const existingContainer = this.docker.getContainer(existingContainerId);
        await this.assertOwner(existingContainerId, project.userId);
        const state = existingContainers[0].State;

        let oldImage: string | undefined;
        try {
          const info = await existingContainer.inspect();
          if (info.Config.Labels?.['project.user'] !== project.userId)
            throw new NotFoundException('Container not found');
          oldImage = info.Config && info.Config.Image;
        } catch (error) {
          console.error(
            '[createAndStartContainer] inspect failed:',
            (error as any)?.message || error,
          );
        }

        const oldBaseImage = this.containerBaseImages.get(existingContainerId);
        this.containerBaseImages.delete(existingContainerId);

        if (state === 'running') {
          await existingContainer.stop();
        }

        await existingContainer.remove({ force: true });

        if (oldImage) {
          await this.removeImage(oldImage);
        }

        if (oldBaseImage) {
          await this.removeImage(oldBaseImage);
        }
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
            Name: 'unless-stopped',
          },
          Memory: 512 * 1024 * 1024,
          MemorySwap: 512 * 1024 * 1024,
          CpuShares: 512,
        },
        Env: [
          `PROJECT_ID=${project._id}`,
          `PROJECT_NAME=${project.meta.name}`,
          `NODE_ENV=production`,
        ],
        Labels: {
          'project.id': project._id,
          'project.user': project.userId,
          'project.name': project.meta.name,
        },
      });

      await container.start();

      if (baseImageName) {
        this.containerBaseImages.set(container.id, baseImageName);
      }

      return container;
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
  }

  private getPortMapping(language: string): {
    container: number;
    host: number;
  } {
    const ports: Record<string, { container: number; host: number }> = {
      node: { container: 3000, host: 3000 },
      python: { container: 5000, host: 5001 },
      go: { container: 8080, host: 8080 },
      static: { container: 80, host: 8080 },
    };

    const hostPort = 30000 + Math.floor(Math.random() * 1000);

    const mapping = {
      container: ports[language]?.container || 3000,
      host: hostPort,
    };

    return mapping;
  }
}
