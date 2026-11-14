import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TelegramAuthDto {
  @IsOptional()
  @IsString()
  @MaxLength(8192)
  tgAuthResult?: string;

  @IsOptional()
  id?: unknown;

  @IsOptional()
  first_name?: unknown;

  @IsOptional()
  last_name?: unknown;

  @IsOptional()
  username?: unknown;

  @IsOptional()
  photo_url?: unknown;

  @IsOptional()
  auth_date?: unknown;

  @IsOptional()
  hash?: unknown;
}
