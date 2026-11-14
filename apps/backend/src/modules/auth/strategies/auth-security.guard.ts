import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Db } from 'mongodb';
import { createHash } from 'crypto';
import { requireOrigin } from '../helpers/auth.http';
import type { Request, Response } from 'express';
import { isRecord } from '@core/types/guards/is-record';

@Injectable()
export class AuthSecurityGuard implements CanActivate {
  constructor(private readonly db: Db) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method))
      requireOrigin(req);
    if (req.path.startsWith('/auth/') || req.path.startsWith('/oauth/')) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Referrer-Policy', 'no-referrer');
      const now = Date.now();
      const window = Math.floor(now / 60000);
      const limit =
        req.path === '/auth/verify-token' || req.path === '/auth/refresh'
          ? 120
          : 10;
      const identity = req.ip || req.socket.remoteAddress || 'unknown';
      const body = isRecord(req.body) ? req.body : {};
      const account =
        typeof body.email === 'string'
          ? body.email.toLowerCase()
          : typeof body.userId === 'string'
            ? body.userId
            : '';
      const identities = account
        ? [identity, `account:${account}`]
        : [identity];
      for (const rateLimitIdentity of identities) {
        const key = createHash('sha256')
          .update(`${rateLimitIdentity}:${req.path}:${window}`)
          .digest('hex');
        const record = await this.db
          .collection<{
            _id: string;
            count: number;
            expiresAt: Date;
          }>('authRateLimits')
          .findOneAndUpdate(
            { _id: key },
            {
              $inc: { count: 1 },
              $setOnInsert: { expiresAt: new Date(now + 120000) },
            },
            { upsert: true, returnDocument: 'after' },
          );
        if ((record?.count || 0) > limit) {
          res.setHeader('Retry-After', '60');
          throw new HttpException(
            'Слишком много попыток. Повторите через минуту.',
            429,
          );
        }
      }
    }
    return true;
  }
}
