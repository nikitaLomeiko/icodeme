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

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.getProfileById(req.user.userId);

    if (result.error === ProfileError.PROFILE_NOT_FOUND) {
      throw new NotFoundException('Profile not found');
    }

    return result;
  }

  @Post('me')
  async createNewProfile(
    @Request() req,
    @Body() data: { profileData: Omit<IProfileData, 'chips' | 'position'> },
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.CreateNewProfile(req.user.userId, {
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
    @Request() req,
    @Body() data: { profileData: IProfileData },
  ): Promise<IControllerResponse<IProfile>> {
    const result = await this.profileService.ChangeProfileDataById(
      data.profileData,
      req.user.userId,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }

  @Delete('me')
  async deleteMyProfile(@Request() req): Promise<IControllerResponse> {
    const result = await this.profileService.RemoveProfileById(req.user.userId);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }
}
