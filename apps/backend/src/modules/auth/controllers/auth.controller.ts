import {
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { generateId } from '@core/helpers/generate-id';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthError } from '../types';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  ConfirmCodeDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendConfirmCodeDto,
} from '../dto';
import type { AuthenticatedUser } from '../types';
import { cookie, setSession, clearSession } from '../helpers/auth.http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data.email, data.password);
    if (result.error === AuthError.MAIL_NOT_CONFIRMED) {
      await this.authService.generateAndSendConfirmCode(data.email, 'email');
      throw new ForbiddenException('Подтвердите почту перед входом');
    }
    if (!result.success || !result.data)
      throw new UnauthorizedException('Неверная почта или пароль');
    setSession(res, result.data);
    return {
      success: true,
      data: { userId: result.data.userId, email: result.data.email },
      message: 'Вход выполнен',
    };
  }

  @Post('register')
  async register(@Body() data: RegisterDto) {
    const result = await this.authService.register(data.email, data.password);
    if (!result.success)
      throw new ConflictException('Не удалось зарегистрировать аккаунт');
    await this.authService.generateAndSendConfirmCode(data.email, 'email');
    return { ...result, message: 'Код отправлен на почту' };
  }

  @Post('confirm/code-email')
  async confirmEmail(@Body() data: ConfirmCodeDto) {
    return this.confirm(data, false);
  }
  @Post('confirm/code-reset-password')
  async confirmReset(@Body() data: ConfirmCodeDto) {
    return this.confirm(data, true);
  }
  private async confirm(data: ConfirmCodeDto, reset: boolean) {
    const result = await this.authService.confirmCode(
      data.code,
      data.userId,
      reset ? 'reset' : 'email',
    );
    if (!result.success)
      throw new BadRequestException('Неверный или просроченный код');
    return { ...result, message: 'Код подтверждён' };
  }

  @Post('send/confirm-code')
  async sendCode(@Body() data: SendConfirmCodeDto) {
    const purpose = data.purpose ?? 'reset';
    const result = await this.authService.generateAndSendConfirmCode(
      data.email,
      purpose,
    );
    return {
      success: true,
      data: {
        userId:
          result.data?.userId ?? generateId(data.email.trim().toLowerCase()),
      },
      message: 'Если адрес зарегистрирован, код отправлен',
    };
  }

  @Post('reset/password')
  async reset(@Body() data: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      data.userId,
      data.newPassword,
      data.resetToken,
    );
    if (!result.success)
      throw new ForbiddenException('Подтвердите сброс пароля заново');
    return { success: true, message: 'Пароль изменён. Войдите заново.' };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshToken(
      cookie(request, 'icodeme_refresh'),
    );
    if (!result.success || !result.data)
      throw new UnauthorizedException('Сессия истекла');
    setSession(res, result.data);
    return { success: true };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(cookie(request, 'icodeme_refresh'));
    clearSession(res);
    return { success: true };
  }

  @Post('validate/tokens')
  @UseGuards(AuthGuard('jwt'))
  validate() {
    return { success: true };
  }

  @Get('verify-token')
  @UseGuards(AuthGuard('jwt'))
  verifyToken(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, data: user };
  }
}
