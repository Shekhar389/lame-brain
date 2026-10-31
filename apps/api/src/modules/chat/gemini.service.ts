import { GoogleGenAI } from '@google/genai';
import type { ChatTurn } from '@repo/shared';
import type { LLMProvider } from './llm-provider.interface.js';
import { config } from '../../core/config.js';

export interface GeminiChatServiceOptions {
  apiKey?: string;
  model?: string;
  client?: GoogleGenAI;
}

/**
 * GeminiChatService implements LLMProvider using the official @google/genai SDK.
 */
export class GeminiChatService implements LLMProvider {
  private client: GoogleGenAI | null = null;
  private readonly model: string;
  private readonly apiKey?: string;

  constructor(options: GeminiChatServiceOptions = {}) {
    this.model = options.model ?? config.GEMINI_MODEL ?? 'gemini-2.5-flash';
    this.apiKey = options.apiKey;
    if (options.client) {
      this.client = options.client;
    }
  }

  private getClient(): GoogleGenAI {
    if (this.client) {
      return this.client;
    }

    const apiKey =
      this.apiKey !== undefined
        ? this.apiKey
        : (config.GEMINI_API_KEY || process.env.GEMINI_API_KEY);

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to generate responses with Gemini');
    }

    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }

  async generateResponse(prompt: string, history: ChatTurn[] = []): Promise<ChatTurn> {
    const client = this.getClient();

    const contents = [
      ...history.map((turn) => ({
        role: turn.role === 'model' ? 'model' : 'user',
        parts: [{ text: turn.content }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const response = await client.models.generateContent({
      model: this.model,
      contents,
    });

    return {
      role: 'model',
      content: response.text ?? '',
    };
  }
}
