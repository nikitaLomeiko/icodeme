import { MongoClient } from 'mongodb';
import { IDBConnector } from '../types/DBConnector.type';

export class DBConnector implements IDBConnector<MongoClient> {
  client: MongoClient;

  constructor(
    private uri: string,
    private dbName: string = 'db',
  ) {
    this.client = new MongoClient(this.uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }
}
