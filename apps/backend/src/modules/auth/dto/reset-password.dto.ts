import {
  IsByteLength,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  userId: string;

  @IsString()
  @MinLength(8)
  @IsByteLength(0, 72)
  newPassword: string;

  @IsString()
  @Length(64)
  resetToken: string;
}
