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
        <NewChatButton />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import NewChatButton from './NewChatButton.vue';
</script>
