import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Db } from 'mongodb';
import { IAuthTokenPayload } from '@models/auth/AuthToken.model';
import { IRefreshToken, RefreshTokenKey } from '@models/auth';
import { IUser, UserKey } from '@models/user';
import config from '@core/config/jwt/jwt.config';
import { cookie } from '../helpers/Auth.http';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private db: Db) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => cookie(req, 'icodeme_access'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config().secret,
      algorithms: ['HS256'],
    });
  }
  async validate(payload: IAuthTokenPayload) {
    if (
      payload.type !== 'access' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    )
      throw new UnauthorizedException();
    const [user, session] = await Promise.all([
      this.db.collection<IUser>(UserKey).findOne({ _id: payload.sub }),
      this.db
        .collection<IRefreshToken>(RefreshTokenKey)
        .findOne({ _id: payload.sid, userId: payload.sub }),
    ]);
    if (
      !user?.isEmailConfirmed ||
      !session ||
      session.expiresAt <= new Date() ||
      payload.version !== (user.authVersion || 0) ||
      session.version !== payload.version
    )
      throw new UnauthorizedException();
    return { userId: user._id, email: user.email };
  }
}
