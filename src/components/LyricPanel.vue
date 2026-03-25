<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { usePlayerStore } from '../stores';
import { Close } from '@icon-park/vue-next';

const playerStore = usePlayerStore();
const lyricRefs = ref<HTMLElement[]>([]);

watch(() => playerStore.currentLyricIndex, async (index) => {
  await nextTick();
  const el = lyricRefs.value[index];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div 
        v-if="playerStore.showLyric"
        class="fixed right-0 top-0 bottom-0 w-80 bg-view border-l border-default flex flex-col z-40"
      >
        <div class="h-12 flex items-center justify-between px-md border-b border-default">
          <span class="text-sm text-main font-medium">歌词</span>
          <button 
            class="w-6 h-6 rounded flex items-center justify-center hover:bg-tertiary text-secondary"
            @click="playerStore.showLyric = false"
          >
            <Close theme="outline" size="16" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-md py-lg text-center">
          <div v-if="playerStore.lyric.length === 0" class="flex items-center justify-center h-full text-secondary text-sm">
            暂无歌词
          </div>
          <div v-else class="space-y-md">
            <div
              v-for="(item, index) in playerStore.lyric"
              :key="index"
              :ref="(el) => { if (el) lyricRefs[index] = el as HTMLElement }"
              class="transition-all duration-300 py-sm"
              :class="index === playerStore.currentLyricIndex ? 'text-primary font-medium text-lg' : 'text-secondary text-sm'"
            >
              {{ item.lineLyric || '♪' }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <div 
      v-if="playerStore.showLyric" 
      class="fixed inset-0 bg-black/20 z-30"
      @click="playerStore.showLyric = false"
    />
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
