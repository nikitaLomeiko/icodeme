import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { BaseStorage } from '../types/BaseStorage.abstact';

@Injectable()
export class BaseFileStorage extends BaseStorage {
  readFile(path: string): string {
    return fs.readFileSync(path, 'utf-8');
  }

  writeFile(path: string, content: string): void {
    fs.writeFileSync(path, content, 'utf-8');
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

  deleteDir(path: string): void {
    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true, force: true });
    }
  }
}
