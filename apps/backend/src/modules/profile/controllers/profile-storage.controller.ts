import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService, ProfileError } from '@services/profileService';
import { IControllerResponse } from '@core/types/Response.type';
import { IFavorite, ILineFavorite } from '@models/profile-storage';

@Controller('profiles/me/storage')
@UseGuards(AuthGuard('jwt'))
export class ProfileStorageController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('document/favorite')
  async getDocumentFavorites(
    @Request() req,
    @Query('documentId') documentId: string,
  ): Promise<IControllerResponse<IFavorite>> {
    const result = await this.profileService.getDocumentFavoritesById(
      req.user.userId,
      documentId,
    );

    if (result.error === ProfileError.PROFILE_NOT_FOUND) {
      throw new NotFoundException('Profile not found');
    }

    return result;
  }

  @Post('document/favorite')
  async createNewProfile(
    @Request() req,
    @Body() data: { documentId: string; favorite: ILineFavorite },
  ): Promise<IControllerResponse<null>> {
    const result = await this.profileService.createNewDocumentFavorite(
      req.user.userId,
      data.documentId,
      data.favorite,
    );

    if (!result.success) {
      throw new BadRequestException('Error when creating a profile');
    }

    return result;
  }

  @Delete('document/favorite')
  async deleteMyProfile(
    @Request() req,
    @Body() data: { documentId: string; favoriteId: string },
  ): Promise<IControllerResponse<null>> {
    const result = await this.profileService.removeDocumentFavoriteById(
      req.user.userId,
      data.documentId,
      data.favoriteId,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }
}
