import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import config from '@core/config/github/github.config';
import type { GitHubOAuthUser } from '../types';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: config().clientID,
      clientSecret: config().clientSecret,
      callbackURL: config().callbackURL,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GitHubOAuthUser> {
    void refreshToken;
    const { username, displayName, photos } = profile;
    let emails: Array<{ email: string; primary: boolean; verified: boolean }>;
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'ICodeme',
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok)
        throw new Error(`GitHub email status ${response.status}`);
      emails = (await response.json()) as typeof emails;
    } catch {
      throw new UnauthorizedException('Не удалось проверить email GitHub');
    }
    const email = Array.isArray(emails)
      ? (
          emails.find((item) => item.primary && item.verified) ??
          emails.find((item) => item.verified)
        )?.email
      : undefined;
    if (!email)
      throw new UnauthorizedException(
        'Для входа нужен подтвержденный email GitHub',
      );

    return {
      githubId: profile.id,
      email,
      name: displayName || username || 'GitHub user',
      picture: photos?.[0]?.value,
      username,
    };
  }
}
