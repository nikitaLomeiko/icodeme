import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import type { IControllerResponse } from '@core/types/response.type';
import type { IProject } from '@modules/project';
import { StudyService } from '@modules/study';
import type {
  ContainerDto,
  RunContainerDto,
  SendContainerInputDto,
} from '../dto/docker.dto';
import { DockerError } from '../types/docker-error.types';
import type { IContainerResult } from '../types/docker-result.types';
import { DockerService } from './docker.service';

@Injectable()
export class IdeRuntimeService {
  constructor(
    private readonly dockerService: DockerService,
    private readonly studyService: StudyService,
    private readonly jwtService: JwtService,
  ) {}

  async run(
    userId: string,
    data: RunContainerDto,
  ): Promise<IControllerResponse<IContainerResult>> {
    const step = await this.studyService.getStepByIdAndUserId(
      data.stepId,
      userId,
    );
    if (!step) throw new NotFoundException('Step not found');
    if (!['code', 'terminal', 'exam'].includes(step.type)) {
      throw new BadRequestException('Step cannot run code');
    }

    const dockerFile = step.settings?.dockerFile;
    if (typeof dockerFile !== 'string' || !dockerFile.trim()) {
      throw new BadRequestException('Step has no Dockerfile');
    }
    const startCommand = step.settings?.startCommand;
    if (
      !Array.isArray(startCommand) ||
      startCommand.length === 0 ||
      startCommand.some((part) => typeof part !== 'string' || !part.trim())
    ) {
      throw new BadRequestException('Step has no start command');
    }

    const project: IProject = {
      _id: data.project._id,
      userId,
      dir: data.project.dir,
      meta: {
        ...data.project.meta,
        language: step.settings.language || data.project.meta.language,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dockerService.validateProject(project);

    const result = await this.dockerService.createAndRunContainer(
      project,
      dockerFile,
      startCommand,
      data.stepId,
      step.settings.memoryLimitMb,
      true,
    );
    if (result.success) return result;
    if (result.error === DockerError.RUNTIME_CAPACITY_REACHED) {
      throw new HttpException(
        'All code execution slots are currently in use. Try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new BadRequestException(
      'An error occurred while attempting to start the container',
    );
  }

  async createTerminalTicket(
    userId: string,
    data: ContainerDto,
  ): Promise<IControllerResponse<{ ticket: string }>> {
    await this.dockerService.assertOwner(data.containerId, userId);
    const ticket = await this.jwtService.signAsync(
      {
        sub: userId,
        containerId: data.containerId,
        type: 'terminal-ws',
        jti: randomUUID(),
      },
      { expiresIn: '30s' },
    );
    return { success: true, data: { ticket } };
  }

  async sendInput(userId: string, data: SendContainerInputDto) {
    await this.dockerService.assertOwner(data.containerId, userId);
    const result = await this.dockerService.sendInputToContainer(
      data.containerId,
      data.input,
    );
    if (!result.success) {
      throw new BadRequestException('Failed to send input to the container');
    }
    return result;
  }

  async stop(userId: string, data: ContainerDto) {
    await this.dockerService.assertOwner(data.containerId, userId);
    const result = await this.dockerService.stopContainer(data.containerId);
    if (result.success) return result;
    if (result.error === DockerError.CONTAINER_NOT_FOUND) {
      throw new NotFoundException('Container not found');
    }
    if (result.error === DockerError.INVALID_CONTAINER_ID) {
      throw new BadRequestException('Invalid container id');
    }
    throw new BadRequestException('Failed to stop the container');
  }
}
