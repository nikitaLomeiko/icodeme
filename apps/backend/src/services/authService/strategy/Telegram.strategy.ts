import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import * as crypto from 'crypto';
import config from '@core/config/telegram/telegram.config';

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
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor() {
    super();
  }

  async validate(req: Request): Promise<any> {
    const data: ITelegramAuthData = {
      id: (req.query.id as string) || req.body.id,
      first_name: (req.query.first_name as string) || req.body.first_name,
      last_name: (req.query.last_name as string) || req.body.last_name,
      username: (req.query.username as string) || req.body.username,
      photo_url: (req.query.photo_url as string) || req.body.photo_url,
      auth_date: (req.query.auth_date as string) || req.body.auth_date,
      hash: (req.query.hash as string) || req.body.hash,
    };

    if (!this.verifyTelegramAuthData(data)) {
      return null;
    }

    return {
      telegramId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      photoUrl: data.photo_url,
    };
  }

  private verifyTelegramAuthData(data: ITelegramAuthData): boolean {
    const { hash, auth_date, ...withoutHash } = data;

    const dataCheckString = Object.keys(withoutHash)
      .sort()
      .map((key) => `${key}=${withoutHash[key as keyof typeof withoutHash]}`)
      .join('\n');

    const secretKey = crypto
      .createHash('sha256')
      .update(config().botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return false;
    }

    const authDate = new Date(parseInt(auth_date, 10) * 1000);
    const now = new Date();
    const diffInSeconds = (now.getTime() - authDate.getTime()) / 1000;

    if (diffInSeconds > 86400) {
      return false;
    }

    return true;
  }
}
