import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import * as fs from 'fs';
import * as tar from 'tar-fs';
import type { Readable } from 'stream';
import { isDockerNotFound } from '../utils/docker-runtime.utils';
import { DockerRuntimeCoordinator } from './docker-runtime-coordinator.service';
import { isRecord } from '@core/types/guards/is-record';
import { getErrorMessage, toError } from '@core/helpers/error-message';

@Injectable()
export class DockerImageService {
  private readonly logger = new Logger(DockerImageService.name);

  constructor(private readonly coordinator: DockerRuntimeCoordinator) {}

  async hasImage(docker: Docker, imageName: string): Promise<boolean> {
    try {
      await docker.getImage(imageName).inspect();
      return true;
    } catch (error) {
      if (isDockerNotFound(error)) return false;
      throw error;
    }
  }

  buildImage(
    docker: Docker,
    projectPath: string,
    imageName: string,
  ): Promise<void> {
    return this.coordinator.withBuildSlot(() =>
      this.buildImageWithDocker(docker, projectPath, imageName),
    );
  }

  async removeImage(docker: Docker, imageName: string): Promise<void> {
    if (!imageName) return;
    try {
      await docker.getImage(imageName).remove({ force: true });
    } catch (error) {
      if (!isDockerNotFound(error)) {
        this.logger.error(`Image cleanup failed: ${getErrorMessage(error)}`);
      }
    }
  }

  async removeObsoleteRuntimeImages(
    docker: Docker,
    runtimeKey: string,
    currentImageName: string,
  ): Promise<void> {
    const imagePrefix = `icodeme-runtime-${runtimeKey}-`;
    try {
      const images = await docker.listImages();
      const obsoleteTags = new Set<string>();
      for (const image of images) {
        for (const tag of image.RepoTags ?? []) {
          if (tag.startsWith(imagePrefix) && tag !== currentImageName) {
            obsoleteTags.add(tag);
          }
        }
      }
      await Promise.all(
        [...obsoleteTags].map((tag) => this.removeImage(docker, tag)),
      );
    } catch (error) {
      this.logger.error(
        `Obsolete image cleanup failed: ${getErrorMessage(error)}`,
      );
    }
  }

  private buildImageWithDocker(
    docker: Docker,
    projectPath: string,
    imageName: string,
  ): Promise<void> {
    if (!fs.existsSync(projectPath)) {
      return Promise.reject(new Error(`Project dir not found: ${projectPath}`));
    }

    return new Promise((resolve, reject) => {
      docker.buildImage(
        this.createTarStream(projectPath),
        { t: imageName, rm: true, nocache: false, pull: true },
        (buildError, stream) => {
          if (buildError) return reject(toError(buildError));
          if (!stream) return reject(new Error('No Docker build stream'));

          let eventError = '';
          docker.modem.followProgress(
            stream,
            (progressError: Error | null, output: unknown[]) => {
              if (progressError) return reject(toError(progressError));
              const message =
                output
                  .map((event) => this.getBuildError(event))
                  .find(Boolean) ?? eventError;
              if (message) return reject(new Error(message));
              resolve();
            },
            (event: unknown) => {
              eventError = this.getBuildError(event) ?? eventError;
            },
          );
        },
      );
    });
  }

  private createTarStream(projectPath: string): Readable {
    const pack = tar.pack(projectPath);
    pack.on('error', (error) => {
      this.logger.error(`Tar stream failed: ${getErrorMessage(error)}`);
    });
    return pack;
  }

  private getBuildError(event: unknown): string | undefined {
    if (!isRecord(event)) return undefined;
    if (typeof event.error === 'string') return event.error;
    if (
      isRecord(event.errorDetail) &&
      typeof event.errorDetail.message === 'string'
    ) {
      return event.errorDetail.message;
    }
    return undefined;
  }
}
