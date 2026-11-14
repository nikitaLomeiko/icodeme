import { randomBytes, randomUUID } from 'crypto';
import { hashToken } from '../helpers/token.helper';
import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { BaseMongoRepository } from '@core/database';

import { JwtHelper } from '../helpers/jwt.helper';
import { TokenHelper } from '../helpers/token.helper';
import { generateId } from '@core/helpers/generate-id';
import { generateConfirmCode } from '../helpers/generate-confirm-code';
import { IServiceResponse } from '@core/types/response.type';

import { IUser, UserKey } from '../models';
import { IConfirmationCode, ConfirmationCodeKey } from '../models';
import {
  IAuthResponse,
  IRefreshToken,
  ITokenResponse,
  IUserIdResponse,
  RefreshTokenKey,
} from '../models';

import { EmailService } from '@modules/email';

import { AuthError } from '../types';
import { createConfirmationEmail } from '../templates/confirmation-email.template';

@Injectable()
export class AuthService {
  private readonly repositoryUser: BaseMongoRepository<IUser>;
  private readonly repositoryConfirmationCode: BaseMongoRepository<IConfirmationCode>;
  private readonly repositoryRefreshToken: BaseMongoRepository<IRefreshToken>;
  private readonly jwtHelper: JwtHelper;
  private readonly tokenHelper: TokenHelper;

  constructor(
    private readonly db: Db,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {
    const collectionUser = db.collection(UserKey);
    const collectionRefreshToken = db.collection(RefreshTokenKey);
    const collectionConfirmationCode = db.collection(ConfirmationCodeKey);

    this.repositoryUser = new BaseMongoRepository<IUser>(collectionUser);
    this.repositoryRefreshToken = new BaseMongoRepository<IRefreshToken>(
      collectionRefreshToken,
    );
    this.repositoryConfirmationCode =
      new BaseMongoRepository<IConfirmationCode>(collectionConfirmationCode);

    this.jwtHelper = new JwtHelper(this.jwtService);
    this.tokenHelper = new TokenHelper(
      this.jwtService,
      this.repositoryRefreshToken,
      this.repositoryUser,
      this.jwtHelper,
    );
  }

  async login(
    email: string,
    password: string,
  ): Promise<IServiceResponse<IAuthResponse, AuthError>> {
    const existingUser = await this.repositoryUser.findOne({
      email: email,
    });

    if (!existingUser) {
      return { success: false, error: AuthError.INVALID_CREDENTIALS };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password_hash || '',
    );

    if (!isPasswordValid) {
      return { success: false, error: AuthError.INVALID_CREDENTIALS };
    }

    if (!existingUser.isEmailConfirmed) {
      return {
        success: false,
        error: AuthError.MAIL_NOT_CONFIRMED,
      };
    }

    const result = await this.tokenHelper.issueTokens(existingUser);
    return {
      ...result,
      data: result.data
        ? { ...result.data, email: existingUser.email }
        : undefined,
    };
  }

  async register(
    email: string,
    password: string,
  ): Promise<IServiceResponse<IUserIdResponse, AuthError>> {
    const existingUser = await this.repositoryUser.findOne({
      email: email,
    });

    if (existingUser) {
      return { success: false, error: AuthError.USER_EXISTS };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const newUser: IUser = {
      name: `new user_${generateId(email)}`,
      email: email,
      password_hash: hashedPassword,
      createdAt: now,
      updatedAt: now,
      _id: generateId(email),
      isEmailConfirmed: false,
      isResetPassword: false,
    };

    const resultCreatedUser = await this.repositoryUser.create(newUser);

    if (!resultCreatedUser) {
      return {
        success: false,
        error: AuthError.USER_NOT_CREATED,
      };
    }

    return {
      success: true,
      data: { userId: resultCreatedUser },
    };
  }

  async confirmCode(
    code: string,
    userId: string,
    purpose: 'email' | 'reset',
  ): Promise<IServiceResponse<{ resetToken?: string }, AuthError>> {
    const collection =
      this.db.collection<IConfirmationCode>(ConfirmationCodeKey);
    // Reserve an attempt before the expensive comparison, including concurrent requests.
    const record = await collection.findOneAndUpdate(
      { userId, purpose, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' },
    );
    if (!record || !(await bcrypt.compare(code, record.codeHash)))
      return { success: false, error: AuthError.CODE_INCORRECT };
    if (
      !(await collection.findOneAndDelete({
        _id: record._id,
        codeHash: record.codeHash,
      }))
    )
      return { success: false, error: AuthError.CODE_INCORRECT };
    if (purpose === 'reset') {
      const resetToken = randomBytes(32).toString('hex');
      await this.repositoryUser.update(
        { _id: userId },
        {
          resetTokenHash: hashToken(resetToken),
          resetExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      );
      return { success: true, data: { resetToken } };
    }
    await this.repositoryUser.update(
      { _id: userId },
      { isEmailConfirmed: true },
    );
    return { success: true };
  }

  async logout(token: unknown) {
    await this.tokenHelper.revoke(token);
  }

  async refreshToken(
    token: string,
  ): Promise<IServiceResponse<ITokenResponse, AuthError>> {
    return this.tokenHelper.refreshToken(token);
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    resetToken: string,
  ): Promise<IServiceResponse<null, AuthError>> {
    if (typeof resetToken !== 'string' || !/^[a-f0-9]{64}$/.test(resetToken))
      return { success: false, error: AuthError.INVALID_CREDENTIALS };
    const password_hash = await bcrypt.hash(newPassword, 10);
    const user = await this.db.collection<IUser>(UserKey).findOneAndUpdate(
      {
        _id: userId,
        isEmailConfirmed: true,
        resetTokenHash: hashToken(resetToken),
        resetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { password_hash, isResetPassword: false },
        $unset: { resetTokenHash: '', resetExpiresAt: '' },
        $inc: { authVersion: 1 },
      },
    );
    if (!user) return { success: false, error: AuthError.INVALID_CREDENTIALS };
    await this.repositoryRefreshToken.deleteMany({ userId });
    return { success: true };
  }

  async generateAndSendConfirmCode(
    email: string,
    purpose: 'email' | 'reset' = 'email',
  ): Promise<IServiceResponse<IUserIdResponse, AuthError>> {
    const user = await this.repositoryUser.findOne({ email });

    if (!user) {
      return {
        success: false,
        error: AuthError.INVALID_CREDENTIALS,
      };
    }

    await this.repositoryConfirmationCode.deleteMany({
      userId: user._id,
      purpose,
    });

    const now = new Date();
    const code = generateConfirmCode();

    const hashedConfirmCode = await bcrypt.hash(code, 10);

    const newCode: IConfirmationCode = {
      _id: randomUUID(),
      userId: user._id,
      codeHash: hashedConfirmCode,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const resultCreatedConfirmCode =
      await this.repositoryConfirmationCode.create(newCode);

    if (!resultCreatedConfirmCode) {
      return {
        success: false,
        error: AuthError.CONFIRMATION_CODE_NOT_CREATED,
      };
    }

    await this.emailService.sendEmail({
      ...createConfirmationEmail(code),
      to: email,
    });

    return {
      data: { userId: user._id },
      success: true,
    };
  }

  async validateTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<IServiceResponse<boolean, AuthError>> {
    return this.tokenHelper.validateTokens(accessToken, refreshToken);
  }
}
