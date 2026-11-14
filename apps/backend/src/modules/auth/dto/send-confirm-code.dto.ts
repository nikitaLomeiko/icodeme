import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';

export class SendConfirmCodeDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsIn(['email', 'reset'])
  purpose?: 'email' | 'reset';
}
