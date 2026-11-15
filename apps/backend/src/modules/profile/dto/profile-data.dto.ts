import { Type } from 'class-transformer';
import { IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateProfileDataDto {
  @IsString()
  @MaxLength(2048)
  avatar: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(2000)
  about: string;
}

export class CreateProfileDto {
  @ValidateNested()
  @Type(() => CreateProfileDataDto)
  profileData: CreateProfileDataDto;
}

export class UpdateProfileDto {
  @ValidateNested()
  @Type(() => CreateProfileDataDto)
  profileData: CreateProfileDataDto;
}
