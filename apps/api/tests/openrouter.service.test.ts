import { describe, it, expect, vi } from 'vitest';
import { OpenRouterChatService } from '../src/modules/chat/openrouter.service.js';

describe('OpenRouterChatService', () => {
  it('generates a response from OpenRouter for a prompt without prior history', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello from OpenRouter free model!',
          },
        },
      ],
    });

    const mockClient = {
      chat: {
        send: mockSend,
      },
    } as any;

    const service = new OpenRouterChatService({
      client: mockClient,
      model: 'meta-llama/llama-3.3-70b-instruct:free',
    });

    const result = await service.generateResponse('Hello, world!');

    expect(mockSend).toHaveBeenCalledWith({
      chatRequest: {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'user',
            content: 'Hello, world!',
          },
        ],
      },
    });

    expect(result).toEqual({
      role: 'model',
      content: 'Hello from OpenRouter free model!',
    });
  });

  it('maps multi-turn conversation history preserving role translation (model -> assistant)', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Paris is the capital of France.',
          },
        },
      ],
    });

    const mockClient = {
      chat: {
        send: mockSend,
      },
    } as any;

    const service = new OpenRouterChatService({
      client: mockClient,
      model: 'meta-llama/llama-3.3-70b-instruct:free',
    });

    const history = [
      { role: 'user' as const, content: 'What countries are in Europe?' },
      { role: 'model' as const, content: 'France, Germany, Italy, etc.' },
    ];

    const result = await service.generateResponse('What is the capital of France?', history);

    expect(mockSend).toHaveBeenCalledWith({
      chatRequest: {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          {
            role: 'user',
            content: 'What countries are in Europe?',
          },
          {
            role: 'assistant',
            content: 'France, Germany, Italy, etc.',
          },
          {
            role: 'user',
            content: 'What is the capital of France?',
          },
        ],
      },
    });

    expect(result).toEqual({
      role: 'model',
      content: 'Paris is the capital of France.',
    });
  });

  it('falls back to simulated local response when no API key or client is provided', async () => {
    const service = new OpenRouterChatService({ apiKey: undefined });
    const result = await service.generateResponse('Hello without credentials');

    expect(result.role).toBe('model');
    expect(result.content).toContain('Simulated local response');
    expect(result.content).toContain('OPENROUTER_API_KEY');
  });

  it('propagates error when OpenRouter send fails', async () => {
    const mockClient = {
      chat: {
        send: vi.fn().mockRejectedValue(new Error('OpenRouter rate limit reached')),
      },
    } as any;

    const service = new OpenRouterChatService({ client: mockClient });

    await expect(service.generateResponse('Hello')).rejects.toThrow('OpenRouter rate limit reached');
  });

  it('extracts content correctly when message content is an array of content parts', async () => {
    const mockSend = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: [
              { type: 'text', text: 'First part. ' },
              { type: 'text', text: 'Second part.' },
            ],
          },
        },
      ],
    });

    const mockClient = {
      chat: {
        send: mockSend,
      },
    } as any;

    const service = new OpenRouterChatService({ client: mockClient });
    const result = await service.generateResponse('Hello multipart');

    expect(result).toEqual({
      role: 'model',
      content: 'First part. Second part.',
    });
  });

  it('throws ExternalServiceError when response choices are empty or content is empty', async () => {
    const mockClient = {
      chat: {
        send: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '   ' } }],
        }),
      },
    } as any;

    const service = new OpenRouterChatService({ client: mockClient });

    await expect(service.generateResponse('Hello')).rejects.toThrow(
      'OpenRouter: Returned an empty response or content was filtered.'
    );
  });
});
