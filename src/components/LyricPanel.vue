<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore } from '../stores';

const playerStore = usePlayerStore();
const isMobile = ref(window.innerWidth < 768);
</script>

<template>
  <div 
    class="fixed z-50 bg-[var(--color-bg-secondary)] overflow-hidden flex flex-col"
    :class="isMobile ? 'inset-0' : 'right-0 top-0 h-[calc(100vh-80px)] w-80 border-l border-[var(--color-border)]'"
  >
    <div class="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
      <h3 class="font-medium">歌词</h3>
      <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xl" @click="playerStore.showLyric = false">✕</button>
    </div>
    <div class="flex-1 overflow-y-auto p-4 text-center">
      <div v-if="playerStore.lyric.length === 0" class="text-[var(--color-text-secondary)] py-8">
        暂无歌词
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(item, index) in playerStore.lyric"
          :key="index"
          class="transition-all duration-300 py-2"
          :class="index === playerStore.currentLyricIndex ? 'text-[var(--color-primary)] font-medium text-lg sm:text-xl' : 'text-[var(--color-text-secondary)] text-sm sm:text-base'"
        >
          {{ item.lineLyric || '♪' }}
        </div>
      </div>
    </div>
  </div>
</template>