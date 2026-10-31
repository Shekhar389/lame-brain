import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatTurn } from '@repo/shared';
import { sendChatMessage } from '../api/chat.api.js';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatTurn[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function sendPrompt(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || loading.value) return;

    error.value = null;
    const priorHistory = [...messages.value];
    const userTurn: ChatTurn = { role: 'user', content: trimmed };
    messages.value.push(userTurn);
    loading.value = true;

    try {
      const response = await sendChatMessage({
        message: trimmed,
        history: priorHistory,
      });
      messages.value.push(response.message);
    } catch (err: any) {
      error.value = err?.message || 'Failed to generate response. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearChat(): void {
    messages.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    messages,
    loading,
    error,
    sendPrompt,
    clearChat,
  };
});
