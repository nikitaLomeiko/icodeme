import type { Db } from 'mongodb';
import type { JwtService } from '@nestjs/jwt';
import { AuthError } from '../types';
import { OAuthService } from './oauth.service';

jest.mock('@core/database', () => ({ BaseMongoRepository: class {} }));
jest.mock('@core/helpers/generate-id', () => ({ generateId: () => 'test-id' }));

describe('OAuthService Google identity', () => {
  const createService = () =>
    new OAuthService(
      { collection: () => ({}) } as unknown as Db,
      {} as JwtService,
    );

  it('rejects an email collision when the verified Google ID differs', async () => {
    const service = createService();
    const findOne = jest.fn(async (filter: Record<string, string>) =>
      filter.googleId
        ? null
        : { email: 'user@example.com', googleId: 'original' },
    );
    Reflect.set(service, 'repositoryUser', { findOne });

    const result = await service.validateOrCreateGoogleUser(
      'different',
      'user@example.com',
      'User',
    );

    expect(result).toEqual({ success: false, error: AuthError.USER_EXISTS });
    expect(findOne).toHaveBeenCalledWith({ googleId: 'different' });
    expect(findOne).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      { collation: { locale: 'en', strength: 2 } },
    );
  });

  it('uses the verified Google ID even after the email changes', async () => {
    const service = createService();
    const user = {
      _id: 'user-1',
      provider: 'google',
      googleId: 'verified-id',
      email: 'old@example.com',
    };
    const findOne = jest.fn(async () => user);
    const issueTokens = jest.fn(async () => ({
      success: true,
      data: { accessToken: 'token' },
    }));
    Reflect.set(service, 'repositoryUser', { findOne });
    Reflect.set(service, 'tokenHelper', { issueTokens });

    const result = await service.validateOrCreateGoogleUser(
      'verified-id',
      'new@example.com',
      'User',
    );

    expect(result.success).toBe(true);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledWith({ googleId: 'verified-id' });
    expect(issueTokens).toHaveBeenCalledWith(user);
  });
});
