import { Provider } from '@nestjs/common';
import { DBConnector } from './mongo/DBConnector';
import { Db } from 'mongodb';
import config from '@core/config/db/db.config';

export const DataBaseProvider: Provider = {
  provide: Db,
  useFactory: async () => {
    const uri = config().dbUrl;
    const dbname = config().dbName;

    if (!uri) {
      throw new Error('DB_URL is not defined in environment variables');
    }

    const connector = new DBConnector(uri);

    await connector.connect();

    const db = connector.client.db(dbname);
    await Promise.all([
      db
        .collection('authRateLimits')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection('refreshTokens')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection('confirmations_code')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    return db;
  },
};
