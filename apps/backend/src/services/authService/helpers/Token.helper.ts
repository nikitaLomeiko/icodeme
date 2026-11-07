import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { BaseMongoRepository } from '@core/db';
import { IServiceResponse } from '@core/types/Response.type';
import { IUser } from '@models/user';
import { IRefreshToken, ITokenResponse, IUserIdResponse } from '@models/auth';
import { JwtHelper } from './Jwt.helper';
import config from '@core/config/jwt/jwt.config';
import { AuthError } from '../types';

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export const isRefreshToken = (token: unknown): token is string =>
  typeof token === 'string' && /^[a-f0-9]{128}$/.test(token);

export class TokenHelper {
  constructor(
    private jwtService: JwtService,
    private repositoryRefreshToken: BaseMongoRepository<IRefreshToken>,
    private repositoryUser: BaseMongoRepository<IUser>,
    private jwtHelper: JwtHelper,
  ) {}

  async refreshToken(
    token: string,
  ): Promise<IServiceResponse<ITokenResponse, AuthError>> {
    if (!isRefreshToken(token))
      return { success: false, error: AuthError.INVALID_TOKEN };
    const existing = await this.repositoryRefreshToken.findOne({
      token: hashToken(token),
    });
    if (!existing || existing.expiresAt <= new Date())
      return { success: false, error: AuthError.INVALID_TOKEN };
    const user = await this.repositoryUser.findOne({ _id: existing.userId });
    if (
      !user ||
      !user.isEmailConfirmed ||
      (user.authVersion || 0) !== existing.version
    )
      return { success: false, error: AuthError.INVALID_TOKEN };
    const next = this.jwtHelper.generateRefreshToken(user, config().ttl);
    // Compare-and-swap: exactly one request may rotate this secret. Keep the
    // session id and absolute expiry so activity cannot extend it forever.
    const rotated = await this.repositoryRefreshToken.update(
      { _id: existing._id, token: hashToken(token) },
      { token: hashToken(next.token) },
    );
    if (!rotated) return { success: false, error: AuthError.INVALID_TOKEN };
    return {
      success: true,
      data: {
        accessToken: this.jwtHelper.generateAccessToken(user, existing._id),
        refreshToken: next.token,
      },
    };
  }

  async validateTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<IServiceResponse<boolean, AuthError>> {
    if (typeof accessToken !== 'string' || !isRefreshToken(refreshToken))
      return { success: false, error: AuthError.INVALID_TOKEN };
    try {
      const payload = this.jwtService.verify(accessToken);
      const session = await this.repositoryRefreshToken.findOne({
        token: hashToken(refreshToken),
      });
      const user =
        session && (await this.repositoryUser.findOne({ _id: session.userId }));
      if (
        !session ||
        !user ||
        session.expiresAt <= new Date() ||
        payload.type !== 'access' ||
        payload.sid !== session._id ||
        payload.sub !== user._id ||
        payload.version !== (user.authVersion || 0)
      )
        return { success: false, error: AuthError.INVALID_TOKEN };
      return { success: true };
    } catch {
      return { success: false, error: AuthError.INVALID_TOKEN };
    }
  }

  async revoke(token: unknown): Promise<void> {
    if (isRefreshToken(token))
      await this.repositoryRefreshToken.delete({ token: hashToken(token) });
  }

  async issueTokens(
    user: IUser,
  ): Promise<IServiceResponse<ITokenResponse & IUserIdResponse, AuthError>> {
    const refresh = this.jwtHelper.generateRefreshToken(user, config().ttl);
    await this.repositoryRefreshToken.create({
      ...refresh,
      token: hashToken(refresh.token),
    });
    return {
      success: true,
      data: {
        accessToken: this.jwtHelper.generateAccessToken(user, refresh._id),
        refreshToken: refresh.token,
        userId: user._id,
      },
    };
  }
}
