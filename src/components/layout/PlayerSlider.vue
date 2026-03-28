<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayerStore } from '../../stores';

const playerStore = usePlayerStore();
const isDragging = ref(false);

const handleSeek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  seekTo(percent);
};

const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true;
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const touch = e.touches[0];
  const percent = (touch.clientX - rect.left) / rect.width;
  seekTo(percent);
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const touch = e.touches[0];
  const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
  seekTo(percent);
};

const handleTouchEnd = () => {
  isDragging.value = false;
};

const seekTo = (percent: number) => {
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
    class="relative h-2 bg-tertiary rounded-full cursor-pointer group"
    @click="handleSeek"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div 
      class="absolute left-0 top-0 h-full bg-primary rounded-full"
      :style="{ width: progress + '%' }"
    >
      <div 
        class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full transition-opacity"
        :class="isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
      />
    </div>
  </div>
</template>