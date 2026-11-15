import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { BaseStorage } from '../types/base-storage.abstract';

@Injectable()
export class BaseFileStorage extends BaseStorage {
  readFile(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }

  readFileAsync(path: string): Promise<string> {
    return fs.promises.readFile(path, 'utf-8');
  }

  writeFile(path: string, content: string): void {
    fs.writeFileSync(path, content, 'utf-8');
  }

  writeFileAsync(path: string, content: string): Promise<void> {
    return fs.promises.writeFile(path, content, 'utf-8');
  }

  deleteFile(path: string): void {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  listFiles(directoryPath: string): string[] {
    return fs.readdirSync(directoryPath);
  }

  createDir(path: string) {
    fs.mkdirSync(path, { recursive: true });
  }

  createDirAsync(path: string): Promise<void> {
    return fs.promises.mkdir(path, { recursive: true }).then(() => undefined);
  }

  deleteDir(path: string): void {
    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true, force: true });
    }
  }

  deleteDirAsync(path: string): Promise<void> {
    return fs.promises.rm(path, { recursive: true, force: true });
  }
}
