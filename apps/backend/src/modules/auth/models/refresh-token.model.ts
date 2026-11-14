import { BaseEntity } from '@core/types/base-entity.abstract';

export interface IRefreshToken extends BaseEntity {
  token: string;
  version: number;
  userId: string;
  expiresAt: Date;
}

export const RefreshTokenKey = 'refreshTokens';
