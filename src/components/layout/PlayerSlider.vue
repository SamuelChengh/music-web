<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '../../stores';

const playerStore = usePlayerStore();

const handleSeek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const percent = e.offsetX / target.clientWidth;
  if (playerStore.duration) {
    const newTime = percent * playerStore.duration;
    playerStore.setCurrentTime(newTime);
    
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = newTime;
    }
  }
};

const progress = computed(() => {
  if (!playerStore.duration) return 0;
  return (playerStore.currentTime / playerStore.duration) * 100;
});
</script>

<template>
  <div 
    class="relative h-1 bg-tertiary rounded-full cursor-pointer group"
    @click="handleSeek"
  >
    <div 
      class="absolute left-0 top-0 h-full bg-primary rounded-full"
      :style="{ width: progress + '%' }"
    >
      <div 
        class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  </div>
</template>
