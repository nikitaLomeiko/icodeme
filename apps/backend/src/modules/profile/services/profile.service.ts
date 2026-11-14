import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/database';
import { generateId } from '@core/helpers/generate-id';
import {
  IAchievement,
  IProfile,
  IProfileData,
  ProfileKey,
} from '../models/profile.model';
import { IServiceResponse } from '@core/types/response.type';
import { ProfileError } from '../types/profile-error.types';
import { ProfileStorageService } from './profile-storage.service';

@Injectable()
export class ProfileService {
  private readonly repositoryProfile: BaseMongoRepository<IProfile>;

  constructor(
    db: Db,
    private readonly profileStorageService: ProfileStorageService,
  ) {
    const collectionProfile = db.collection(ProfileKey);

    this.repositoryProfile = new BaseMongoRepository<IProfile>(
      collectionProfile,
    );
  }

  async getProfileById(
    id: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId: id });

    if (!profile) {
      return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
    }

    return { success: true, data: profile };
  }

  async createNewProfile(
    userId: string,
    data: IProfileData,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({
      userId: userId,
    });

    if (profile) {
      return {
        success: false,
        error: ProfileError.PROFILE_ALREADY_CREATED,
      };
    }

    const now = new Date();

    const newProfile: IProfile = {
      _id: generateId(userId),
      userId: userId,
      data: data,
      level: {
        experienceToNextLevel: 10,
        currentLevel: 1,
        experience: 0,
      },
      achievements: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.repositoryProfile.create(newProfile);
    await this.profileStorageService.initialize(userId, newProfile._id);

    return { success: true, data: newProfile };
  }

  async changeProfileDataById(
    data: IProfileData,
    id: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId: id });

    if (!profile) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const result = await this.repositoryProfile.update(
      { userId: id },
      { ...profile, data },
    );

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return { success: true, data: { ...profile, data } };
  }

  async removeProfileById(
    id: string,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const result = await this.repositoryProfile.delete({ userId: id });

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return { success: true };
  }

  async setExperienceById(
    exp: number,
    userId: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId });

    if (!profile) {
      return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
    }

    let newExperience = profile.level.experience + exp;
    let newCurrentLevel = profile.level.currentLevel;
    let newExperienceToNextLevel = profile.level.experienceToNextLevel;
    while (newExperience >= newExperienceToNextLevel) {
      newExperience -= newExperienceToNextLevel;
      newCurrentLevel++;
      newExperienceToNextLevel = Math.floor(newExperienceToNextLevel * 1.15);
    }

    const updatedProfile = {
      ...profile,
      level: {
        experience: newExperience,
        currentLevel: newCurrentLevel,
        experienceToNextLevel: newExperienceToNextLevel,
      },
      updatedAt: new Date(),
    };

    const result = await this.repositoryProfile.update(
      { userId },
      updatedProfile,
    );

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return {
      success: true,
      data: updatedProfile,
    };
  }

  async addMultipleAchievementsByUserId(
    achievements: IAchievement[],
    userId: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId });

    if (!profile) {
      return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
    }

    const existingIds = new Set(profile.achievements.map((a) => a.id));
    const newAchievements = achievements.filter((a) => !existingIds.has(a.id));

    if (newAchievements.length === 0) {
      return {
        success: false,
        error: ProfileError.ACHIEVEMENT_ALREADY_EXISTS,
      };
    }

    const updatedProfile = {
      ...profile,
      achievements: [...profile.achievements, ...newAchievements],
      updatedAt: new Date(),
    };

    const result = await this.repositoryProfile.update(
      { userId },
      updatedProfile,
    );

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return {
      success: true,
      data: updatedProfile,
    };
  }
}
