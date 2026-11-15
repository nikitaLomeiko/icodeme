import { Injectable } from '@nestjs/common';
import type Docker from 'dockerode';
import type { Duplex } from 'stream';
import type WebSocket from 'ws';

export interface DockerSession {
  container: Docker.Container;
  exec: Docker.Exec;
  stream: Duplex;
  output: string;
  consumed: number;
  ended: boolean;
  tty: boolean;
  socket?: WebSocket;
}

@Injectable()
export class DockerSessionStore {
  private readonly sessions = new Map<string, DockerSession>();

  get(containerId: string): DockerSession | undefined {
    return this.sessions.get(containerId);
  }

  set(containerId: string, session: DockerSession): void {
    this.sessions.set(containerId, session);
  }

  attachSocket(containerId: string, socket: WebSocket): boolean {
    const session = this.sessions.get(containerId);
    if (!session?.tty || session.ended) return false;

    if (session.socket && session.socket !== socket) {
      session.socket.close(4000, 'Terminal attached in another tab');
    }
    session.socket = socket;
    if (session.output) socket.send(session.output);

    socket.on('message', (message) => {
      if (session.socket !== socket || !session.stream.writable) return;
      try {
        const rawMessage =
          typeof message === 'string'
            ? message
            : Buffer.isBuffer(message)
              ? message.toString('utf8')
              : Buffer.from(message as ArrayBuffer).toString('utf8');
        const event: unknown = JSON.parse(rawMessage);
        if (!event || typeof event !== 'object') throw new Error();
        const payload = event as Record<string, unknown>;

        if (payload.type === 'input' && typeof payload.data === 'string') {
          session.stream.write(payload.data);
          return;
        }

        if (
          payload.type === 'resize' &&
          Number.isInteger(payload.cols) &&
          Number.isInteger(payload.rows) &&
          Number(payload.cols) >= 2 &&
          Number(payload.cols) <= 500 &&
          Number(payload.rows) >= 2 &&
          Number(payload.rows) <= 300
        ) {
          void session.exec
            .resize({ h: Number(payload.rows), w: Number(payload.cols) })
            .catch(() => undefined);
          return;
        }

        throw new Error();
      } catch {
        socket.close(1003, 'Invalid terminal message');
      }
    });
    socket.on('close', () => {
      if (session.socket === socket) session.socket = undefined;
    });
    return true;
  }

  waitForOutput(
    session: DockerSession,
    fromIndex: number,
    timeoutMs: number,
  ): Promise<string> {
    return new Promise((resolve) => {
      let settled = false;
      let settleTimeout: NodeJS.Timeout | undefined;

      const finish = (): void => {
        if (settled) return;
        settled = true;
        clearTimeout(overallTimeout);
        if (settleTimeout) clearTimeout(settleTimeout);
        session.stream.removeListener('data', onData);
        session.stream.removeListener('end', finish);
        resolve(session.output.slice(fromIndex));
      };
      const onData = (): void => {
        if (settleTimeout) clearTimeout(settleTimeout);
        settleTimeout = setTimeout(finish, 120);
      };

      session.stream.on('data', onData);
      session.stream.on('end', finish);
      const overallTimeout = setTimeout(finish, timeoutMs);
    });
  }

  dispose(containerId: string, timedOut = false): void {
    const session = this.sessions.get(containerId);
    if (session) {
      session.ended = true;
      session.socket?.close(
        timedOut ? 4008 : 1000,
        timedOut ? 'Execution time limit exceeded' : 'Container stopped',
      );
      session.stream.destroy();
    }
    this.sessions.delete(containerId);
  }
}
