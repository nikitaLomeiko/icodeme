export abstract class BaseRepository<T> {
  abstract create(data: Omit<T, 'id'>): Promise<string>;
  abstract find(filter?: Partial<T>): Promise<T[]>;
  abstract findOne(filter: Partial<T>): Promise<T | null>;
  abstract update(filter: Partial<T>, data: Partial<T>): Promise<boolean>;
  abstract delete(filter: Partial<T>): Promise<boolean>;
}