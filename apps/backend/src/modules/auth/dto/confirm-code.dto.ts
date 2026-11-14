import { IsString, Length, MaxLength, MinLength } from 'class-validator';

export class ConfirmCodeDto {
  @IsString()
  @Length(5)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  userId: string;
}
