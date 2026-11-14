import { Injectable } from '@nestjs/common';
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

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): GitHubOAuthUser {
    void accessToken;
    void refreshToken;
    const { username, displayName, emails, photos } = profile;

    return {
      githubId: profile.id,
      email: emails?.[0]?.value || `${username}@github.com`,
      name: displayName || username || 'GitHub user',
      picture: photos?.[0]?.value,
      username,
    };
  }
}
