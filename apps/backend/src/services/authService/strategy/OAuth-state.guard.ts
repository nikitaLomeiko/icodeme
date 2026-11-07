import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { randomBytes, timingSafeEqual } from 'crypto';
import { cookie, cookieOptions } from '../helpers/Auth.http';

function stateGuard(provider: string) {
  return class extends AuthGuard(provider) {
    getAuthenticateOptions(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const name = `icodeme_oauth_${provider}`;
      if (req.path.endsWith('/callback')) {
        const expected = cookie(req, name);
        const actual = req.query.state;
        res.clearCookie(name, cookieOptions());
        if (
          typeof actual !== 'string' ||
          !/^[a-f0-9]{64}$/.test(actual) ||
          expected.length !== 64 ||
          !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
        )
          throw new UnauthorizedException('Invalid OAuth state');
        return { session: false };
      }
      const state = randomBytes(32).toString('hex');
      res.cookie(name, state, {
        ...cookieOptions(),
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
      });
      return { state, session: false };
    }
  };
}
@Injectable()
export class GoogleStateGuard extends stateGuard('google') {}
@Injectable()
export class GitHubStateGuard extends stateGuard('github') {}
