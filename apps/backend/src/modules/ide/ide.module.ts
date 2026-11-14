import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { StudyModule } from '@modules/study';

import { DockerService } from './services/docker.service';
import { IdeDockerController } from './controllers/ide-docker.controller';
import { FileStorageProvider } from '@core/storage';
import config from '@core/config/jwt/jwt.config';
import { DockerTerminalGateway } from './docker-terminal.gateway';
import { DockerRuntimeCoordinator } from './services/docker-runtime-coordinator.service';
import { DockerImageService } from './services/docker-image.service';
import { DockerSessionStore } from './services/docker-session.store';
import { DockerWorkspaceService } from './services/docker-workspace.service';
import { IdeRuntimeService } from './services/ide-runtime.service';
import { DockerInteractiveSessionService } from './services/docker-interactive-session.service';

@Module({
  imports: [
    StudyModule,
    JwtModule.registerAsync({
      useFactory: () => ({ secret: config().secret }),
    }),
  ],
  providers: [
    DockerService,
    DockerImageService,
    DockerRuntimeCoordinator,
    DockerSessionStore,
    DockerTerminalGateway,
    DockerWorkspaceService,
    IdeRuntimeService,
    DockerInteractiveSessionService,
    FileStorageProvider,
  ],
  controllers: [IdeDockerController],
})
export class IdeModule {}
