import OpenAI from 'openai';
import { ChatSessionAbstract } from '../types/chat-session.abstract';
import { IMessage } from '../types/message.type';
import { Injectable } from '@nestjs/common';
import { ChatModel } from 'openai/resources';

@Injectable()
export class ChatSession implements ChatSessionAbstract {
  private history: IMessage[] = [];
  private openai: OpenAI;
  private model: ChatModel;

  constructor(openai: OpenAI) {
    this.openai = openai;
    this.model = 'gpt-4o';
  }

  setModel(model: ChatModel): void {
    this.model = model;
  }

  setSystemPrompt(prompt: string): void {
    if (prompt !== '') {
      this.history = [
        {
          role: 'system',
          content: prompt.slice(0, 4000),
        },
      ];
    }
  }

  async send(message: string): Promise<string> {
    if (Buffer.byteLength(message, 'utf8') > 64 * 1024)
      throw new Error('AI prompt exceeds limit');

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        ...this.history.filter((entry) => entry.role === 'system').slice(-1),
        { role: 'user', content: message },
      ],
      max_completion_tokens: 4096,
    });

    const answer = response.choices[0]?.message?.content;

    if (
      typeof answer !== 'string' ||
      Buffer.byteLength(answer, 'utf8') > 128 * 1024
    ) {
      throw new Error(`The model did not respond`);
    }

    return answer;
  }

  getHistory(): IMessage[] {
    return this.history.map((message) => ({ ...message }));
  }

  setHistory(messages: IMessage[]): void {
    this.history = messages
      .filter(
        (message) =>
          message.role === 'system' && message.content.length <= 4000,
      )
      .slice(-1)
      .map((message) => ({ ...message }));
  }
}
