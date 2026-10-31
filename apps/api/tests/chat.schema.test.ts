import { describe, it, expect } from 'vitest';
import { ChatRequestSchema } from '@repo/shared';

describe('ChatRequestSchema provider parameter', () => {
  it('parses payload with provider: "openrouter"', () => {
    const result = ChatRequestSchema.safeParse({
      message: 'Hello',
      provider: 'openrouter',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provider).toBe('openrouter');
    }
  });

  it('parses payload with provider: "gemini"', () => {
    const result = ChatRequestSchema.safeParse({
      message: 'Hello',
      provider: 'gemini',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provider).toBe('gemini');
    }
  });

  it('allows provider to be undefined/omitted', () => {
    const result = ChatRequestSchema.safeParse({
      message: 'Hello',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provider).toBeUndefined();
    }
  });

  it('fails validation when provider is an unrecognized string', () => {
    const result = ChatRequestSchema.safeParse({
      message: 'Hello',
      provider: 'unsupported-llm',
    });

    expect(result.success).toBe(false);
  });
});
