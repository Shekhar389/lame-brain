import type { ChatTurn } from '@repo/shared';

export interface LLMProvider {
  generateResponse(prompt: string, history: ChatTurn[]): Promise<ChatTurn>;
}
