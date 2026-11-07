import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import config from '@core/config/google/google.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    console.log('Google callbackURL:', config().callbackURL);
    super({
      clientID: config().clientID,
      clientSecret: config().clientSecret,
      callbackURL: config().callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    if (
      !profile.id ||
      !profile._json?.email_verified ||
      !profile.emails?.[0]?.value
    )
      throw new UnauthorizedException('Verified Google email required');
    const { name, emails, photos } = profile;

    const user = {
      googleId: profile.id,
      email: emails?.[0]?.value,
      name: {
        givenName: name?.givenName,
        familyName: name?.familyName,
      },
      picture: photos?.[0]?.value,
    };

    done(null, user);
  }
}
