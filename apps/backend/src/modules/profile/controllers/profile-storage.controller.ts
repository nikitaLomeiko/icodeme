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
  async getDocumentFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Query('documentId') documentId: string,
  ): Promise<IControllerResponse<IFavorite | null>> {
    const result = await this.profileStorageService.getDocumentFavorite(
      user.userId,
      documentId,
    );

    if (result.error === ProfileError.USER_NOT_FOUND) {
      throw new NotFoundException('Профиль не найден');
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
      throw new BadRequestException('Не удалось добавить избранное');
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
      throw new NotFoundException('Запись избранного не найдена');
    }

    return result;
  }
}
