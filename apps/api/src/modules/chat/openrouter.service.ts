import { OpenRouter } from '@openrouter/sdk';
import type { ChatTurn } from '@repo/shared';
import type { LLMProvider } from './llm-provider.interface.js';
import { config } from '../../core/config.js';
import { ExternalServiceError } from '../../core/errors.js';

export interface OpenRouterChatServiceOptions {
  apiKey?: string;
  model?: string;
  client?: OpenRouter;
}

/**
 * OpenRouterChatService implements LLMProvider using the official @openrouter/sdk.
 * Supports live OpenRouter generation when OPENROUTER_API_KEY is configured,
 * and falls back to a simulated local response when no key is provided.
 */
export class OpenRouterChatService implements LLMProvider {
  private client: OpenRouter | null = null;
  private readonly model: string;
  private readonly apiKey?: string;

  constructor(options: OpenRouterChatServiceOptions = {}) {
    this.model = options.model ?? config.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free';
    this.apiKey = 'apiKey' in options ? options.apiKey : config.OPENROUTER_API_KEY;
    if (options.client) {
      this.client = options.client;
    }
  }

  private getClient(): OpenRouter | null {
    if (this.client) {
      return this.client;
    }

    if (this.apiKey) {
      this.client = new OpenRouter({ apiKey: this.apiKey });
      return this.client;
    }

    return null;
  }

  async generateResponse(prompt: string, history: ChatTurn[] = []): Promise<ChatTurn> {
    const client = this.getClient();

    // Fallback when no OpenRouter API key is configured (local dev & testing without active credentials)
    if (!client) {
      const contextNote =
        history.length > 0
          ? ` (incorporating ${history.length} prior conversation turn${history.length === 1 ? '' : 's'})`
          : '';

      return {
        role: 'model',
        content: `I received your message: "${prompt}"${contextNote}. (Simulated local response; configure OPENROUTER_API_KEY for live OpenRouter generation).`,
      };
    }

    const messages = [
      ...history.map((turn) => ({
        role: (turn.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: turn.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await client.chat.send({
      chatRequest: {
        model: this.model,
        messages,
      },
    });

    const choice = response.choices?.[0];
    const replyContent = choice?.message?.content;
    let replyText = '';

    if (typeof replyContent === 'string') {
      replyText = replyContent.trim();
    } else if (Array.isArray(replyContent)) {
      replyText = replyContent
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
            return part.text;
          }
          return '';
        })
        .join('')
        .trim();
    }

    if (!replyText) {
      throw new ExternalServiceError('OpenRouter', 'Returned an empty response or content was filtered.');
    }

    return {
      role: 'model',
      content: replyText,
    };
  }
}
