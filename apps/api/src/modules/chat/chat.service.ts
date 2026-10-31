import type { ChatTurn } from '@repo/shared';
import { GeminiChatService } from './gemini.service.js';
import { OpenRouterChatService } from './openrouter.service.js';
import type { LLMProvider } from './llm-provider.interface.js';
import { config } from '../../core/config.js';

export function getDefaultLLMProvider(): LLMProvider {
  if (config.LLM_PROVIDER === 'gemini') {
    return new GeminiChatService();
  }

  if (config.LLM_PROVIDER === 'openrouter' || config.OPENROUTER_API_KEY) {
    return new OpenRouterChatService();
  }

  return new GeminiChatService();
}

export class ChatService {
  private readonly provider?: LLMProvider;

  constructor(provider?: LLMProvider) {
    this.provider = provider;
  }

  async processMessage(prompt: string, history: ChatTurn[] = []): Promise<ChatTurn> {
    const provider = this.provider ?? getDefaultLLMProvider();
    const sanitizedPrompt = prompt.trim();
    return provider.generateResponse(sanitizedPrompt, history);
  }
}
