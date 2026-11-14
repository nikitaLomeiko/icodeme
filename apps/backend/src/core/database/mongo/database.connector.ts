import { Logger, type OnApplicationShutdown } from '@nestjs/common';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { IDatabaseConnector } from '../types/database-connector.type';

export class DatabaseConnector
  implements IDatabaseConnector<MongoClient>, OnApplicationShutdown
{
  private readonly logger = new Logger(DatabaseConnector.name);
  readonly client: MongoClient;

  constructor(uri: string) {
    const options: MongoClientOptions = {
      serverSelectionTimeoutMS: 5000,
    };
    if (process.env.DB_TLS_ALLOW_INVALID_CERTIFICATES === 'true') {
      options.tlsAllowInvalidCertificates = true;
    }
    this.client = new MongoClient(uri, options);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.logger.log('Disconnected from MongoDB');
    } catch (error) {
      this.logger.error('Failed to disconnect from MongoDB', error);
      throw error;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.disconnect();
  }
}
