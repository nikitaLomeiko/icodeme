import { Injectable } from '@nestjs/common';
import { Db, MongoServerError } from 'mongodb';
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
    email = email.trim().toLowerCase();
    let user = await this.repositoryUser.findOne({ googleId });

    if (!user) {
      const emailOwner = await this.repositoryUser.findOne(
        { email },
        { collation: { locale: 'en', strength: 2 } },
      );
      if (emailOwner) return { success: false, error: AuthError.USER_EXISTS };
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

      let createdUserId: string;
      try {
        createdUserId = await this.repositoryUser.create(newUser);
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          const createdByAnotherRequest = await this.repositoryUser.findOne({
            googleId,
          });
          if (createdByAnotherRequest?.provider === 'google')
            return this.tokenHelper.issueTokens(createdByAnotherRequest);
          return { success: false, error: AuthError.USER_EXISTS };
        }
        throw error;
      }

      if (!createdUserId) {
        return {
          success: false,
          error: AuthError.USER_NOT_CREATED,
        };
      }

      user = { ...newUser, _id: createdUserId };
    } else if (user.provider !== 'google' || user.googleId !== googleId) {
      return {
        success: false,
        error: AuthError.USER_EXISTS,
      };
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
    email = email.trim().toLowerCase();
    let user = await this.repositoryUser.findOne({ githubId });

    if (!user) {
      const emailOwner = await this.repositoryUser.findOne(
        { email },
        { collation: { locale: 'en', strength: 2 } },
      );
      if (emailOwner) return { success: false, error: AuthError.USER_EXISTS };
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

      let createdUserId: string;
      try {
        createdUserId = await this.repositoryUser.create(newUser);
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          const createdByAnotherRequest = await this.repositoryUser.findOne({
            githubId,
          });
          if (createdByAnotherRequest?.provider === 'github')
            return this.tokenHelper.issueTokens(createdByAnotherRequest);
          return { success: false, error: AuthError.USER_EXISTS };
        }
        throw error;
      }

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
      ? `${username.toLowerCase()}@telegram.com`
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

      let createdUserId: string;
      try {
        createdUserId = await this.repositoryUser.create(newUser);
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          const createdByAnotherRequest = await this.repositoryUser.findOne({
            telegramId,
          });
          if (createdByAnotherRequest?.provider === 'telegram')
            return this.tokenHelper.issueTokens(createdByAnotherRequest);
          return { success: false, error: AuthError.USER_EXISTS };
        }
        throw error;
      }

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
