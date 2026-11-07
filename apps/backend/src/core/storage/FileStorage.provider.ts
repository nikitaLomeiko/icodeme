// file-storage.provider.ts
import { Provider } from '@nestjs/common';
import { BaseFileStorage } from './base';

export const FileStorageProvider: Provider = {
  provide: BaseFileStorage,
  useFactory: () => {
    return new BaseFileStorage();
  },
};
