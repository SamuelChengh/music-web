<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlayerStore, useFavoritesStore } from '../../stores';
import { Close, Delete, Music } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';
import LikeButton from '../LikeButton.vue';

const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const listRef = ref<HTMLDivElement | null>(null);
const drawerRef = ref<HTMLDivElement | null>(null);
const touchStartY = ref(0);
const touchDeltaY = ref(0);
const isDragging = ref(false);
const isClosing = ref(false);

const playSong = (index: number) => {
  playerStore.playAt(index);
};

const removeSong = (index: number) => {
  playerStore.removeFromList(index);
};

const clearList = () => {
  playerStore.clearPlaylist();
};

const drawerTransform = computed(() => {
  if (isClosing.value) return 'translateY(100%)';
  if (isDragging.value && touchDeltaY.value > 0) {
    return `translateY(${touchDeltaY.value}px)`;
  }
  return 'translateY(0)';
});

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
      playerStore.showPlaylist = false;
      isClosing.value = false;
    }, 350);
  }
  touchDeltaY.value = 0;
  isDragging.value = false;
};

watch(() => playerStore.showPlaylist, (show) => {
  if (show && listRef.value) {
    listRef.value.scrollTop = 0;
    touchDeltaY.value = 0;
    isDragging.value = false;
    isClosing.value = false;
  }
});

const isMobile = computed(() => window.innerWidth < 768);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="playerStore.showPlaylist" 
        class="drawer-overlay"
        @click="playerStore.showPlaylist = false"
      />
    </Transition>
    
    <div 
      v-if="playerStore.showPlaylist"
      ref="drawerRef"
      class="playlist-drawer"
      :class="{ 'is-mobile': isMobile, 'is-dragging': isDragging, 'is-closing': isClosing }"
      :style="{ transform: drawerTransform }"
    >
      <div 
        class="drawer-handle"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="handle-bar"></div>
      </div>
      
      <div 
        class="drawer-header"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="header-title">
          <Music theme="filled" size="18" class="text-primary" />
          <span class="text-sm text-main font-medium">播放列表</span>
          <span class="text-xs text-secondary">({{ playerStore.playlist.length }})</span>
        </div>
        <div class="header-actions">
          <el-tooltip v-if="playerStore.playlist.length > 0" content="清空播放列表" placement="top">
            <button class="action-btn" @click="clearList">
              清空
            </button>
          </el-tooltip>
          <el-tooltip content="关闭" placement="top">
            <button class="close-btn" @click="playerStore.showPlaylist = false">
              <Close theme="outline" size="18" />
            </button>
          </el-tooltip>
        </div>
      </div>
      
      <div v-if="playerStore.currentSong" class="current-playing">
        <div class="playing-cover">
          <img :src="playerStore.currentSong.pic" class="cover-image" />
        </div>
        <div class="playing-info">
          <div class="playing-name">{{ playerStore.currentSong.name }}</div>
          <div class="playing-artist">{{ playerStore.currentSong.artist }}</div>
        </div>
        <div class="playing-indicator">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
      </div>
      
      <div ref="listRef" class="drawer-content">
        <div v-if="playerStore.playlist.length === 0" class="empty-state">
          <Music theme="outline" size="48" class="text-description" />
          <span class="text-secondary text-sm">播放列表为空</span>
        </div>
        
        <div
          v-for="(song, index) in playerStore.playlist"
          :key="song.rid"
          class="song-item group"
          :class="{ 'is-playing': playerStore.currentIndex === index }"
          @click="playSong(index)"
        >
          <div class="song-cover">
            <img :src="song.pic" class="cover-thumb" />
          </div>
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>
          <div v-if="playerStore.currentIndex === index" class="song-playing-indicator">
            <div class="mini-wave-bar"></div>
            <div class="mini-wave-bar"></div>
            <div class="mini-wave-bar"></div>
          </div>
          <LikeButton
            :song="song"
            size="small"
            :show-tooltip="false"
            :class="favoritesStore.isFavorite(song.rid) ? '' : 'opacity-0 group-hover:opacity-100'"
          />
          <el-tooltip content="移除" placement="top">
            <button 
              class="remove-btn"
              @click.stop="removeSong(index)"
            >
              <Delete theme="outline" size="16" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.playlist-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 70vh;
  background: rgba(var(--color-bg-view-rgb), 0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 24px 24px 0 0;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.25);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15), 
              0 0 30px rgba(var(--color-primary-rgb), 0.1);
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow: hidden;
  transform: translateY(0);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), 
              box-shadow 0.2s ease;
  animation: slide-in 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.playlist-drawer.is-dragging {
  transition: none;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.25), 
              0 0 40px rgba(var(--color-primary-rgb), 0.15);
}

