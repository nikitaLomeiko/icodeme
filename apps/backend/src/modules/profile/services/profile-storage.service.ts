import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/database';
import { generateId } from '@core/helpers/generate-id';
import type { IServiceResponse } from '@core/types/response.type';
import {
  IFavorite,
  ILineFavorite,
  IProfileStorage,
  ProfileStorageKey,
} from '../models/profile-storage.model';
import { ProfileError } from '../types/profile-error.types';

@Injectable()
export class ProfileStorageService {
  private readonly repository: BaseMongoRepository<IProfileStorage>;

  constructor(db: Db) {
    this.repository = new BaseMongoRepository<IProfileStorage>(
      db.collection(ProfileStorageKey),
    );
  }

  async initialize(userId: string, profileId: string): Promise<void> {
    const now = new Date();
    await this.repository.create({
      _id: generateId(profileId),
      userId,
      favorites: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  async getDocumentFavorites(
    userId: string,
    documentId: string,
  ): Promise<IServiceResponse<IFavorite, ProfileError>> {
    const storage = await this.repository.findOne({ userId });
    if (!storage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const document = storage.favorites.find(
      (item) => item.documentId === documentId,
    );
    return { success: true, data: document };
  }

  async addDocumentFavorite(
    userId: string,
    documentId: string,
    favorite: ILineFavorite,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const storage = await this.repository.findOne({ userId });
    if (!storage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const document = storage.favorites.find(
      (item) => item.documentId === documentId,
    );
    if (document) {
      document.links.push(favorite);
    } else {
      storage.favorites.push({ documentId, links: [favorite] });
    }

    await this.repository.update({ userId }, storage);
    return { success: true };
  }

  async removeDocumentFavorite(
    userId: string,
    documentId: string,
    favoriteId: string,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const storage = await this.repository.findOne({ userId });
    if (!storage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const documentIndex = storage.favorites.findIndex(
      (item) => item.documentId === documentId,
    );
    if (documentIndex === -1) {
      return { success: false, error: ProfileError.DOCUMENT_NOT_FOUND };
    }

    const document = storage.favorites[documentIndex];
    const links = document.links.filter((item) => item.id !== favoriteId);
    if (links.length === 0) {
      storage.favorites.splice(documentIndex, 1);
    } else {
      document.links = links;
    }

    const updated = await this.repository.update({ userId }, storage);
    return updated
      ? { success: true }
      : { success: false, error: ProfileError.USER_NOT_FOUND };
  }
}
