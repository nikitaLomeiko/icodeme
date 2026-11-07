import { Collection, Document, Filter, OptionalId, WithId } from 'mongodb';
import { BaseEntity } from '@core/types/BaseEntity.abstract';
import { BaseRepository } from '../types/BaseRepository.abstact';

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
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async find(filter?: Partial<T>): Promise<T[]> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter || {});
      const results = await this.collection.find(mongoFilter).toArray();
      return results.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to find documents: ${error.message}`);
    }
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      const mongoFilter = this.mapToMongoFilter(filter);
      const result = await this.collection.findOne(mongoFilter);
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      throw new Error(`Failed to find document: ${error.message}`);
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
      throw new Error(`Failed to update document: ${error.message}`);
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
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  protected mapToMongoFilter(filter: Partial<T>): Filter<Document> {
    const mongoFilter: Filter<Document> = {};

    for (const [key, value] of Object.entries(filter)) {
      if (key === 'id') {
        mongoFilter._id = value;
      } else {
        mongoFilter[key] = value;
      }
    }

    return mongoFilter;
  }

  protected mapToEntity(doc: WithId<Document>): T {
    const { _id, ...rest } = doc;

    return {
      _id: _id.toString(),
      ...rest,
    } as T;
  }
}
