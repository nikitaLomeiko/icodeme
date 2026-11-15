import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { setSession } from '../helpers/auth.http';
import {
  GoogleStateGuard,
  GitHubStateGuard,
} from '../strategies/oauth-state.guard';
import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Body,
} from '@nestjs/common';
import { OAuthService } from '../services/oauth.service';
import config from '@core/config/google/google.config';
import githubConfig from '@core/config/github/github.config';
import type { GitHubOAuthUser, GoogleOAuthUser, OAuthRequest } from '../types';
import { TelegramAuthDto } from '../dto';
import { parseTelegramAuthData } from '../helpers/parse-telegram-auth-data';

import type * as express from 'express';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('google')
  @UseGuards(GoogleStateGuard)
  googleAuth(): void {}

  @Get('google/callback')
  @UseGuards(GoogleStateGuard)
  async googleAuthRedirect(
    @Req() req: OAuthRequest<GoogleOAuthUser>,
    @Res() res: express.Response,
  ) {
    const googleUser = req.user;

    const result = await this.oauthService.validateOrCreateGoogleUser(
      googleUser.googleId,
      googleUser.email,
      `${googleUser.name?.givenName || ''} ${googleUser.name?.familyName || ''}`.trim(),
      googleUser.picture,
    );

    const frontendUrl = config().frontendURL;

    if (!result.success || !result.data) {
      return res.redirect(`${frontendUrl}/oauth/error?error=user_exists`);
    }

    setSession(res, result.data);
    return res.redirect(`${frontendUrl}/oauth/success`);
  }

  @Get('github')
  @UseGuards(GitHubStateGuard)
  githubAuth(): void {}

  @Get('github/callback')
  @UseGuards(GitHubStateGuard)
  async githubAuthRedirect(
    @Req() req: OAuthRequest<GitHubOAuthUser>,
    @Res() res: express.Response,
  ) {
    const githubUser = req.user;

    const result = await this.oauthService.validateOrCreateGitHubUser(
      githubUser.githubId,
      githubUser.email,
      githubUser.name,
      githubUser.picture,
      githubUser.username,
    );

    const frontendUrl = githubConfig().frontendURL;

    if (!result.success || !result.data) {
      return res.redirect(`${frontendUrl}/oauth/error?error=user_exists`);
    }

    setSession(res, result.data);
    return res.redirect(`${frontendUrl}/oauth/success`);
  }

  @Post('telegram/verify')
  async telegramVerify(
    @Body() body: TelegramAuthDto,
    @Res() res: express.Response,
  ) {
    let source: unknown = body;
    if (body.tgAuthResult !== undefined) {
      try {
        source = JSON.parse(
          Buffer.from(body.tgAuthResult, 'base64').toString('utf8'),
        ) as unknown;
      } catch {
        throw new BadRequestException('Некорректные данные Telegram');
      }
    }
    const data = parseTelegramAuthData(source);
    if (!this.oauthService.verifyTelegramAuthData(data))
      throw new UnauthorizedException('Некорректная подпись Telegram');
    const result = await this.oauthService.validateOrCreateTelegramUser(
      String(data.id),
      data.first_name,
      data.last_name,
      data.username,
      data.photo_url,
    );
    if (!result.success || !result.data)
      throw new UnauthorizedException('Не удалось войти через Telegram');
    setSession(res, result.data);
    return res.json({ success: true, data: { userId: result.data.userId } });
  }

  @Post('telegram')
  async telegramAuthPost(
    @Body() body: TelegramAuthDto,
    @Res() res: express.Response,
  ) {
    return this.telegramVerify(body, res);
  }
}
