import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Controller, Post, Delete, Body } from '@nestjs/common';
import type { IContainerResult } from '../types/docker-result.types';
import { IControllerResponse } from '@core/types/response.type';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/types';
import {
  ContainerDto,
  RunContainerDto,
  SendContainerInputDto,
} from '../dto/docker.dto';
import { IdeRuntimeService } from '../services/ide-runtime.service';

@Controller('ide/docker')
@UseGuards(AuthGuard('jwt'))
export class IdeDockerController {
  constructor(private readonly runtimeService: IdeRuntimeService) {}

  @Post('run')
  async createAndRunContainer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: RunContainerDto,
  ): Promise<IControllerResponse<IContainerResult>> {
    return this.runtimeService.run(user.userId, data);
  }

  @Post('terminal-ticket')
  async createTerminalTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: ContainerDto,
  ) {
    return this.runtimeService.createTerminalTicket(user.userId, data);
  }

  @Post('send')
  async sendInputToContainer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: SendContainerInputDto,
  ) {
    return this.runtimeService.sendInput(user.userId, data);
  }

  @Post('stop')
  async stopContainer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: ContainerDto,
  ) {
    return this.runtimeService.stop(user.userId, data);
  }

  @Delete()
  async removeContainer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: ContainerDto,
  ) {
    return this.runtimeService.stop(user.userId, data);
  }
}
