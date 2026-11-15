import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { WebSocket } from 'ws';
import { MongoServerError } from 'mongodb';
import { DockerTerminalGateway } from './docker-terminal.gateway';

describe('DockerTerminalGateway', () => {
  const previousOrigins = process.env.FRONTEND_ORIGINS;

  afterEach(() => {
    if (previousOrigins === undefined) delete process.env.FRONTEND_ORIGINS;
    else process.env.FRONTEND_ORIGINS = previousOrigins;
  });

  it('authenticates one-time tickets and proxies a full duplex websocket', async () => {
    process.env.FRONTEND_ORIGINS = 'http://localhost:5173';
    const ticket = {
      sub: 'user-1',
      containerId: 'a'.repeat(64),
      type: 'terminal-ws' as const,
      jti: 'ticket-1',
      exp: Math.floor(Date.now() / 1000) + 30,
    };
    let receivedInput = '';
    const dockerService = {
      assertOwner: jest.fn(async () => undefined),
      attachTerminalSocket: jest.fn((_id: string, socket: WebSocket) => {
        socket.on('message', (message) => {
          receivedInput = message.toString();
        });
        socket.send('screen-ready');
        return true;
      }),
    };
    const jwtService = {
      verifyAsync: jest.fn(async () => ticket),
    };
    const consumed = new Set<string>();
    const db = {
      collection: () => ({
        insertOne: async ({ _id }: { _id: string }) => {
          if (consumed.has(_id))
            throw new MongoServerError({
              code: 11000,
              errmsg: 'duplicate key',
            });
          consumed.add(_id);
        },
      }),
    };
    const gateway = new DockerTerminalGateway(
      dockerService as never,
      jwtService as never,
      db as never,
    );
    const server = createServer();
    gateway.attach(server);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const port = (server.address() as AddressInfo).port;
    const connect = () =>
      new WebSocket(
        `ws://127.0.0.1:${port}/api/ide/docker/terminal?ticket=valid-ticket`,
        { origin: 'http://localhost:5173' },
      );

    let client: WebSocket | undefined;
    let replay: WebSocket | undefined;
    try {
      client = connect();
      const screenPromise = new Promise<string>((resolve) => {
        client?.once('message', (message) => resolve(message.toString()));
      });
      await new Promise<void>((resolve, reject) => {
        client?.once('open', resolve);
        client?.once('error', reject);
      });
      const screen = await screenPromise;
      expect(screen).toBe('screen-ready');

      client.send(JSON.stringify({ type: 'input', data: 'btop' }));
      await new Promise<void>((resolve) => {
        const deadline = Date.now() + 1000;
        const check = () => {
          if (receivedInput || Date.now() >= deadline) resolve();
          else setTimeout(check, 5);
        };
        check();
      });
      expect(receivedInput).toBe(
        JSON.stringify({ type: 'input', data: 'btop' }),
      );
      const clientClosed = new Promise<void>((resolve) =>
        client?.once('close', () => resolve()),
      );
      client.close();
      await clientClosed;

      replay = connect();
      const replayError = await new Promise<Error>((resolve) => {
        replay?.once('error', resolve);
      });
      expect(replayError).toBeDefined();
      expect(dockerService.attachTerminalSocket).toHaveBeenCalledTimes(1);
    } finally {
      client?.close();
      replay?.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 10_000);
});
