import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

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

export class ProfileDataDto extends CreateProfileDataDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  chips: string[];

  @IsString()
  @MaxLength(100)
  position: string;
}

export class CreateProfileDto {
  @ValidateNested()
  @Type(() => CreateProfileDataDto)
  profileData: CreateProfileDataDto;
}

export class UpdateProfileDto {
  @ValidateNested()
  @Type(() => ProfileDataDto)
  profileData: ProfileDataDto;
}
