import { HttpException, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';

interface GenerationUsage {
  _id: string;
  count: number;
  expiresAt: Date;
}

const DAILY_LIMIT = 30;

@Injectable()
export class StudyGenerationQuotaService {
  private readonly collection: Collection<GenerationUsage>;

  constructor(db: Db) {
    this.collection = db.collection<GenerationUsage>('studyGenerationUsage');
  }

  async consume(userId: string): Promise<void> {
    const day = new Date().toISOString().slice(0, 10);
    const id = `${userId}:${day}`;
    const expiresAt = new Date(`${day}T00:00:00.000Z`);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 2);
    const updated = await this.collection.findOneAndUpdate(
      { _id: id, count: { $lt: DAILY_LIMIT } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: false, returnDocument: 'after' },
    );
    if (updated) return;
    try {
      await this.collection.insertOne({ _id: id, count: 1, expiresAt });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        const retry = await this.collection.findOneAndUpdate(
          { _id: id, count: { $lt: DAILY_LIMIT } },
          { $inc: { count: 1 } },
          { returnDocument: 'after' },
        );
        if (retry) return;
        throw new HttpException('Суточный лимит генерации исчерпан', 429);
      }
      throw error;
    }
  }
}
