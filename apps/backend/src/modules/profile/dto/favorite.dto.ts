import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FavoriteLinkDto {
  @IsString()
  @MaxLength(256)
  id: string;

  @IsString()
  @MaxLength(256)
  elementId: string;

  @IsString()
  @MaxLength(10_000)
  text: string;

  @IsString()
  @MaxLength(64)
  type: string;

  @IsInt()
  @Min(0)
  timestamp: number;

  @IsInt()
  @Min(0)
  scrollPosition: number;
}

export class CreateFavoriteDto {
  @IsString()
  @MaxLength(256)
  documentId: string;

  @ValidateNested()
  @Type(() => FavoriteLinkDto)
  favorite: FavoriteLinkDto;
}

export class DeleteFavoriteDto {
  @IsString()
  @MaxLength(256)
  documentId: string;

  @IsString()
  @MaxLength(256)
  favoriteId: string;
}
