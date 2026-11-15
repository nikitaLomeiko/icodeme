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
    const result = await this.profileService.getProfileByUserId(user.userId);

    if (result.error === ProfileError.PROFILE_NOT_FOUND) {
      throw new NotFoundException('Профиль не найден');
    }

    return result;
  }

  @Post('me')
  async createMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateProfileDto,
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.createProfile(user.userId, {
      ...data.profileData,
      chips: [],
      position: 'Новичок',
    });

    if (!result.success) {
      throw new BadRequestException('Не удалось создать профиль');
    }

    return result;
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: UpdateProfileDto,
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.updateProfileData(
      data.profileData,
      user.userId,
    );

    if (!result.success) {
      throw new NotFoundException('Профиль не найден');
    }

    return result;
  }

  @Delete('me')
  async deleteMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<IControllerResponse> {
    const result = await this.profileService.deleteProfileByUserId(user.userId);

    if (!result.success) {
      throw new NotFoundException('Профиль не найден');
    }

    return result;
  }
}
