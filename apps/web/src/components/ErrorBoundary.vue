<template>
  <slot v-if="!hasError" />
  <div v-else class="p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-200 my-4">
    <h3 class="font-semibold text-lg mb-1">Something went wrong</h3>
    <p class="text-sm mb-4">{{ errorMessage }}</p>
    <button
      type="button"
      class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
      @click="resetError"
    >
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err: Error) => {
  hasError.value = true;
  errorMessage.value = err.message || 'An unexpected rendering error occurred.';
  return false;
});

function resetError(): void {
  hasError.value = false;
  errorMessage.value = '';
}
</script>
