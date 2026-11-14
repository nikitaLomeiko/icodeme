export abstract class BaseStorage {
  abstract readFile(path: string): string;
  abstract writeFile(path: string, content: string): void;
  abstract deleteFile(path: string): void;
  abstract listFiles(directoryPath): string[];
}
