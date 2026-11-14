import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { BaseFileStorage } from '@core/storage';
import type { FileNode } from '@modules/project';

@Injectable()
export class DockerWorkspaceService {
  private readonly rootPath = 'data/containers';

  constructor(private readonly fileStorage: BaseFileStorage) {}

  getRuntimePath(userId: string, runtimeKey: string): string {
    return path.join(this.rootPath, userId, runtimeKey);
  }

  deleteRuntime(userId: string, runtimeKey: string): Promise<void> {
    return this.fileStorage.deleteDirAsync(
      this.getRuntimePath(userId, runtimeKey),
    );
  }

  async syncProjectFiles(
    projectPath: string,
    nodes: FileNode[],
    dockerfileContent: string,
    language: string,
  ): Promise<void> {
    await this.fileStorage.deleteDirAsync(projectPath);
    await this.fileStorage.createDirAsync(projectPath);
    await this.createNodes(nodes, projectPath);

    if (
      language.toLowerCase() === 'python' &&
      !nodes.some(
        (node) => node.type === 'file' && node.name === 'requirements.txt',
      )
    ) {
      await this.fileStorage.writeFileAsync(
        path.join(projectPath, 'requirements.txt'),
        '',
      );
    }

    await this.fileStorage.writeFileAsync(
      path.join(projectPath, 'Dockerfile'),
      dockerfileContent,
    );
  }

  private async createNodes(
    nodes: FileNode[],
    currentPath: string,
  ): Promise<void> {
    for (const node of nodes) {
      const nodePath = path.join(currentPath, node.name);
      if (node.type === 'folder') {
        await this.fileStorage.createDirAsync(nodePath);
        await this.createNodes(node.children ?? [], nodePath);
      } else {
        await this.fileStorage.writeFileAsync(nodePath, node.content ?? '');
      }
    }
  }
}
