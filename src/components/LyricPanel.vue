<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { usePlayerStore } from '../stores';
import { getLyric } from '../api';
import { Close } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';
import PlayerSlider from './layout/PlayerSlider.vue';
import LikeButton from './LikeButton.vue';

const playerStore = usePlayerStore();
const lyricRefs = ref<HTMLElement[]>([]);

// 下滑关闭状态
const touchStartY = ref(0);
const touchDeltaY = ref(0);
const isDragging = ref(false);
const isClosing = ref(false);

// 计算歌词面板位移
const lyricTransform = computed(() => {
  if (isClosing.value) return 'translateY(100%)';
  if (isDragging.value && touchDeltaY.value > 0) {
    return `translateY(${touchDeltaY.value}px)`;
  }
  return 'translateY(0)';
});

// 触摸处理函数
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY;
  isDragging.value = true;
  isClosing.value = false;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const currentY = e.touches[0].clientY;
  touchDeltaY.value = Math.max(0, currentY - touchStartY.value);
};

const handleTouchEnd = () => {
  if (touchDeltaY.value > 100) {
    isClosing.value = true;
    setTimeout(() => {
      playerStore.showLyric = false;
      isClosing.value = false;
    }, 350);
  }
  touchDeltaY.value = 0;
  isDragging.value = false;
};

// 关闭歌词面板（点击倒三角按钮）
const closeLyricPanel = () => {
  isClosing.value = true;
  setTimeout(() => {
    playerStore.showLyric = false;
    isClosing.value = false;
  }, 350);
};

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
    // 重置下滑关闭状态
    touchDeltaY.value = 0;
    isDragging.value = false;
    isClosing.value = false;
    
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
          <div class="flex items-center gap-sm">
            <span class="text-sm text-main font-medium">歌词</span>
            <LikeButton 
              v-if="playerStore.currentSong"
              :song="playerStore.currentSong"
              size="medium"
              show-tooltip
            />
          </div>
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
        :class="{ 'is-closing': isClosing }"
        :style="{ transform: lyricTransform }"
      >
        <!-- 模糊背景图片 -->
        <img
          v-if="playerStore.currentSong"
          :src="playerStore.currentSong.pic"
          class="lyric-bg-blur"
        />
        
        <!-- 渐变遮罩层 -->
        <div class="lyric-gradient-overlay"></div>
        
        <!-- 顶部：左上角倒三角 + 封面 + 歌曲信息（绑定触摸事件） -->
        <div 
          class="lyric-header-vertical"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- 左上角倒三角按钮 -->
          <button 
            class="down-arrow-btn-lyric"
            @click="closeLyricPanel"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 16l-6-6h12z"/>
            </svg>
          </button>
          
          <!-- 封面 -->
          <img
            v-if="playerStore.currentSong"
            :src="playerStore.currentSong.pic"
            class="cover-small"
          />
          <div v-else class="cover-small bg-tertiary" />
          
          <!-- 歌曲信息 -->
          <div v-if="playerStore.currentSong" class="song-info-lyric">
            <div class="song-name-lyric">{{ playerStore.currentSong.name }}</div>
            <div class="song-artist-lyric">{{ playerStore.currentSong.artist }}</div>
          </div>
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
        
        <!-- 底部迷你播放器 - 进度条 + 控制按钮（无背景） -->
        <div class="mini-player">
          <!-- 进度条 -->
          <div class="mini-progress">
            <span class="mini-time">{{ formatTime(playerStore.currentTime) }}</span>
            <PlayerSlider class="mini-slider" />
            <span class="mini-time">{{ formatTime(playerStore.duration) }}</span>
          </div>
          
          <!-- 控制按钮 -->
          <div class="mini-controls">
            <button class="mini-btn" @click="playerStore.prev()">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button class="play-btn-mini" @click="playerStore.toggle()">
              <svg v-if="playerStore.isPlaying" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
              </svg>
              <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
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

