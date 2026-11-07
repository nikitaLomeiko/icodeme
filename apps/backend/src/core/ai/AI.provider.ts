import { Provider } from '@nestjs/common';
import OpenAI from 'openai';
import config from '@core/config/ai/ai.config';
import { ChatSession } from './openai/ChatSession';

export const AIProvider: Provider = {
  provide: ChatSession,
  useFactory: async () => {
    const uri = config().url;
    const apikey = config().apiKey;

    if (!uri) {
      throw new Error('AI_URL is not defined in environment variables');
    }

    const openai = new OpenAI({
      baseURL: uri,
      apiKey: apikey,
    });

    return new ChatSession(openai);
  },
};
