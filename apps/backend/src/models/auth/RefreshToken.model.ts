import { BaseEntity } from '@core/types/BaseEntity.abstract';

export interface IRefreshToken extends BaseEntity {
  token: string;
  version: number;
  userId: string;
  expiresAt: Date;
}

export const RefreshTokenKey = 'refreshTokens';
