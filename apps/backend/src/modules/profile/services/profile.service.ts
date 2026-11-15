import { ConflictException, Injectable } from '@nestjs/common';
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
    const updated = await this.db
      .collection<IProfile>(ProfileKey)
      .findOneAndUpdate(
        { userId },
        {
          $set: {
            'data.avatar': data.avatar,
            'data.name': data.name,
            'data.about': data.about,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );
    if (!updated) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }
    return { success: true, data: updated };
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
    if (!Number.isFinite(exp) || exp <= 0)
      throw new ConflictException('Некорректное количество опыта');
    const collection = this.db.collection<IProfile>(ProfileKey);
    for (let attempt = 0; attempt < 8; attempt++) {
      const profile = await collection.findOne({ userId });
      if (!profile)
        return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
      let experience = profile.level.experience + exp;
      let currentLevel = profile.level.currentLevel;
      let toNext = profile.level.experienceToNextLevel;
      while (experience >= toNext) {
        experience -= toNext;
        currentLevel++;
        toNext = Math.max(toNext + 1, Math.floor(toNext * 1.15));
      }
      const updated = await collection.findOneAndUpdate(
        { userId, level: profile.level },
        {
          $set: {
            level: { experience, currentLevel, experienceToNextLevel: toNext },
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );
      if (updated) return { success: true, data: updated };
    }
    throw new ConflictException(
      'Не удалось обновить опыт из-за параллельных изменений',
    );
  }

  async addMultipleAchievementsByUserId(
    achievements: IAchievement[],
    userId: string,
  ): Promise<IServiceResponse<IProfile, ProfileError>> {
    const collection = this.db.collection<IProfile>(ProfileKey);
    for (let attempt = 0; attempt < 8; attempt++) {
      const profile = await collection.findOne({ userId });
      if (!profile)
        return { success: false, error: ProfileError.PROFILE_NOT_FOUND };
      const existingIds = new Set(profile.achievements.map((item) => item.id));
      const newAchievements = achievements.filter(
        (item) => !existingIds.has(item.id),
      );
      if (!newAchievements.length)
        return {
          success: false,
          error: ProfileError.ACHIEVEMENT_ALREADY_EXISTS,
        };
      const updated = await collection.findOneAndUpdate(
        { userId, achievements: profile.achievements },
        {
          $push: { achievements: { $each: newAchievements } },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' },
      );
      if (updated) return { success: true, data: updated };
    }
    throw new ConflictException(
      'Не удалось обновить достижения из-за параллельных изменений',
    );
  }
}
