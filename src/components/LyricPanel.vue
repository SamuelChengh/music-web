<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { usePlayerStore } from '../stores';
import { getLyric } from '../api';
import { Close } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

const playerStore = usePlayerStore();
const lyricRefs = ref<HTMLElement[]>([]);

watch(() => playerStore.currentLyricIndex, async (index) => {
  await nextTick();
  const el = lyricRefs.value[index];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

watch(() => playerStore.showLyric, async (show) => {
  if (show && playerStore.currentSong) {
    const hasLyric = playerStore.lyric && playerStore.lyric.length > 0;
    if (!hasLyric) {
      try {
        const lyricData = await getLyric(playerStore.currentSong.rid, 'lineLyric');
        playerStore.setLyric(lyricData || []);
      } catch (e) {
        console.error('歌词加载失败:', e);
        playerStore.setLyric([]);
      }
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div 
        v-if="playerStore.showLyric"
        class="fixed right-0 top-0 bottom-24 left-0 bg-view border-l border-default flex flex-col z-40 lg:right-0 lg:left-auto lg:w-[400px]"
      >
        <div class="h-12 flex items-center justify-between px-md border-b border-default">
          <span class="text-sm text-main font-medium">歌词</span>
          <el-tooltip content="关闭" placement="top">
            <button 
              class="w-6 h-6 rounded flex items-center justify-center hover:bg-tertiary text-primary hover:text-primary-hover"
              @click="playerStore.showLyric = false"
            >
              <Close theme="outline" size="16" />
            </button>
          </el-tooltip>
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
              :class="index === playerStore.currentLyricIndex ? 'text-primary font-medium text-xl' : 'text-secondary text-sm'"
            >
              {{ item.lineLyric || '♪' }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <Transition name="fade">
      <div 
        v-if="playerStore.showLyric" 
        class="fixed inset-0 bg-black/80 z-30 lg:bg-black/20"
        style="bottom: calc(100px + env(safe-area-inset-bottom, 0));"
        @click="playerStore.showLyric = false"
      />
    </Transition>
    
    <Transition name="mobile-lyric">
      <div 
        v-if="playerStore.showLyric"
        class="lg:hidden fixed inset-x-0 top-0 bg-view flex flex-col z-40"
        style="bottom: calc(100px + env(safe-area-inset-bottom, 0));"
      >
        <div class="h-14 flex items-center justify-between px-md border-b border-default">
          <el-tooltip content="关闭" placement="top">
            <button 
              class="p-sm rounded-full hover:bg-tertiary text-primary hover:text-primary-hover"
              @click="playerStore.showLyric = false"
            >
              <Close theme="outline" size="22" />
            </button>
          </el-tooltip>
          <span class="text-base text-primary font-medium truncate max-w-[60vw]">{{ playerStore.currentSong?.name || '歌词' }}</span>
          <div class="w-10"></div>
        </div>
        
        <div class="flex-1 overflow-y-auto px-lg py-xl text-center">
          <div v-if="playerStore.lyric.length === 0" class="flex items-center justify-center h-full text-secondary">
            暂无歌词
          </div>
          <div v-else class="space-y-md">
            <div
              v-for="(item, index) in playerStore.lyric"
              :key="index"
              :ref="(el) => { if (el) lyricRefs[index] = el as HTMLElement }"
              class="transition-all duration-300 py-sm"
              :class="index === playerStore.currentLyricIndex ? 'text-primary text-xl font-medium' : 'text-secondary text-base'"
            >
              {{ item.lineLyric || '♪' }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mobile-lyric-enter-active,
.mobile-lyric-leave-active {
  transition: transform 0.3s ease;
}

.mobile-lyric-enter-from,
.mobile-lyric-leave-to {
  transform: translateY(100%);
}
</style>
