import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService, getDefaultLLMProvider } from '../src/modules/chat/chat.service.js';
import { OpenRouterChatService } from '../src/modules/chat/openrouter.service.js';
import { GeminiChatService } from '../src/modules/chat/gemini.service.js';
import { config } from '../src/core/config.js';

describe('getDefaultLLMProvider', () => {
  const originalLlmProvider = config.LLM_PROVIDER;
  const originalGeminiKey = config.GEMINI_API_KEY;
  const originalOpenRouterKey = config.OPENROUTER_API_KEY;

  beforeEach(() => {
    (config as any).LLM_PROVIDER = originalLlmProvider;
    (config as any).GEMINI_API_KEY = originalGeminiKey;
    (config as any).OPENROUTER_API_KEY = originalOpenRouterKey;
  });

  it('returns OpenRouterChatService when LLM_PROVIDER is openrouter', () => {
    (config as any).LLM_PROVIDER = 'openrouter';
    const provider = getDefaultLLMProvider();
    expect(provider).toBeInstanceOf(OpenRouterChatService);
  });

  it('returns GeminiChatService when LLM_PROVIDER is gemini', () => {
    (config as any).LLM_PROVIDER = 'gemini';
    const provider = getDefaultLLMProvider();
    expect(provider).toBeInstanceOf(GeminiChatService);
  });

  it('returns OpenRouterChatService when OPENROUTER_API_KEY is present', () => {
    (config as any).LLM_PROVIDER = undefined;
    (config as any).OPENROUTER_API_KEY = 'test-openrouter-key';
    (config as any).GEMINI_API_KEY = 'test-gemini-key';

    const provider = getDefaultLLMProvider();
    expect(provider).toBeInstanceOf(OpenRouterChatService);
  });

  it('defaults to GeminiChatService when no provider configuration is set', () => {
    (config as any).LLM_PROVIDER = undefined;
    (config as any).OPENROUTER_API_KEY = undefined;
    (config as any).GEMINI_API_KEY = undefined;

    const provider = getDefaultLLMProvider();
    expect(provider).toBeInstanceOf(GeminiChatService);
  });
});

describe('ChatService', () => {
  it('delegates to the configured LLM provider and trims user prompt', async () => {
    const mockProvider = {
      generateResponse: vi.fn().mockResolvedValue({
        role: 'model' as const,
        content: 'Response from provider',
      }),
    };

    const service = new ChatService(mockProvider);
    const result = await service.processMessage('   Hello world   ', []);

    expect(mockProvider.generateResponse).toHaveBeenCalledWith('Hello world', []);
    expect(result).toEqual({
      role: 'model',
      content: 'Response from provider',
    });
  });

  it('dispatches to OpenRouter when provider parameter is openrouter even if server defaults to Gemini', async () => {
    (config as any).LLM_PROVIDER = 'gemini';
    const service = new ChatService();

    const result = await service.processMessage('Hello OpenRouter', [], 'openrouter');
    expect(result.content).toContain('OPENROUTER_API_KEY');
  });

  it('dispatches to Gemini when provider parameter is gemini even if server defaults to OpenRouter', async () => {
    (config as any).LLM_PROVIDER = 'openrouter';
    const service = new ChatService();

    const result = await service.processMessage('Hello Gemini', [], 'gemini');
    expect(result.content).toContain('GEMINI_API_KEY');
  });
});
