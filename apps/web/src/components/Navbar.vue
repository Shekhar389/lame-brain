<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm">
          AI
        </span>
        <h1 class="text-lg font-semibold text-gray-900">Anonymous Chat</h1>
      </div>

      <nav class="flex items-center space-x-2">
        <button
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
          @click="chatStore.clearChat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>New Chat</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useChatStore } from '../stores/chat.store.js';

const chatStore = useChatStore();
</script>
