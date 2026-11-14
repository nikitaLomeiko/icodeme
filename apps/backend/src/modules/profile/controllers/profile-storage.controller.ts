import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileError } from '../types';
import { IControllerResponse } from '@core/types/response.type';
import { IFavorite } from '../models/profile-storage.model';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/types';
import { CreateFavoriteDto, DeleteFavoriteDto } from '../dto';
import { ProfileStorageService } from '../services/profile-storage.service';

@Controller('profiles/me/storage')
@UseGuards(AuthGuard('jwt'))
export class ProfileStorageController {
  constructor(private readonly profileStorageService: ProfileStorageService) {}

  @Get('document/favorite')
  async getDocumentFavorites(
    @CurrentUser() user: AuthenticatedUser,
    @Query('documentId') documentId: string,
  ): Promise<IControllerResponse<IFavorite>> {
    const result = await this.profileStorageService.getDocumentFavorites(
      user.userId,
      documentId,
    );

    if (result.error === ProfileError.PROFILE_NOT_FOUND) {
      throw new NotFoundException('Profile not found');
    }

    return result;
  }

  @Post('document/favorite')
  async createFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateFavoriteDto,
  ): Promise<IControllerResponse<null>> {
    const result = await this.profileStorageService.addDocumentFavorite(
      user.userId,
      data.documentId,
      data.favorite,
    );

    if (!result.success) {
      throw new BadRequestException('Error when creating a profile');
    }

    return result;
  }

  @Delete('document/favorite')
  async deleteFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: DeleteFavoriteDto,
  ): Promise<IControllerResponse<null>> {
    const result = await this.profileStorageService.removeDocumentFavorite(
      user.userId,
      data.documentId,
      data.favoriteId,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }
}
