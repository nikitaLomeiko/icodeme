import { APP_GUARD } from '@nestjs/core';
import { AuthSecurityGuard } from '@services/authService/strategy/Auth-security.guard';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { DataBaseProvider } from '@core/db';
import { JwtStrategy } from '@services/authService';

dotenv.config();

@Module({
  providers: [
    DataBaseProvider,
    JwtStrategy,
    { provide: APP_GUARD, useClass: AuthSecurityGuard },
  ],
  exports: [DataBaseProvider, JwtStrategy],
})
export class GeneralModule {}
