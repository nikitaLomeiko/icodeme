import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { EmailModule } from '@modules/email';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OAuthService } from './services/oauth.service';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthSecurityGuard } from './strategies/auth-security.guard';
import config from '@core/config/jwt/jwt.config';

import { OAuthController } from './controllers/oauth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config().secret,
        signOptions: { expiresIn: config().expiresIn },
      }),
    }),
    EmailModule,
  ],
  providers: [
    AuthService,
    OAuthService,
    GoogleStrategy,
    GitHubStrategy,
    JwtStrategy,
    AuthSecurityGuard,
    { provide: APP_GUARD, useExisting: AuthSecurityGuard },
  ],
  controllers: [AuthController, OAuthController],
  exports: [AuthService],
})
export class AuthModule {}
