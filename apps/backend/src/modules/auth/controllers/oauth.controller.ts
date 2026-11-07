import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { setSession } from '@services/authService/helpers/Auth.http';
import {
  GoogleStateGuard,
  GitHubStateGuard,
} from '@services/authService/strategy/OAuth-state.guard';
import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Res,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OauthService } from '@services/authService';
import config from '@core/config/google/google.config';
import githubConfig from '@core/config/github/github.config';
import telegramConfig from '@core/config/telegram/telegram.config';

import type * as express from 'express';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('google')
  @UseGuards(GoogleStateGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleStateGuard)
  async googleAuthRedirect(@Request() req, @Res() res: express.Response) {
    const googleUser = req.user;

    const result = await this.oauthService.validateOrCreateGoogleUser(
      googleUser.googleId,
      googleUser.email,
      `${googleUser.name?.givenName || ''} ${googleUser.name?.familyName || ''}`.trim(),
      googleUser.picture,
    );

    const frontendUrl = config().frontendURL;

    if (!result.success) {
      return res.redirect(`${frontendUrl}/oauth/error?error=user_exists`);
    }

    setSession(res, result.data!);
    return res.redirect(`${frontendUrl}/oauth/success`);
  }

  @Get('github')
  @UseGuards(GitHubStateGuard)
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(GitHubStateGuard)
  async githubAuthRedirect(@Request() req, @Res() res: express.Response) {
    const githubUser = req.user;

    const result = await this.oauthService.validateOrCreateGitHubUser(
      githubUser.githubId,
      githubUser.email,
      githubUser.name,
      githubUser.picture,
      githubUser.username,
    );

    const frontendUrl = githubConfig().frontendURL;

    if (!result.success) {
      return res.redirect(`${frontendUrl}/oauth/error?error=user_exists`);
    }

    setSession(res, result.data!);
    return res.redirect(`${frontendUrl}/oauth/success`);
  }

  @Post('telegram/verify')
  async telegramVerify(@Body() body: any, @Res() res: express.Response) {
    let data = body;
    if (body?.tgAuthResult !== undefined) {
      if (
        typeof body.tgAuthResult !== 'string' ||
        body.tgAuthResult.length > 8192
      )
        throw new BadRequestException();
      try {
        data = JSON.parse(
          Buffer.from(body.tgAuthResult, 'base64').toString('utf8'),
        );
      } catch {
        throw new BadRequestException('Invalid Telegram payload');
      }
    }
    if (!this.oauthService.verifyTelegramAuthData(data))
      throw new UnauthorizedException('Invalid Telegram signature');
    const result = await this.oauthService.validateOrCreateTelegramUser(
      String(data.id),
      data.first_name,
      data.last_name,
      data.username,
      data.photo_url,
    );
    if (!result.success || !result.data)
      throw new UnauthorizedException('Telegram login failed');
    setSession(res, result.data);
    return res.json({ success: true, data: { userId: result.data.userId } });
  }

  @Post('telegram')
  async telegramAuthPost(@Body() body: any, @Res() res: express.Response) {
    return this.telegramVerify(body, res);
  }
}
