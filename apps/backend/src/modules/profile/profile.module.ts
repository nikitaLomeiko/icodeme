import { Module } from '@nestjs/common';

import { ProfileService } from './services/profile.service';

import { ProfileController } from './controllers/profile.controller';
import { ProfileStorageController } from './controllers/profile-storage.controller';
import { ProfileStorageService } from './services/profile-storage.service';

@Module({
  providers: [ProfileService, ProfileStorageService],
  controllers: [ProfileController, ProfileStorageController],
  exports: [ProfileService],
})
export class ProfileModule {}
