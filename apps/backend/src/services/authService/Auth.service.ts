import { randomBytes, randomUUID } from 'crypto';
import { hashToken } from './helpers/Token.helper';
import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { BaseMongoRepository } from '@core/db';

import { JwtHelper } from './helpers/Jwt.helper';
import { TokenHelper } from './helpers/Token.helper';
import { generateId } from '@core/helpers/GenerateId';
import { generateConfirmCode } from './helpers/Generate.confirm.code';
import { IServiceResponse } from '@core/types/Response.type';

import { IUser, UserKey } from '@models/user';
import {
  IConfirmationCode,
  ConfirmationCodeKey,
} from '@models/confirmation-code';
import {
  IAuthResponse,
  IRefreshToken,
  ITokenResponse,
  IUserIdResponse,
  RefreshTokenKey,
} from '@models/auth';

import { EmailService } from '@services/emailService';

import { AuthError } from './types';

export interface ITelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

@Injectable()
export class AuthService {
  private repositoryUser: BaseMongoRepository<IUser>;
  private repositoryConfirmationCode: BaseMongoRepository<IConfirmationCode>;
  private repositoryRefreshToken: BaseMongoRepository<IRefreshToken>;
  private jwtHelper: JwtHelper;
  private tokenHelper: TokenHelper;

  constructor(
    private db: Db,
    private jwtService: JwtService,
    private emailService: EmailService,
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
    this.emailService = emailService;
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
    updateData: Partial<{ [key: string]: any }>,
  ): Promise<IServiceResponse<{ resetToken?: string }, AuthError>> {
    const purpose = updateData.isResetPassword ? 'reset' : 'email';
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
      subject: 'Код подтверждения — ICodeme',
      to: email,
      text: `Здравствуйте!\n\nВаш код подтверждения: ${code}\n\nВведите его в приложении ICodeme. Если вы не запрашивали код, просто проигнорируйте это письмо.`,
      html: `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Код подтверждения — ICodeme</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial,Helvetica,sans-serif; color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6fb; padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px; background:#ffffff; border-radius:20px; overflow:hidden;">
          <tr><td style="height:6px; background:#6757e8; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:36px 40px 40px;">
            <p style="margin:0 0 28px; color:#6757e8; font-size:18px; font-weight:700; letter-spacing:.3px;">ICodeme</p>
            <h1 style="margin:0 0 14px; font-size:25px; line-height:1.3; color:#172033;">Подтвердите адрес почты</h1>
            <p style="margin:0 0 26px; color:#667085; font-size:15px; line-height:1.6;">Введите этот код в приложении, чтобы продолжить:</p>
            <div style="margin:0 0 26px; padding:20px 16px; border:1px solid #e8e7fb; border-radius:14px; background:#f8f7ff; text-align:center; color:#302879; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:10px;">${code}</div>
            <p style="margin:0 0 8px; color:#667085; font-size:14px; line-height:1.6;">Если вы не запрашивали код, просто проигнорируйте это письмо.</p>
            <p style="margin:28px 0 0; padding-top:20px; border-top:1px solid #eef0f4; color:#98a2b3; font-size:12px; line-height:1.5;">Это автоматическое сообщение от ICodeme. Пожалуйста, не отвечайте на него.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
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