.playlist-drawer.is-closing {
  transform: translateY(100%);
}

.playlist-drawer.is-mobile {
  max-height: 60vh;
}

@keyframes slide-in {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.drawer-handle {
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
  cursor: grab;
  touch-action: none;
}

.handle-bar {
  width: 44px;
  height: 5px;
  background: rgba(var(--color-primary-rgb), 0.35);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.playlist-drawer.is-dragging .handle-bar {
  background: rgba(var(--color-primary-rgb), 0.5);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--color-border), 0.5);
  touch-action: none;
  cursor: grab;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(var(--color-bg-tertiary), 0.5);
  transition: all 0.2s ease;
}

.action-btn:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  background: rgba(var(--color-bg-tertiary), 0.5);
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.15);
}

.current-playing {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 8px 12px;
  background: rgba(var(--color-primary-rgb), 0.12);
  border-radius: 16px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.35);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.15);
}

.playing-cover {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: rotate-slow 10s linear infinite;
}

.playing-info {
  flex: 1;
  min-width: 0;
}

.playing-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playing-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
  padding: 0 4px;
}

.wave-bar {
  width: 4px;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: 0s; height: 50%; }
.wave-bar:nth-child(2) { animation-delay: 0.2s; height: 70%; }
.wave-bar:nth-child(3) { animation-delay: 0.4s; height: 40%; }
.wave-bar:nth-child(4) { animation-delay: 0.6s; height: 90%; }

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 0;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin: 3px 12px;
  border-radius: 12px;
  background: rgba(var(--color-bg-view-rgb), 0.5);
  transition: all 0.2s ease;
  cursor: pointer;
}

.song-item:hover {
  background: rgba(var(--color-bg-tertiary), 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.song-item.is-playing {
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
  box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.1);
}

.song-cover {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  overflow: hidden;
}

.cover-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 13px;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item.is-playing .song-name {
  color: var(--color-primary);
  font-weight: 500;
}

.song-artist {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.mini-wave-bar {
  width: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.mini-wave-bar:nth-child(1) { animation-delay: 0s; height: 40%; }
.mini-wave-bar:nth-child(2) { animation-delay: 0.2s; height: 60%; }
.mini-wave-bar:nth-child(3) { animation-delay: 0.4s; height: 80%; }

.remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--color-text-secondary);
  opacity: 0;
  transition: all 0.2s ease;
}

.song-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 40;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

@media (min-width: 768px) {
  .playlist-drawer {
    position: fixed;
    right: 0;
    left: auto;
    bottom: 80px;
    width: 320px;
    max-height: calc(100vh - 160px);
    border-radius: 20px 0 0 20px;
    border-left: 1px solid rgba(var(--color-primary-rgb), 0.2);
    border-top: 1px solid rgba(var(--color-primary-rgb), 0.2);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15),
                0 0 20px rgba(var(--color-primary-rgb), 0.1);
  }
  
  .drawer-handle {
    display: none;
  }
  
  .song-item {
    margin: 2px 8px;
    padding: 8px 12px;
  }
  
  .song-cover {
    width: 38px;
    height: 38px;
  }
}
</style>