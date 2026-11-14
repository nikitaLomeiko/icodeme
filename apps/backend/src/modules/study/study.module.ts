import { Module } from '@nestjs/common';

import { StudyService } from './services/study.service';
import { StudyPlanService } from './services/study-plan.service';
import { StudyGenerationService } from './services/study-generation.service';

import { StudyController } from './controllers/study.controller';
import { AIProvider } from '@core/ai';
import { FileStorageProvider } from '@core/storage';

@Module({
  providers: [
    StudyService,
    StudyPlanService,
    StudyGenerationService,
    AIProvider,
    FileStorageProvider,
  ],
  controllers: [StudyController],
  exports: [StudyService],
})
export class StudyModule {}
