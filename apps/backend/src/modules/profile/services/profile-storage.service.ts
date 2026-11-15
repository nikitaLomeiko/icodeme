import { Injectable } from '@nestjs/common';
import { ClientSession, Collection, Db } from 'mongodb';
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
  private readonly collection: Collection<IProfileStorage>;

  constructor(db: Db) {
    this.collection = db.collection<IProfileStorage>(ProfileStorageKey);
    this.repository = new BaseMongoRepository<IProfileStorage>(
      db.collection(ProfileStorageKey),
    );
  }

  async initialize(
    userId: string,
    profileId: string,
    session?: ClientSession,
  ): Promise<void> {
    const now = new Date();
    await this.collection.updateOne(
      { userId },
      {
        $setOnInsert: {
          _id: generateId(profileId),
          userId,
          favorites: [],
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, session },
    );
  }

  async deleteByUserId(userId: string, session?: ClientSession): Promise<void> {
    await this.collection.deleteOne({ userId }, { session });
  }

  async getDocumentFavorite(
    userId: string,
    documentId: string,
  ): Promise<IServiceResponse<IFavorite | null, ProfileError>> {
    const storage = await this.repository.findOne({ userId });
    if (!storage) {
      return { success: false, error: ProfileError.USER_NOT_FOUND };
    }

    const document = storage.favorites.find(
      (item) => item.documentId === documentId,
    );
    return { success: true, data: document ?? null };
  }

  async addDocumentFavorite(
    userId: string,
    documentId: string,
    favorite: ILineFavorite,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const append = () =>
      this.collection.updateOne(
        {
          userId,
          favorites: {
            $elemMatch: { documentId, 'links.id': { $ne: favorite.id } },
          },
        },
        {
          $push: { 'favorites.$.links': favorite },
          $set: { updatedAt: new Date() },
        },
      );
    if ((await append()).modifiedCount > 0) return { success: true };

    const created = await this.collection.updateOne(
      { userId, 'favorites.documentId': { $ne: documentId } },
      {
        $push: { favorites: { documentId, links: [favorite] } },
        $set: { updatedAt: new Date() },
      },
    );
    if (created.modifiedCount > 0 || (await append()).modifiedCount > 0)
      return { success: true };
    const storage = await this.collection.findOne({ userId });
    if (!storage) return { success: false, error: ProfileError.USER_NOT_FOUND };
    const alreadyPresent = storage.favorites.some(
      (item) =>
        item.documentId === documentId &&
        item.links.some((link) => link.id === favorite.id),
    );
    return alreadyPresent
      ? { success: true }
      : { success: false, error: ProfileError.DOCUMENT_NOT_FOUND };
  }

  async removeDocumentFavorite(
    userId: string,
    documentId: string,
    favoriteId: string,
  ): Promise<IServiceResponse<null, ProfileError>> {
    const updated = await this.collection.updateOne(
      { userId, 'favorites.documentId': documentId },
      {
        $pull: { 'favorites.$.links': { id: favoriteId } },
        $set: { updatedAt: new Date() },
      },
    );
    if (!updated.matchedCount) {
      const storage = await this.collection.findOne({ userId });
      return storage
        ? { success: false, error: ProfileError.DOCUMENT_NOT_FOUND }
        : { success: false, error: ProfileError.USER_NOT_FOUND };
    }
    await this.collection.updateOne(
      { userId },
      {
        $pull: {
          favorites: {
            documentId,
            links: { $size: 0 },
          } as unknown as IFavorite,
        },
      },
    );
    return { success: true };
  }
}
