import type { ChatTurn } from '@repo/shared';
import { GeminiChatService } from './gemini.service.js';
import type { LLMProvider } from './llm-provider.interface.js';

export class ChatService {
  constructor(private readonly provider: LLMProvider = new GeminiChatService()) {}

  async processMessage(prompt: string, history: ChatTurn[] = []): Promise<ChatTurn> {
    return this.provider.generateResponse(prompt, history);
  }
}