/* 全屏歌词面板 */
.lyric-fullscreen {
  position: fixed;
  inset: 0;
  background: var(--color-bg-view);
  z-index: 40;
  animation: fadeIn 0.5s ease;
  overflow: hidden;
  
  /* 过渡动画 */
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.lyric-fullscreen.is-closing {
  transform: translateY(100%) !important;
}

/* 模糊背景图片 */
.lyric-bg-blur {
  position: fixed;
  inset: -50px;
  width: calc(100% + 100px);
  height: calc(100% + 100px);
  object-fit: cover;
  filter: blur(50px) saturate(120%);
  -webkit-filter: blur(50px) saturate(120%);
  opacity: 0.95;
  z-index: 1;
  transition: opacity 0.5s ease;
}

/* 渐变遮罩层 */
.lyric-gradient-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(var(--color-bg-view-rgb), 0.3) 0%,
    rgba(var(--color-bg-view-rgb), 0.5) 40%,
    rgba(var(--color-bg-view-rgb), 0.7) 100%
  );
  z-index: 2;
}

:global(.dark) .lyric-gradient-overlay {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 歌词头部 - 固定顶部（高度160px，包含歌曲信息） */
.lyric-header-vertical {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  z-index: 5;
}

/* 小封面 - 100px */
.cover-small {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  object-fit: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cover-small:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

:global(.dark) .cover-small {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

:global(.dark) .cover-small:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

/* 歌词容器 - 独立滚动区域 */
.lyric-container-extended {
  position: absolute;
  top: 160px;
  bottom: calc(100px + env(safe-area-inset-bottom, 0));
  left: 0;
  right: 0;
  overflow-y: auto;
  padding: 16px 32px;
  z-index: 4;
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
  color: var(--color-text-main);
  margin: 14px 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.6;
  opacity: 0.7;
}

.lyric-line.active {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  text-shadow: 0 2px 20px rgba(var(--color-primary-rgb), 0.6);
  transform: scale(1.05);
  opacity: 1;
}

:global(.dark) .lyric-line {
  color: rgba(255, 255, 255, 0.7);
}

:global(.dark) .lyric-line.active {
  color: var(--color-primary);
  text-shadow: 0 2px 30px rgba(var(--color-primary-rgb), 0.8);
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

:global(.dark) .no-lyric {
  color: rgba(255, 255, 255, 0.5);
}

/* 底部迷你播放器 - 固定底部（无背景） */
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  padding: 16px 24px 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
  z-index: 5;
  
  /* 移除背景颜色和毛玻璃效果 */
  background: transparent;
}

:global(.dark) .mini-player {
  background: transparent;
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
    0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

:global(.dark) .play-btn-mini {
  box-shadow: 
    0 6px 20px rgba(var(--color-primary-rgb), 0.3),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

.play-btn-mini:hover {
  transform: scale(1.1);
  box-shadow: 
    0 8px 30px rgba(var(--color-primary-rgb), 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3);
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
  color: var(--color-text-main);
  transition: all 0.3s ease;
  background: rgba(var(--color-bg-view-rgb), 0.3);
}

.mini-btn:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.15);
  transform: scale(1.1);
}

:global(.dark) .mini-btn {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark) .mini-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
}


/* 左上角倒三角按钮 */
.down-arrow-btn-lyric {
  position: absolute;
  top: 20px;
  left: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.15);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  
  box-shadow: 
    0 4px 12px rgba(var(--color-primary-rgb), 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  transition: all 0.3s ease;
  z-index: 10;
}

.down-arrow-btn-lyric:hover {
  background: rgba(var(--color-primary-rgb), 0.25);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  transform: scale(1.1);
}

:global(.dark) .down-arrow-btn-lyric {
  background: rgba(var(--color-primary-rgb), 0.2);
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
}

:global(.dark) .down-arrow-btn-lyric:hover {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-color: rgba(var(--color-primary-rgb), 0.5);
}

/* 歌曲信息 */
.song-info-lyric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.song-name-lyric {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  text-align: center;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist-lyric {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .song-name-lyric {
  color: rgba(255, 255, 255, 0.95);
}

:global(.dark) .song-artist-lyric {
  color: rgba(255, 255, 255, 0.6);
}

/* 进度条区域 */
.mini-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mini-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 32px;
}

.mini-slider {
  flex: 1;
}

</style>
