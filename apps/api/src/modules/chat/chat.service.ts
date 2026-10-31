import type { ChatTurn, LLMProviderName } from '@repo/shared';
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

  private resolveProvider(providerName?: LLMProviderName): LLMProvider {
    if (this.provider) {
      return this.provider;
    }

    if (providerName === 'openrouter') {
      return new OpenRouterChatService();
    }

    if (providerName === 'gemini') {
      return new GeminiChatService();
    }

    return getDefaultLLMProvider();
  }

  async processMessage(
    prompt: string,
    history: ChatTurn[] = [],
    providerName?: LLMProviderName
  ): Promise<ChatTurn> {
    const provider = this.resolveProvider(providerName);
    const sanitizedPrompt = prompt.trim();
    return provider.generateResponse(sanitizedPrompt, history);
  }
}
