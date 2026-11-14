import { IAuthTokenPayload } from '../models/auth-token.model';
import { IRefreshToken } from '../models/refresh-token.model';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { IUser } from '../models/user.model';
import { generateId } from '@core/helpers/generate-id';

export class JwtHelper {
  private jwtService: JwtService;
  constructor(service: JwtService) {
    this.jwtService = service;
  }

  generateAccessToken(user: IUser, sid: string): string {
    const payload: IAuthTokenPayload = {
      login: user.email,
      sub: user._id,
      type: 'access',
      sid,
      version: user.authVersion || 0,
    };

    return this.jwtService.sign(payload);
  }

  generateRefreshToken(user: IUser, ttl: number): IRefreshToken {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + ttl);

    const refreshToken: IRefreshToken = {
      _id: generateId(token),
      token,
      version: user.authVersion || 0,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
    };

    return refreshToken;
  }
}
