import { v5 as uuidv5 } from 'uuid';

export default () => ({
  dbUrl: process.env.DB_URL || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'ICodeme-database',
  idKey: uuidv5('ICodeme', uuidv5.DNS),
});
