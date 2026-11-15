import { Injectable } from '@nestjs/common';
import { Db, MongoServerError } from 'mongodb';
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
  private transactionsSupported: boolean | null = null;

  constructor(
    private readonly db: Db,
    private readonly profileStorageService: ProfileStorageService,
  ) {
    const collectionProfile = db.collection(ProfileKey);

    this.repositoryProfile = new BaseMongoRepository<IProfile>(
      collectionProfile,
    );
  }

  async getProfileByUserId(
    userId: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId });

    if (!profile) {
      return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
    }

    return { success: true, data: profile };
  }

  async createProfile(
    userId: string,
    data: IProfileData,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId });

    if (profile) {
      await this.profileStorageService.initialize(userId, profile._id);
      return { success: true, data: profile };
    }

    const now = new Date();

    const newProfile: IProfile = {
      _id: generateId(userId),
      userId,
      data,
      level: {
        experienceToNextLevel: 10,
        currentLevel: 1,
        experience: 0,
      },
      achievements: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (this.transactionsSupported !== false) {
        const session = this.db.client.startSession();
        try {
          await session.withTransaction(async () => {
            await this.db
              .collection<IProfile>(ProfileKey)
              .insertOne(newProfile, { session });
            await this.profileStorageService.initialize(
              userId,
              newProfile._id,
              session,
            );
          });
          this.transactionsSupported = true;
          return { success: true, data: newProfile };
        } catch (error) {
          if (!this.isUnsupportedTransaction(error)) throw error;
          this.transactionsSupported = false;
        } finally {
          await session.endSession();
        }
      }
      await this.repositoryProfile.create(newProfile);
    } catch (error) {
      const existing = await this.repositoryProfile.findOne({ userId });
      if (!existing) throw error;
      await this.profileStorageService.initialize(userId, existing._id);
      return { success: true, data: existing };
    }
    await this.profileStorageService.initialize(userId, newProfile._id);

    return { success: true, data: newProfile };
  }

  async updateProfileData(
    data: Pick<IProfileData, 'avatar' | 'name' | 'about'>,
    userId: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const profile = await this.repositoryProfile.findOne({ userId });

    if (!profile) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const updatedData = { ...profile.data, ...data };
    const result = await this.repositoryProfile.update(
      { userId },
      { data: updatedData },
    );

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return { success: true, data: { ...profile, data: updatedData } };
  }

  async deleteProfileByUserId(
    userId: string,
  ): Promise<IServiceResponse<null, ProfileError>> {
    let removed = false;
    if (this.transactionsSupported !== false) {
      const session = this.db.client.startSession();
      try {
        await session.withTransaction(async () => {
          const result = await this.db
            .collection<IProfile>(ProfileKey)
            .deleteOne({ userId }, { session });
          removed = result.deletedCount > 0;
          await this.profileStorageService.deleteByUserId(userId, session);
        });
        this.transactionsSupported = true;
        return removed
          ? { success: true }
          : { success: false, error: ProfileError.USER_NOT_FOUND };
      } catch (error) {
        if (!this.isUnsupportedTransaction(error)) throw error;
        this.transactionsSupported = false;
      } finally {
        await session.endSession();
      }
    }
    removed = await this.repositoryProfile.delete({ userId });
    await this.profileStorageService.deleteByUserId(userId);
    return removed
      ? { success: true }
      : { success: false, error: ProfileError.USER_NOT_FOUND };
  }

  private isUnsupportedTransaction(error: unknown): boolean {
    return (
      error instanceof MongoServerError &&
      (error.code === 20 ||
        error.code === 303 ||
        /transaction numbers are only allowed/i.test(error.message))
    );
  }

  async addExperienceByUserId(
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
