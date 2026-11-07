import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';

import { GeneralModule } from '@modules/general';

import { ProfileService } from '@services/profileService';

import { ProfileController } from './controllers/profile.controller';
import { ProfileStorageController } from './controllers/profile-storage.controller';

dotenv.config();

@Module({
  imports: [GeneralModule],
  providers: [ProfileService],
  controllers: [ProfileController, ProfileStorageController],
})
export class ProfileModule {}
