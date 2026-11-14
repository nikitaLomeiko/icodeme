import { Injectable, Logger } from '@nestjs/common';
import type Docker from 'dockerode';
import type WebSocket from 'ws';
import type { IServiceResponse } from '@core/types/response.type';
import { getErrorMessage, toError } from '@core/helpers/error-message';
import { DockerError } from '../types/docker-error.types';
import type { IContainerResult } from '../types/docker-result.types';
import {
  computeRequiresInput,
  createOutputDecoder,
} from '../utils/docker-runtime.utils';
import { DockerSessionStore, type DockerSession } from './docker-session.store';

type SessionResult = Omit<IContainerResult, 'containerId' | 'imageName'>;

@Injectable()
export class DockerInteractiveSessionService {
  private readonly logger = new Logger(DockerInteractiveSessionService.name);

  constructor(private readonly sessionStore: DockerSessionStore) {}

  start(
    container: Docker.Container,
    startCommand: string[],
    tty: boolean,
    onTerminalExit: () => void,
  ): Promise<SessionResult> {
    return new Promise((resolve, reject) => {
      container.exec(
        {
          Cmd: startCommand,
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          Tty: tty,
          ...(tty
            ? { Env: ['TERM=xterm-256color', 'COLORTERM=truecolor'] }
            : {}),
        },
        (execError, exec) => {
          if (execError || !exec) {
            reject(toError(execError ?? 'Docker exec was not created'));
            return;
          }

          exec.start({ hijack: true, stdin: true }, (startError, stream) => {
            if (startError || !stream) {
              reject(
                toError(startError ?? 'Docker exec stream was not created'),
              );
              return;
            }

            const session: DockerSession = {
              container,
              exec,
              stream,
              output: '',
              consumed: 0,
              ended: false,
              tty,
            };
            this.sessionStore.set(container.id, session);

            const appendOutput = (text: string): void => {
              session.output += text;
              if (session.output.length > 1024 * 1024) {
                session.output = session.output.slice(-1024 * 1024);
                session.consumed = Math.min(
                  session.consumed,
                  session.output.length,
                );
              }
            };
            const decoder = createOutputDecoder(appendOutput);

            stream.on('data', (chunk: Buffer) => {
              if (tty) {
                const text = chunk.toString('utf-8');
                appendOutput(text);
                if (session.socket?.readyState === 1) session.socket.send(text);
              } else {
                decoder(chunk);
              }
            });

            const resolveSession = async (): Promise<void> => {
              try {
                const [info, execState] = await Promise.all([
                  container.inspect(),
                  this.getExecRunState(session),
                ]);
                session.consumed = session.output.length;
                resolve({
                  output: session.output.trim(),
                  requiresInput: computeRequiresInput(
                    session.output,
                    execState.running,
                  ),
                  status: execState.running ? info.State.Status : 'exited',
                  running: String(execState.running),
                  exitCode: String(execState.exitCode ?? 0),
                  startedAt: info.State.StartedAt,
                  finishedAt: info.State.FinishedAt,
                });
              } catch (error) {
                reject(toError(error));
              }
            };

            const handleSessionEnd = (): void => {
              if (session.ended) return;
              session.ended = true;
              if (tty) session.socket?.close(1000, 'Shell exited');
              void resolveSession().finally(() => {
                if (tty) onTerminalExit();
              });
            };
            stream.once('end', handleSessionEnd);
            stream.once('close', handleSessionEnd);
            stream.on('error', (error: unknown) => reject(toError(error)));
            setTimeout(() => void resolveSession(), 2000);
          });
        },
      );
    });
  }

  async sendInput(
    containerId: string,
    input: string,
    onActivity: () => void,
  ): Promise<IServiceResponse<IContainerResult, DockerError>> {
    const session = this.sessionStore.get(containerId);
    if (!session) {
      return { success: false, error: DockerError.CONTAINER_NOT_FOUND };
    }

    try {
      onActivity();
      const fromIndex = session.consumed;
      if (session.stream.writable) session.stream.write(`${input}\n`);

      const rawOutput = session.stream.writable
        ? await this.sessionStore.waitForOutput(session, fromIndex, 5000)
        : session.output.slice(fromIndex);
      session.consumed = session.output.length;
      const [execState, containerInfo] = await Promise.all([
        this.getExecRunState(session),
        session.container.inspect(),
      ]);

      return {
        success: true,
        data: {
          containerId,
          imageName: '',
          status: execState.running ? containerInfo.State.Status : 'exited',
          running: String(execState.running),
          exitCode: String(execState.exitCode ?? 0),
          output: rawOutput.trim(),
          requiresInput: computeRequiresInput(
            session.output,
            execState.running,
          ),
          startedAt: containerInfo.State.StartedAt,
          finishedAt: containerInfo.State.FinishedAt,
        },
      };
    } catch (error) {
      this.logger.error(
        `Sending container input failed: ${getErrorMessage(error)}`,
      );
      return { success: false, error: DockerError.CONTAINER_NOT_RUNNING };
    }
  }

  attachSocket(containerId: string, socket: WebSocket): boolean {
    return this.sessionStore.attachSocket(containerId, socket);
  }

  private async getExecRunState(
    session: Pick<DockerSession, 'exec' | 'ended'>,
  ): Promise<{ running: boolean; exitCode: number | null }> {
    try {
      const execInfo = await session.exec.inspect();
      const running = Boolean(execInfo.Running) && !session.ended;
      return {
        running,
        exitCode: running ? null : (execInfo.ExitCode ?? 0),
      };
    } catch {
      return {
        running: !session.ended,
        exitCode: session.ended ? 0 : null,
      };
    }
  }
}
