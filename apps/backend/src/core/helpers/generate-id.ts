import config from '@core/config/db/db.config';
import { v5 as uuidv5 } from 'uuid';

export const generateId = (value: string): string => {
  return uuidv5(value, config().idKey);
};
