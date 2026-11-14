import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

import { BaseMongoRepository } from '@core/database';

import { JwtHelper } from '../helpers/jwt.helper';
import { TokenHelper } from '../helpers/token.helper';
import { generateId } from '@core/helpers/generate-id';
import { IServiceResponse } from '@core/types/response.type';

import { IUser, UserKey } from '../models';
import {
  IRefreshToken,
  ITokenResponse,
  IUserIdResponse,
  RefreshTokenKey,
} from '../models';

import telegramConfig from '@core/config/telegram/telegram.config';
import { AuthError } from '../types';
import type { ITelegramAuthData } from '../types';

@Injectable()
export class OAuthService {
  private repositoryUser: BaseMongoRepository<IUser>;
  private repositoryRefreshToken: BaseMongoRepository<IRefreshToken>;
  private jwtHelper: JwtHelper;
  private tokenHelper: TokenHelper;

  constructor(
    db: Db,
    private jwtService: JwtService,
  ) {
    const collectionUser = db.collection(UserKey);
    const collectionRefreshToken = db.collection(RefreshTokenKey);

    this.repositoryUser = new BaseMongoRepository<IUser>(collectionUser);
    this.repositoryRefreshToken = new BaseMongoRepository<IRefreshToken>(
      collectionRefreshToken,
    );

    this.jwtHelper = new JwtHelper(this.jwtService);
    this.tokenHelper = new TokenHelper(
      this.jwtService,
      this.repositoryRefreshToken,
      this.repositoryUser,
      this.jwtHelper,
    );
  }

  async validateOrCreateGoogleUser(
    googleId: string,
    email: string,
    name: string,
    picture?: string,
  ): Promise<IServiceResponse<ITokenResponse & IUserIdResponse, AuthError>> {
    let user = await this.repositoryUser.findOne({ email });

    if (!user) {
      const now = new Date();
      const newUser: IUser = {
        _id: generateId(email),
        email,
        name,
        provider: 'google',
        googleId,
        picture,
        isEmailConfirmed: true,
        isResetPassword: false,
        createdAt: now,
        updatedAt: now,
      };

      const createdUserId = await this.repositoryUser.create(newUser);

      if (!createdUserId) {
        return {
          success: false,
          error: AuthError.USER_NOT_CREATED,
        };
      }

      user = { ...newUser, _id: createdUserId };
    } else if (
      user.provider !== 'google' ||
      (user.googleId !== googleId &&
        user.googleId !== user.email &&
        user.googleId !== user.picture?.split('/')[4])
    ) {
      return {
        success: false,
        error: AuthError.USER_EXISTS,
      };
    }

    if (user.googleId !== googleId) {
      await this.repositoryUser.update({ _id: user._id }, { googleId });
    }
    return this.tokenHelper.issueTokens(user);
  }

  async validateOrCreateGitHubUser(
    githubId: string,
    email: string,
    name: string,
    picture?: string,
    username?: string,
  ): Promise<IServiceResponse<ITokenResponse & IUserIdResponse, AuthError>> {
    let user = await this.repositoryUser.findOne({ email });

    if (!user) {
      const now = new Date();
      const newUser: IUser = {
        _id: generateId(email),
        email,
        name,
        provider: 'github',
        githubId,
        picture,
        username,
        isEmailConfirmed: true,
        isResetPassword: false,
        createdAt: now,
        updatedAt: now,
      };

      const createdUserId = await this.repositoryUser.create(newUser);

      if (!createdUserId) {
        return {
          success: false,
          error: AuthError.USER_NOT_CREATED,
        };
      }

      user = { ...newUser, _id: createdUserId };
    } else if (user.provider !== 'github' || user.githubId !== githubId) {
      return {
        success: false,
        error: AuthError.USER_EXISTS,
      };
    }

    return this.tokenHelper.issueTokens(user);
  }

  async validateOrCreateTelegramUser(
    telegramId: string,
    firstName: string,
    lastName?: string,
    username?: string,
    photoUrl?: string,
  ): Promise<IServiceResponse<ITokenResponse & IUserIdResponse, AuthError>> {
    const email = username
      ? `${username}@telegram.com`
      : `${telegramId}@telegram.com`;
    let user = await this.repositoryUser.findOne({ telegramId });

    if (!user) {
      const now = new Date();
      const name = `${firstName} ${lastName || ''}`.trim();
      const newUser: IUser = {
        _id: generateId(telegramId),
        email,
        name: name || `Telegram User ${telegramId}`,
        provider: 'telegram',
        telegramId,
        picture: photoUrl,
        username,
        isEmailConfirmed: true,
        isResetPassword: false,
        createdAt: now,
        updatedAt: now,
      };

      const createdUserId = await this.repositoryUser.create(newUser);

      if (!createdUserId) {
        return {
          success: false,
          error: AuthError.USER_NOT_CREATED,
        };
      }

      user = { ...newUser, _id: createdUserId };
    } else if (user.provider !== 'telegram') {
      return {
        success: false,
        error: AuthError.USER_EXISTS,
      };
    }

    return this.tokenHelper.issueTokens(user);
  }

  verifyTelegramAuthData(data: ITelegramAuthData): boolean {
    try {
      const botToken = telegramConfig().botToken;
      if (
        !botToken ||
        !data ||
        typeof data !== 'object' ||
        !/^[a-f0-9]{64}$/.test(data.hash) ||
        !/^[0-9]+$/.test(String(data.id)) ||
        typeof data.first_name !== 'string'
      )
        return false;
      const allowed = [
        'id',
        'first_name',
        'last_name',
        'username',
        'photo_url',
        'auth_date',
        'hash',
      ];
      if (
        Object.entries(data).some(
          ([key, value]) =>
            !allowed.includes(key) ||
            (value !== undefined &&
              typeof value !== 'string' &&
              typeof value !== 'number'),
        )
      )
        return false;
      const age = Date.now() / 1000 - Number(data.auth_date);
      if (!Number.isFinite(age) || age < -30 || age > 300) return false;
      const dataCheckString = Object.keys(data)
        .filter((key) => key !== 'hash' && data[key] !== undefined)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join('\n');
      const secret = crypto.createHash('sha256').update(botToken).digest();
      const expected = crypto
        .createHmac('sha256', secret)
        .update(dataCheckString)
        .digest();
      return crypto.timingSafeEqual(expected, Buffer.from(data.hash, 'hex'));
    } catch {
      return false;
    }
  }
}
