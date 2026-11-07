import OpenAI from 'openai';
import { ChatSessionAbstract } from '../types/ChatSession.abstract';
import { IMessage } from '../types/Message.type';
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
      this.history.push({
        role: 'system',
        content: prompt,
      });
    }
  }

  async send(message: string): Promise<string> {
    this.history.push({
      role: 'user',
      content: message,
    });

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: this.history,
    });

    const answer = response.choices[0].message.content;

    if (answer === null) {
      throw new Error(`The model did not respond`);
    }

    return answer;
  }

  getHistory(): IMessage[] {
    return this.history;
  }

  setHistory(messages: IMessage[]): void {
    this.history = messages;
  }
}
