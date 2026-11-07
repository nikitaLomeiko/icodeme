import { ChatModel } from 'openai/resources';
import { IMessage } from './Message.type';

export abstract class ChatSessionAbstract {
  abstract setSystemPrompt(prompt: string): void;
  abstract setModel(model: ChatModel): void;
  abstract send(message: string): Promise<string>;
  abstract getHistory(): IMessage[];
  abstract setHistory(messages: IMessage[]): void;
}
