import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/db';
import { generateId } from '@core/helpers/GenerateId';
import {
  IAchievement,
  IProfile,
  IProfileData,
  ProfileKey,
} from '@models/profile/Profile.model';
import { IServiceResponse } from '@core/types/Response.type';
import { ProfileError } from './types/Error.types';
import {
  IFavorite,
  ILineFavorite,
  IProfileStorage,
  ProfileStorageKey,
} from '@models/profile-storage';

@Injectable()
export class ProfileService {
  private repositoryProfile: BaseMongoRepository<IProfile>;
  private repositoryProfileStorage: BaseMongoRepository<IProfileStorage>;

  constructor(db: Db) {
    const collectionProfile = db.collection(ProfileKey);
    const collectionProfileStorage = db.collection(ProfileStorageKey);

    this.repositoryProfile = new BaseMongoRepository<IProfile>(
      collectionProfile,
    );

    this.repositoryProfileStorage = new BaseMongoRepository<IProfileStorage>(
      collectionProfileStorage,
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

  async CreateNewProfile(
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

    const newProfileStorage: IProfileStorage = {
      _id: generateId(newProfile._id),
      userId: userId,
      favorites: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.repositoryProfile.create(newProfile);

    await this.repositoryProfileStorage.create(newProfileStorage);

    return { success: true, data: newProfile };
  }

  async ChangeProfileDataById(
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

  async RemoveProfileById(
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
    let leveledUp = false;

    while (newExperience >= newExperienceToNextLevel) {
      newExperience -= newExperienceToNextLevel;
      newCurrentLevel++;
      newExperienceToNextLevel = Math.floor(newExperienceToNextLevel * 1.15);
      leveledUp = true;
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

  async getDocumentFavoritesById(
    id: string,
    documentId: string,
  ): Promise<IServiceResponse<IFavorite, ProfileError>> {
    const profileStorage = await this.repositoryProfileStorage.findOne({
      userId: id,
    });

    console.log(profileStorage);

    if (!profileStorage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const document = profileStorage.favorites.find(
      (item) => item.documentId === documentId,
    );

    return { success: true, data: document };
  }

  async createNewDocumentFavorite(
    userId: string,
    documentId: string,
    favorite: ILineFavorite,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const profileStorage = await this.repositoryProfileStorage.findOne({
      userId,
    });

    if (!profileStorage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    let existingDocument = profileStorage.favorites.find(
      (item) => item.documentId === documentId,
    );

    if (existingDocument) {
      existingDocument.links.push(favorite);
    } else {
      profileStorage.favorites.push({
        documentId: documentId,
        links: [favorite],
      });
    }

    await this.repositoryProfileStorage.update({ userId }, profileStorage);

    return { success: true };
  }

  async removeDocumentFavoriteById(
    userId: string,
    documentId: string,
    favoriteId: string,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const profileStorage = await this.repositoryProfileStorage.findOne({
      userId,
    });

    if (!profileStorage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const documentIndex = profileStorage.favorites.findIndex(
      (item) => item.documentId === documentId,
    );

    if (documentIndex === -1) {
      return { success: false, error: ProfileError.DOCUMENT_NOT_FOUND };
    }

    const document = profileStorage.favorites[documentIndex];

    const updatedLinks = document.links.filter(
      (item) => item.id !== favoriteId,
    );

    if (updatedLinks.length === 0) {
      profileStorage.favorites.splice(documentIndex, 1);
    } else {
      profileStorage.favorites[documentIndex].links = updatedLinks;
    }

    const result = await this.repositoryProfileStorage.update(
      { userId },
      profileStorage,
    );

    if (!result) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    return { success: true };
  }
}
