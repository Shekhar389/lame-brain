import { describe, it, expect, vi } from 'vitest';
import { GeminiChatService } from '../src/modules/chat/gemini.service.js';

describe('GeminiChatService', () => {
  it('generates a response from Gemini for a prompt without prior history', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: 'Hello from Gemini!',
    });

    const mockClient = {
      models: {
        generateContent: mockGenerateContent,
      },
    } as any;

    const service = new GeminiChatService({
      client: mockClient,
      model: 'gemini-2.5-flash',
    });

    const result = await service.generateResponse('Hello, world!');

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Hello, world!' }],
        },
      ],
    });

    expect(result).toEqual({
      role: 'model',
      content: 'Hello from Gemini!',
    });
  });

  it('maps multi-turn conversation history preserving roles, order, and prompt', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: 'Paris is the capital of France.',
    });

    const mockClient = {
      models: {
        generateContent: mockGenerateContent,
      },
    } as any;

    const service = new GeminiChatService({ client: mockClient });

    const history = [
      { role: 'user' as const, content: 'What countries are in Europe?' },
      { role: 'model' as const, content: 'France, Germany, Italy, etc.' },
    ];

    const result = await service.generateResponse('What is the capital of France?', history);

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: 'What countries are in Europe?' }],
        },
        {
          role: 'model',
          parts: [{ text: 'France, Germany, Italy, etc.' }],
        },
        {
          role: 'user',
          parts: [{ text: 'What is the capital of France?' }],
        },
      ],
    });

    expect(result).toEqual({
      role: 'model',
      content: 'Paris is the capital of France.',
    });
  });

  it('throws an error if GEMINI_API_KEY is missing and no client is provided', async () => {
    const service = new GeminiChatService({ apiKey: '' });
    await expect(service.generateResponse('Hello')).rejects.toThrow(
      'GEMINI_API_KEY is required to generate responses with Gemini'
    );
  });

  it('propagates error when Gemini generateContent fails', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('Gemini API quota exceeded')),
      },
    } as any;

    const service = new GeminiChatService({ client: mockClient });

    await expect(service.generateResponse('Hello')).rejects.toThrow('Gemini API quota exceeded');
  });

  it('falls back to empty string if response.text is undefined', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: undefined }),
      },
    } as any;

    const service = new GeminiChatService({ client: mockClient });
    const result = await service.generateResponse('Hello');

    expect(result).toEqual({
      role: 'model',
      content: '',
    });
  });
});
