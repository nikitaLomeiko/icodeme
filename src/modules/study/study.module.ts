import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { GeneralModule } from '@modules/general';

import { StudyService } from '@services/studyService/StudyService';
import { ProfileService } from '@services/profileService';

import { StudyController } from './controllers/study.controller';
import { AIProvider } from '@core/ai';
import { FileStorageProvider } from '@core/storage';

dotenv.config();

@Module({
  imports: [GeneralModule],
  providers: [StudyService, ProfileService, AIProvider, FileStorageProvider],
  controllers: [StudyController],
  exports: [StudyService],
})
export class StudyModule {}
