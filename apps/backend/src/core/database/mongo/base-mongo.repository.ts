import { Collection, Document, Filter, OptionalId, WithId } from 'mongodb';
import { BaseEntity } from '@core/types/base-entity.abstract';
import { BaseRepository } from '../types/base-repository.abstract';
import { getErrorMessage } from '@core/helpers/error-message';

export class BaseMongoRepository<
  T extends BaseEntity,
> implements BaseRepository<T> {
  constructor(protected collection: Collection) {}

  async create(data: T): Promise<string> {
    try {
      const doc = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await this.collection.insertOne(
        doc as unknown as OptionalId<Document>,
      );
      return result.insertedId.toString();
    } catch (error) {
      throw new Error(`Failed to create document: ${getErrorMessage(error)}`);
    }
  }

  async find(filter?: Partial<T>): Promise<T[]> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter || {});
      const results = await this.collection.find(mongoFilter).toArray();
      return results.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to find documents: ${getErrorMessage(error)}`);
    }
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter);
      const result = await this.collection.findOne(mongoFilter);
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      throw new Error(`Failed to find document: ${getErrorMessage(error)}`);
    }
  }

  async update(filter: Partial<T>, data: Partial<T>): Promise<boolean> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      const result = await this.collection.updateOne(mongoFilter, {
        $set: updateData,
      });
      return result.modifiedCount > 0;
    } catch (error) {
      throw new Error(`Failed to update document: ${getErrorMessage(error)}`);
    }
  }

  async consume(filter: Partial<T>): Promise<T | null> {
    const doc = await this.collection.findOneAndDelete(
      this.mapToMongoFilter(filter),
    );
    return doc ? this.mapToEntity(doc) : null;
  }

  async deleteMany(filter: Partial<T>): Promise<void> {
    await this.collection.deleteMany(this.mapToMongoFilter(filter));
  }

  async delete(filter: Partial<T>): Promise<boolean> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter);
      const result = await this.collection.deleteOne(mongoFilter);
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete document: ${getErrorMessage(error)}`);
    }
  }

  protected mapToMongoFilter(filter: Partial<T>): Filter<Document> {
    const mongoFilter: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filter) as [string, unknown][]) {
      if (key === 'id') {
        mongoFilter._id = value;
      } else {
        mongoFilter[key] = value;
      }
    }

    return mongoFilter as Filter<Document>;
  }

  protected mapToEntity(doc: WithId<Document>): T {
    const { _id, ...rest } = doc;

    return {
      _id: _id.toString(),
      ...rest,
    } as T;
  }
}
