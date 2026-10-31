<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
      <router-view />
    </main>
    <footer class="border-t border-gray-200 bg-white py-3 text-center text-xs text-gray-500">
      Anonymous Ephemeral Chat • Zero Data Stored Server-Side
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>
