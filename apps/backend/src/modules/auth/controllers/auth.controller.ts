import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService, AuthError } from '@services/authService';
import {
  cookie,
  setSession,
  clearSession,
  textField,
} from '@services/authService/helpers/Auth.http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const email = textField(req.body, 'email', 3, 254);
    const result = await this.authService.login(
      email,
      textField(req.body, 'password', 1, 72),
    );
    if (result.error === AuthError.MAIL_NOT_CONFIRMED) {
      await this.authService.generateAndSendConfirmCode(email, 'email');
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
  async register(@Request() req) {
    const email = textField(req.body, 'email', 3, 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new BadRequestException('Invalid email');
    const result = await this.authService.register(
      email,
      textField(req.body, 'password', 8, 72),
    );
    if (!result.success)
      throw new ConflictException('Не удалось зарегистрировать аккаунт');
    await this.authService.generateAndSendConfirmCode(email, 'email');
    return { ...result, message: 'Код отправлен на почту' };
  }

  @Post('confirm/code-email')
  async confirmEmail(@Request() req) {
    return this.confirm(req, false);
  }
  @Post('confirm/code-reset-password')
  async confirmReset(@Request() req) {
    return this.confirm(req, true);
  }
  private async confirm(req, reset: boolean) {
    const result = await this.authService.confirmCode(
      textField(req.body, 'code', 5, 5),
      textField(req.body, 'userId'),
      reset ? { isResetPassword: true } : { isEmailConfirmed: true },
    );
    if (!result.success)
      throw new BadRequestException('Неверный или просроченный код');
    return { ...result, message: 'Код подтверждён' };
  }

  @Post('send/confirm-code')
  async sendCode(@Request() req) {
    const purpose = req.body?.purpose === 'email' ? 'email' : 'reset';
    const result = await this.authService.generateAndSendConfirmCode(
      textField(req.body, 'email', 3, 254),
      purpose,
    );
    if (!result.success)
      throw new BadRequestException('Не удалось отправить код');
    return { ...result, message: 'Код отправлен' };
  }

  @Post('reset/password')
  async reset(@Request() req) {
    const result = await this.authService.resetPassword(
      textField(req.body, 'userId'),
      textField(req.body, 'newPassword', 8, 72),
      textField(req.body, 'resetToken', 64, 64),
    );
    if (!result.success)
      throw new ForbiddenException('Подтвердите сброс пароля заново');
    return { success: true, message: 'Пароль изменён. Войдите заново.' };
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshToken(
      cookie(req, 'icodeme_refresh'),
    );
    if (!result.success || !result.data)
      throw new UnauthorizedException('Сессия истекла');
    setSession(res, result.data);
    return { success: true };
  }

  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(cookie(req, 'icodeme_refresh'));
    clearSession(res);
    return { success: true };
  }

  @Post('validate/tokens')
  @UseGuards(AuthGuard('jwt'))
  async validate() {
    return { success: true };
  }

  @Get('verify-token')
  @UseGuards(AuthGuard('jwt'))
  async verifyToken(@Request() req) {
    return { success: true, data: req.user };
  }
}
