import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Controller,
  Post,
  Delete,
  Body,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DockerService, IContainerResult } from '@services/dockerService';
import { DockerError } from '@services/dockerService/types/Error.types';
import { IProject } from '@models/project';
import { IControllerResponse } from '@core/types/Response.type';
import { StudyService } from '@services/studyService/StudyService';

@Controller('ide/docker')
@UseGuards(AuthGuard('jwt'))
export class IdeDockerController {
  constructor(
    private readonly dockerService: DockerService,
    private readonly studyService: StudyService,
  ) {}

  @Post('run')
  async createAndRunContainer(
    @Request() req,
    @Body() data: { project: IProject; stepId: string },
  ): Promise<IControllerResponse<IContainerResult>> {
    if (!data?.project?.meta || !Array.isArray(data.project.dir))
      throw new BadRequestException('Invalid project');
    if (typeof data.stepId !== 'string' || !data.stepId.trim())
      throw new BadRequestException('Invalid step id');

    const step = await this.studyService.getStepByIdAndUserId(
      data.stepId,
      req.user.userId,
    );
    if (!step) throw new NotFoundException('Step not found');
    if (!['code', 'terminal', 'exam'].includes(step.type))
      throw new BadRequestException('Step cannot run code');

    const dockerFile = step.settings?.dockerFile;
    if (typeof dockerFile !== 'string' || !dockerFile.trim())
      throw new BadRequestException('Step has no Dockerfile');
    const startCommand = step.settings?.startCommand;
    if (
      !Array.isArray(startCommand) ||
      startCommand.length === 0 ||
      startCommand.some((part) => typeof part !== 'string' || !part.trim())
    )
      throw new BadRequestException('Step has no start command');

    const project: IProject = {
      ...data.project,
      userId: req.user.userId,
      meta: {
        ...data.project.meta,
        language: step.settings.language || data.project.meta.language,
      },
    };
    this.dockerService.validateProject(project);

    const result = await this.dockerService.createAndRunContainer(
      project,
      dockerFile,
      startCommand,
    );

    if (!result.success) {
      throw new BadRequestException(
        'An error occurred while attempting to start the container',
      );
    }

    return result;
  }

  @Post('send')
  async sendInputToContainer(
    @Request() req,
    @Body() data: { containerId: string; input: string },
  ) {
    await this.dockerService.assertOwner(data.containerId, req.user.userId);
    if (typeof data.input !== 'string' || data.input.length > 65536)
      throw new BadRequestException('Invalid input');
    const result = await this.dockerService.sendInputToContainer(
      data.containerId,
      data.input,
    );

    if (!result.success) {
      throw new BadRequestException(
        'An error occurred while attempting to start the container',
      );
    }

    return result;
  }

  @Post('stop')
  async stopContainer(@Request() req, @Body() data: { containerId: string }) {
    await this.dockerService.assertOwner(data.containerId, req.user.userId);
    const result = await this.dockerService.stopContainer(data.containerId);

    if (result.success) {
      return result;
    }

    if (result.error === DockerError.CONTAINER_NOT_FOUND) {
      throw new NotFoundException('Container not found');
    }

    if (result.error === DockerError.INVALID_CONTAINER_ID) {
      throw new BadRequestException('Invalid container id');
    }

    throw new BadRequestException('Failed to stop the container');
  }

  @Delete()
  async removeContainer(@Request() req, @Body() data: { containerId: string }) {
    return this.stopContainer(req, data);
  }
}
