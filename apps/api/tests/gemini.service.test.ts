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
      model: 'gemini-2.0-flash',
    });

    const result = await service.generateResponse('Hello, world!');

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.0-flash',
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

  it('maps multi-turn conversation history ensuring role alternation', async () => {
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
      { role: 'user' as const, content: 'Tell me more.' },
    ];

    // Current prompt is also user, which coalesces with previous user turn to maintain alternation
    const result = await service.generateResponse('What is the capital of France?', history);

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-2.0-flash',
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
          parts: [{ text: 'Tell me more.\n\nWhat is the capital of France?' }],
        },
      ],
    });

    expect(result).toEqual({
      role: 'model',
      content: 'Paris is the capital of France.',
    });
  });

  it('falls back to simulated local response when no API key or client is provided', async () => {
    const service = new GeminiChatService({ apiKey: undefined });
    const result = await service.generateResponse('Hello without credentials');

    expect(result.role).toBe('model');
    expect(result.content).toContain('Simulated local response');
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

  it('throws error when response.text is empty or filtered', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: '   ' }),
      },
    } as any;

    const service = new GeminiChatService({ client: mockClient });

    await expect(service.generateResponse('Hello')).rejects.toThrow(
      'Gemini returned an empty response or content was filtered.'
    );
  });
});
