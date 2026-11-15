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
      db.collection('users').createIndex(
        { email: 1 },
        {
          unique: true,
          collation: { locale: 'en', strength: 2 },
          name: 'users_email_unique_ci',
        },
      ),
      db.collection('users').createIndex(
        { googleId: 1 },
        {
          unique: true,
          partialFilterExpression: { googleId: { $type: 'string' } },
        },
      ),
      db.collection('users').createIndex(
        { githubId: 1 },
        {
          unique: true,
          partialFilterExpression: { githubId: { $type: 'string' } },
        },
      ),
      db.collection('users').createIndex(
        { telegramId: 1 },
        {
          unique: true,
          partialFilterExpression: { telegramId: { $type: 'string' } },
        },
      ),
      db
        .collection('refreshTokens')
        .createIndex({ token: 1 }, { unique: true }),
      db.collection('refreshTokens').createIndex({ userId: 1 }),
      db
        .collection('confirmations_code')
        .createIndex({ userId: 1, purpose: 1 }),
      db.collection('profiles').createIndex({ userId: 1 }, { unique: true }),
      db
        .collection('profileStorage')
        .createIndex({ userId: 1 }, { unique: true }),
      db.collection('Study').createIndex({ userId: 1 }),
      db
        .collection('dockerRuntimeLeases')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection('dockerRuntimeReservations')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection('dockerTerminalTickets')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    return db;
  },
};
