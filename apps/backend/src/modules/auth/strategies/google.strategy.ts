import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import config from '@core/config/google/google.config';
import type { GoogleOAuthUser } from '../types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: config().clientID,
      clientSecret: config().clientSecret,
      callbackURL: config().callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): GoogleOAuthUser {
    void accessToken;
    void refreshToken;
    if (
      !profile.id ||
      !profile._json?.email_verified ||
      !profile.emails?.[0]?.value
    )
      throw new UnauthorizedException('Verified Google email required');
    const { name, emails, photos } = profile;

    return {
      googleId: profile.id,
      email: emails[0].value,
      name: {
        givenName: name?.givenName,
        familyName: name?.familyName,
      },
      picture: photos?.[0]?.value,
    };
  }
}
