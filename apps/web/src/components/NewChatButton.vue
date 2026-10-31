<template>
  <button
    type="button"
    class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
    @click="chatStore.clearChat"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 text-gray-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    <span>New Chat</span>
  </button>
</template>

<script setup lang="ts">
import { useChatStore } from '../stores/chat.store.js';

const chatStore = useChatStore();
</script>
