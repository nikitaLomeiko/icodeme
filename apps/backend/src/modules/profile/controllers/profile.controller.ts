import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IProfile } from '../models/profile.model';
import { ProfileService } from '../services/profile.service';
import { IControllerResponse } from '@core/types/response.type';
import { ProfileError } from '../types/profile-error.types';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/types';
import { CreateProfileDto, UpdateProfileDto } from '../dto';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.getProfileById(user.userId);

    if (result.error === ProfileError.PROFILE_NOT_FOUND) {
      throw new NotFoundException('Profile not found');
    }

    return result;
  }

  @Post('me')
  async createNewProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateProfileDto,
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.createNewProfile(user.userId, {
      ...data.profileData,
      chips: ['test', 'test'],
      position: 'Begginer',
    });

    if (!result.success) {
      throw new BadRequestException('Error when creating a profile');
    }

    return result;
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: UpdateProfileDto,
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.changeProfileDataById(
      data.profileData,
      user.userId,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }

  @Delete('me')
  async deleteMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<IControllerResponse> {
    const result = await this.profileService.removeProfileById(user.userId);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }
}
