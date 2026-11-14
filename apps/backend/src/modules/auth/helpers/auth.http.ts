import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { Request, Response, CookieOptions } from 'express';
import config from '@core/config/jwt/jwt.config';
import { allowedOrigins } from '@core/config/app/allowed-origins';

export { allowedOrigins } from '@core/config/app/allowed-origins';

export function cookie(req: Request, name: string): string {
  const value = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(name + '='));
  try {
    return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
  } catch {
    return '';
  }
}
export function cookieOptions(): CookieOptions {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite =
    process.env.AUTH_COOKIE_SAME_SITE === 'none' ? 'none' : 'lax';
  if (sameSite === 'none' && !secure)
    throw new Error('SameSite=None requires production HTTPS');
  return { httpOnly: true, secure, sameSite, path: '/' };
}
export function setSession(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.setHeader('Cache-Control', 'no-store');
  res.cookie('icodeme_access', tokens.accessToken, {
    ...cookieOptions(),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('icodeme_refresh', tokens.refreshToken, {
    ...cookieOptions(),
    maxAge: config().ttl,
  });
}
export function clearSession(res: Response) {
  res.clearCookie('icodeme_access', cookieOptions());
  res.clearCookie('icodeme_refresh', cookieOptions());
}
export function requireOrigin(req: Request) {
  if (!req.headers.origin || !allowedOrigins().includes(req.headers.origin))
    throw new ForbiddenException('Untrusted request origin');
}
export function textField(
  body: unknown,
  key: string,
  min = 1,
  max = 256,
): string {
  const value =
    body && typeof body === 'object' && (body as Record<string, unknown>)[key];
  if (
    typeof value !== 'string' ||
    value.length < min ||
    value.length > max ||
    ((key === 'password' || key === 'newPassword') &&
      Buffer.byteLength(value) > 72)
  )
    throw new BadRequestException(`Invalid ${key}`);
  return value;
}
