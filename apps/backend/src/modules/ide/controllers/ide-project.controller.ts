import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IProfile, IProfileData } from '@models/profile/Profile.model';
import { ProfileService } from '@services/profileService';
import { IControllerResponse } from '@core/types/Response.type';
import { ProfileError } from '@services/profileService/types/Error.types';

@Controller('ide/project')
@UseGuards(AuthGuard('jwt'))
export class IdeProjectController {
  constructor() {}

  @Post()
  async createNewProject() {}

  @Get()
  async getProjectById() {}

  @Get('all')
  async getAllProjectByUserId() {}

  @Put()
  async changeProjectById() {}

  @Delete()
  async removeProjectById() {}
}
