import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { GeneralModule } from '@modules/general';
import { EmailModule } from '@modules/email';

import { AuthController } from './controllers/auth.controller';
import {
  AuthService,
  GoogleStrategy,
  GitHubStrategy,
  OauthService,
} from '@services/authService';
import config from '@core/config/jwt/jwt.config';

import * as dotenv from 'dotenv';
import { OAuthController } from './controllers/oauth.controller';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config().secret,
      signOptions: { expiresIn: config().expiresIn },
    }),
    GeneralModule,
    EmailModule,
  ],
  providers: [AuthService, OauthService, GoogleStrategy, GitHubStrategy],
  controllers: [AuthController, OAuthController],
})
export class AuthModule {}
