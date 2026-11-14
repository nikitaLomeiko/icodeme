import { BadRequestException } from '@nestjs/common';
import { isRecord } from '@core/types/guards/is-record';
import type { ITelegramAuthData } from '../types';

const allowedKeys = new Set([
  'id',
  'first_name',
  'last_name',
  'username',
  'photo_url',
  'auth_date',
  'hash',
]);

export const parseTelegramAuthData = (value: unknown): ITelegramAuthData => {
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => !allowedKeys.has(key))
  ) {
    throw invalidPayload();
  }

  const id = toRequiredString(value.id);
  const authDate = toRequiredString(value.auth_date);
  if (
    !id ||
    !authDate ||
    typeof value.first_name !== 'string' ||
    typeof value.hash !== 'string'
  ) {
    throw invalidPayload();
  }

  return {
    id,
    first_name: value.first_name,
    last_name: toOptionalString(value.last_name),
    username: toOptionalString(value.username),
    photo_url: toOptionalString(value.photo_url),
    auth_date: authDate,
    hash: value.hash,
  };
};

const toRequiredString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return String(value);
  }
  return undefined;
};

const toOptionalString = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw invalidPayload();
  return value;
};

const invalidPayload = (): BadRequestException =>
  new BadRequestException('Invalid Telegram payload');
