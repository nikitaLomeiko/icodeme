import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IncomingMessage, Server } from 'http';
import type { Duplex } from 'stream';
import { WebSocketServer } from 'ws';
import { allowedOrigins } from '@core/config/app/allowed-origins';
import { DockerService } from './services/docker.service';

interface ITerminalTicket {
  sub: string;
  containerId: string;
  type: 'terminal-ws';
  jti: string;
  exp: number;
}

@Injectable()
export class DockerTerminalGateway {
  private readonly logger = new Logger(DockerTerminalGateway.name);
  private readonly usedTickets = new Map<string, number>();

  constructor(
    private readonly dockerService: DockerService,
    private readonly jwtService: JwtService,
  ) {}

  attach(server: Server): void {
    const webSocketServer = new WebSocketServer({
      noServer: true,
      maxPayload: 16 * 1024,
    });

    server.on('upgrade', (request, socket, head) => {
      let url: URL;
      try {
        url = new URL(request.url || '/', `http://${request.headers.host}`);
      } catch {
        this.reject(socket, 400, 'Bad Request');
        return;
      }
      if (!url.pathname.replace(/\/+$/, '').endsWith('/ide/docker/terminal')) {
        this.reject(socket, 404, 'Not Found');
        return;
      }

      void this.handleUpgrade(webSocketServer, request, socket, head, url);
    });
  }

  private async handleUpgrade(
    webSocketServer: WebSocketServer,
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    url: URL,
  ): Promise<void> {
    const origin = request.headers.origin;
    if (!origin || !allowedOrigins().includes(origin)) {
      this.logger.warn(`Rejected untrusted origin: ${origin ?? 'missing'}`);
      this.reject(socket, 403, 'Forbidden');
      return;
    }

    const token = url.searchParams.get('ticket');
    if (!token) {
      this.logger.warn('Rejected connection without ticket');
      this.reject(socket, 401, 'Unauthorized');
      return;
    }

    try {
      const ticket = await this.jwtService.verifyAsync<ITerminalTicket>(token);
      if (
        ticket.type !== 'terminal-ws' ||
        typeof ticket.sub !== 'string' ||
        typeof ticket.containerId !== 'string' ||
        typeof ticket.jti !== 'string' ||
        ticket.exp * 1000 <= Date.now() ||
        this.consumeTicket(ticket.jti, ticket.exp * 1000)
      ) {
        this.logger.warn('Rejected invalid or reused ticket');
        this.reject(socket, 401, 'Unauthorized');
        return;
      }

      await this.dockerService.assertOwner(ticket.containerId, ticket.sub);
      webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        if (
          !this.dockerService.attachTerminalSocket(
            ticket.containerId,
            webSocket,
          )
        ) {
          this.logger.warn('Terminal session was not available for the socket');
          webSocket.close(4404, 'Terminal session not found');
          return;
        }
        webSocketServer.emit('connection', webSocket, request);
      });
    } catch (error) {
      this.logger.warn(
        `WebSocket handshake rejected: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      this.reject(socket, 401, 'Unauthorized');
    }
  }

  private consumeTicket(ticketId: string, expiresAt: number): boolean {
    const now = Date.now();
    for (const [id, expiry] of this.usedTickets) {
      if (expiry <= now) this.usedTickets.delete(id);
    }
    if (this.usedTickets.has(ticketId)) return true;
    this.usedTickets.set(ticketId, expiresAt);
    return false;
  }

  private reject(socket: Duplex, status: number, message: string): void {
    if (socket.destroyed) return;
    socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\n\r\n`);
    socket.destroy();
  }
}
