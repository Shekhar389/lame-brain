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

const providerFactories: Record<LLMProviderName, () => LLMProvider> = {
  openrouter: () => new OpenRouterChatService(),
  gemini: () => new GeminiChatService(),
};

export class ChatService {
  private readonly cachedProviders: Partial<Record<LLMProviderName, LLMProvider>> = {};

  constructor(private readonly providerOverride?: LLMProvider) {}

  private resolveProvider(providerName?: LLMProviderName): LLMProvider {
    if (providerName && providerFactories[providerName]) {
      if (!this.cachedProviders[providerName]) {
        this.cachedProviders[providerName] = providerFactories[providerName]();
      }
      return this.cachedProviders[providerName]!;
    }

    if (this.providerOverride) {
      return this.providerOverride;
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
