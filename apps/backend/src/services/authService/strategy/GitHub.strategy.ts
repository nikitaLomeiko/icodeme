import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import config from '@core/config/github/github.config';

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
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    const { username, displayName, emails, photos } = profile;

    const user = {
      githubId: profile.id,
      email: emails?.[0]?.value || `${username}@github.com`,
      name: displayName || username,
      picture: photos?.[0]?.value,
      username,
    };

    done(null, user);
  }
}
