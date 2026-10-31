import type { ChatTurn } from '@repo/shared';
import type { LLMProvider } from './llm-provider.interface.js';

/**
 * GeminiChatService implements LLMProvider.
 * Provides an immediate boilerplate mock response, structurally prepared
 * for Google Gemini integration via `@google/genai`.
 */
export class GeminiChatService implements LLMProvider {
  // Structural placeholder for Gemini credentials and configuration:
  // private readonly apiKey: string | undefined;
  // private readonly model: string;
  //
  // constructor(apiKey = process.env.GEMINI_API_KEY, model = 'gemini-2.5-flash') {
  //   this.apiKey = apiKey;
  //   this.model = model;
  // }

  async generateResponse(prompt: string, _history: ChatTurn[] = []): Promise<ChatTurn> {
    // Structural seam for live @google/genai integration:
    // 1. Initialize SDK:
    //    const { GoogleGenAI } = await import('@google/genai');
    //    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    // 2. Map history turns to contents:
    //    const contents = [
    //      ..._history.map(turn => ({
    //        role: turn.role === 'model' ? 'model' : 'user',
    //        parts: [{ text: turn.content }]
    //      })),
    //      { role: 'user', parts: [{ text: prompt }] }
    //    ];
    // 3. Generate response:
    //    const response = await ai.models.generateContent({ model: this.model, contents });
    //    return { role: 'model', content: response.text ?? '' };

    return {
      role: 'model',
      content: `I received your message: "${prompt}". This is a simulated response from the LLM Provider seam while prepared for Gemini API integration.`,
    };
  }
}
