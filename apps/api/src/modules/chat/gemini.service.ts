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
 * Supports live Gemini 2.0 generation when GEMINI_API_KEY is configured,
 * and falls back to a simulated local response when no key is provided.
 */
export class GeminiChatService implements LLMProvider {
  private client: GoogleGenAI | null = null;
  private readonly model: string;
  private readonly apiKey?: string;

  constructor(options: GeminiChatServiceOptions = {}) {
    this.model = options.model ?? config.GEMINI_MODEL;
    this.apiKey = options.apiKey ?? config.GEMINI_API_KEY;
    if (options.client) {
      this.client = options.client;
    }
  }

  private getClient(): GoogleGenAI | null {
    if (this.client) {
      return this.client;
    }

    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
      return this.client;
    }

    return null;
  }

  async generateResponse(prompt: string, history: ChatTurn[] = []): Promise<ChatTurn> {
    const client = this.getClient();

    // Fallback when no Gemini API key is configured (local dev & testing without active credentials)
    if (!client) {
      const contextNote =
        history.length > 0
          ? ` (incorporating ${history.length} prior conversation turn${history.length === 1 ? '' : 's'})`
          : '';

      return {
        role: 'model',
        content: `I received your message: "${prompt}"${contextNote}. (Simulated local response; configure GEMINI_API_KEY for live Gemini generation).`,
      };
    }

    // Prepare alternating contents for Gemini API
    const rawTurns: ChatTurn[] = [...history, { role: 'user', content: prompt }];
    const sanitizedTurns: ChatTurn[] = [];

    for (const turn of rawTurns) {
      const lastTurn = sanitizedTurns[sanitizedTurns.length - 1];
      if (lastTurn && lastTurn.role === turn.role) {
        lastTurn.content += `\n\n${turn.content}`;
      } else {
        sanitizedTurns.push({ role: turn.role, content: turn.content });
      }
    }

    const contents = sanitizedTurns.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    }));

    const response = await client.models.generateContent({
      model: this.model,
      contents,
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      throw new Error('Gemini returned an empty response or content was filtered.');
    }

    return {
      role: 'model',
      content: replyText,
    };
  }
}
