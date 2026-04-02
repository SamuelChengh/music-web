<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { usePlayerStore } from '../stores';
import { getLyric } from '../api';
import { Close, Play, Pause } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';
import PlayerSlider from './layout/PlayerSlider.vue';

const playerStore = usePlayerStore();
const lyricRefs = ref<HTMLElement[]>([]);

// 格式化时间
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

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
    
    // 滚动到当前播放位置 - 使用延时确保DOM渲染完成
    setTimeout(() => {
      const currentIndex = playerStore.currentLyricIndex;
      if (currentIndex >= 0 && lyricRefs.value[currentIndex]) {
        lyricRefs.value[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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
        class="lg:hidden lyric-fullscreen"
      >
        <!-- 关闭按钮 - 悬浮 -->
        <button 
          class="close-btn-floating"
          @click="playerStore.showLyric = false"
        >
          <Close theme="outline" size="18" />
        </button>
        
        <!-- 顶部：封面 + 歌曲信息（上下居中布局） -->
        <div class="lyric-header-vertical">
          <img
            v-if="playerStore.currentSong"
            :src="playerStore.currentSong.pic"
            class="cover-small"
          />
          <div v-else class="cover-small bg-tertiary" />
          
          <div v-if="playerStore.currentSong" class="song-info-vertical">
            <div class="song-name">{{ playerStore.currentSong.name }}</div>
            <div class="artist-name">{{ playerStore.currentSong.artist }}</div>
          </div>
          <div v-else class="text-secondary">暂无播放</div>
        </div>
        
        <!-- 歌词容器 -->
        <div class="lyric-container-extended">
          <div v-if="playerStore.lyric.length === 0" class="no-lyric">
            暂无歌词
          </div>
          <div v-else class="lyric-content">
            <div
              v-for="(item, index) in playerStore.lyric"
              :key="index"
              :ref="(el) => { if (el) lyricRefs[index] = el as HTMLElement }"
              class="lyric-line"
              :class="{ active: index === playerStore.currentLyricIndex }"
            >
              {{ item.lineLyric || '♪' }}
            </div>
          </div>
        </div>
        
        <!-- 底部迷你播放器 - 只保留控制 -->
        <div class="mini-player">
          <div class="mini-controls">
            <button class="mini-btn" @click="playerStore.prev()">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button class="play-btn-mini" @click="playerStore.toggle()">
              <Pause v-if="playerStore.isPlaying" theme="filled" size="24" />
              <Play v-else theme="filled" size="24" />
            </button>
            
            <button class="mini-btn" @click="playerStore.next()">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
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

/* 全屏毛玻璃歌词面板 */
.lyric-fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(var(--color-bg-view-rgb), 0.85);
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
  display: flex;
  flex-direction: column;
  z-index: 40;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 关闭按钮 - 悬浮 */
.close-btn-floating {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-main);
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn-floating:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

:global(.dark) .close-btn-floating {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark) .close-btn-floating:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 歌词头部 - 上下居中布局 */
.lyric-header-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 16px 20px;
}

/* 小封面 - 100px */
.cover-small {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

/* 歌曲信息 - 垂直布局 */
.song-info-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.song-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  text-align: center;
}

.artist-name {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 歌词容器 - 扩展版 */
.lyric-container-extended {
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
}

.lyric-content {
  text-align: center;
  padding-bottom: 20px;
}

/* 歌词行 */
.lyric-line {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 14px 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.6;
}

.lyric-line.active {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.6);
  transform: scale(1.05);
}

/* 无歌词提示 */
.no-lyric {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* 底部迷你播放器 */
.mini-player {
  padding: 16px 24px 28px;
  background: rgba(var(--color-bg-view-rgb), 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.mini-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

/* 播放按钮 - 迷你版 */
.play-btn-mini {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 
    0 6px 20px rgba(var(--color-primary-rgb), 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.play-btn-mini:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(var(--color-primary-rgb), 0.5);
}

.play-btn-mini:active {
  transform: scale(1.05);
}

/* 迷你控制按钮 */
.mini-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
}

.mini-btn:hover {
  color: var(--color-text-main);
  transform: scale(1.1);
}


</style>
