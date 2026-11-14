import { BaseEntity } from '@core/types/base-entity.abstract';

export interface IConfirmationCode extends BaseEntity {
  userId: string;
  codeHash: string;
  purpose: 'email' | 'reset';
  expiresAt: Date;
  attempts: number;
}

export const ConfirmationCodeKey = 'confirmations_code';
