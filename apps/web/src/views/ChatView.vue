<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
    <!-- Chat Header Controls -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-100 mb-2">
      <div class="flex items-center space-x-2">
        <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span class="text-xs font-medium text-gray-600">Ephemeral Session</span>
      </div>
      <button
        type="button"
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
        @click="chatStore.clearChat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>New Chat</span>
      </button>
    </div>

    <!-- Message Container / Feed -->
    <div
      ref="messageContainerRef"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-6"
    >
      <!-- Empty State -->
      <div
        v-if="chatStore.messages.length === 0"
        class="h-full flex flex-col items-center justify-center text-center px-4"
      >
        <div class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 text-2xl font-bold">
          AI
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
        <p class="text-gray-500 max-w-md mb-8">
          Ask questions, explore ideas, or brainstorm. Your conversations are anonymous and ephemeral.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="button"
            class="p-3 text-left border border-gray-200 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Messages Feed -->
      <div
        v-for="(msg, index) in chatStore.messages"
        :key="index"
        class="flex flex-col"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm"
          :class="
            msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm whitespace-pre-wrap'
          "
        >
          {{ msg.content }}
        </div>
      </div>

      <!-- Loading Indicator -->
      <div
        v-if="chatStore.loading"
        class="flex items-start space-x-2 text-gray-500 text-sm py-2"
      >
        <div class="flex space-x-1 items-center px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm">
          <span class="inline-block w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
          <span class="inline-block w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span class="inline-block w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    </div>

    <!-- Error Banner -->
    <div
      v-if="chatStore.error"
      class="mx-4 mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between"
      role="alert"
    >
      <span>{{ chatStore.error }}</span>
      <button
        type="button"
        class="text-red-500 hover:text-red-700 text-xs font-semibold"
        @click="chatStore.error = null"
      >
        Dismiss
      </button>
    </div>

    <!-- Input Form Area -->
    <form
      class="p-4 bg-white border-t border-gray-200 sm:rounded-2xl sm:border sm:shadow-sm"
      @submit.prevent="handleSubmit"
    >
      <div class="relative flex items-center">
        <textarea
          ref="textareaRef"
          v-model="inputPrompt"
          rows="1"
          placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
          :disabled="chatStore.loading"
          class="w-full resize-none rounded-xl border border-gray-300 pr-12 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
          @keydown="handleKeyDown"
        ></textarea>
        <button
          type="submit"
          :disabled="chatStore.loading || !inputPrompt.trim()"
          class="absolute right-2 p-2 rounded-lg text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 disabled:hover:text-gray-300 transition-colors"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '../stores/chat.store.js';

const chatStore = useChatStore();
const inputPrompt = ref('');
const messageContainerRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const suggestions = [
  'Explain quantum computing in simple terms',
  'Write a TypeScript function to debounce user input',
  'Plan a 3-day itinerary for Tokyo',
  'What are the core design patterns of modular monoliths?',
];

function useSuggestion(text: string) {
  inputPrompt.value = text;
  textareaRef.value?.focus();
}

async function scrollToBottom() {
  await nextTick();
  if (messageContainerRef.value) {
    messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight;
  }
}

watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
}

async function handleSubmit() {
  const text = inputPrompt.value.trim();
  if (!text || chatStore.loading) return;

  const previousInput = inputPrompt.value;
  try {
    const promise = chatStore.sendPrompt(text);
    // User story: prompt is kept until confirmed, or if error happens retained
    await promise;
    inputPrompt.value = '';
    scrollToBottom();
  } catch {
    // Keep typed buffer on error
    inputPrompt.value = previousInput;
  }
}
</script>
