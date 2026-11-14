import { Provider } from '@nestjs/common';
import { DatabaseConnector } from './mongo/database.connector';
import { Db } from 'mongodb';
import config from '@core/config/db/db.config';

export const DatabaseConnectorProvider: Provider = {
  provide: DatabaseConnector,
  useFactory: () => new DatabaseConnector(config().dbUrl),
};

export const DatabaseProvider: Provider = {
  provide: Db,
  inject: [DatabaseConnector],
  useFactory: async (connector: DatabaseConnector) => {
    const dbname = config().dbName;

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
