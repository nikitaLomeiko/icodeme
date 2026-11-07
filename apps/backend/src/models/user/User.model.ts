import { BaseEntity } from '@core/types/BaseEntity.abstract';

export interface IUser extends BaseEntity {
  authVersion?: number;
  resetTokenHash?: string;
  resetExpiresAt?: Date;
  name: string;
  email: string;
  password_hash?: string;
  isEmailConfirmed: boolean;
  isResetPassword: boolean;
  provider?: 'local' | 'google' | 'github' | 'telegram';
  googleId?: string;
  githubId?: string;
  telegramId?: string;
  picture?: string;
  username?: string;
}

export const UserKey = 'users';
