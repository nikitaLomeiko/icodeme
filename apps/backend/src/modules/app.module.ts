import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core/core.module';

import { AuthModule } from './auth';
import { ProfileModule } from './profile';
import { StudyModule } from './study';
import { IdeModule } from './ide';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    AuthModule,
    ProfileModule,
    StudyModule,
    IdeModule,
  ],
})
export class AppModule {}
