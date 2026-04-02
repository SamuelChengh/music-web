<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlayerStore } from '../../stores';
import { Close, Delete, Music } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

const playerStore = usePlayerStore();
const listRef = ref<HTMLDivElement | null>(null);
const drawerRef = ref<HTMLDivElement | null>(null);
const touchStartY = ref(0);
const touchDeltaY = ref(0);
const isDragging = ref(false);

const playSong = (index: number) => {
  playerStore.playAt(index);
};

const removeSong = (index: number) => {
  playerStore.removeFromList(index);
};

const clearList = () => {
  playerStore.clearPlaylist();
};

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY;
  isDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  touchDeltaY.value = e.touches[0].clientY - touchStartY.value;
};

const handleTouchEnd = () => {
  if (touchDeltaY.value > 80) {
    playerStore.showPlaylist = false;
  }
  touchDeltaY.value = 0;
  isDragging.value = false;
};

watch(() => playerStore.showPlaylist, (show) => {
  if (show && listRef.value) {
    listRef.value.scrollTop = 0;
  }
});

const isMobile = computed(() => window.innerWidth < 768);
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div 
        v-if="playerStore.showPlaylist"
        ref="drawerRef"
        class="playlist-drawer"
        :class="{ 'is-mobile': isMobile }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="drawer-handle">
          <div class="handle-bar"></div>
        </div>
        
        <div class="drawer-header">
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
            <div class="playing-indicator">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
          </div>
          <div class="playing-info">
            <div class="playing-name">{{ playerStore.currentSong.name }}</div>
            <div class="playing-artist">{{ playerStore.currentSong.artist }}</div>
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
            class="song-item"
            :class="{ 
              'is-playing': playerStore.currentIndex === index,
              'is-dragging': isDragging && touchDeltaY > 0
            }"
            @click="playSong(index)"
          >
            <div class="song-cover">
              <img :src="song.pic" class="cover-thumb" />
            </div>
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
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
    </Transition>
    
    <Transition name="fade">
      <div 
        v-if="playerStore.showPlaylist" 
        class="drawer-overlay"
        @click="playerStore.showPlaylist = false"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.playlist-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 50vh;
  background: rgba(var(--color-bg-view-rgb), 0.85);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 24px 24px 0 0;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15), 
              0 0 20px rgba(var(--color-primary-rgb), 0.1);
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow: hidden;
  padding-bottom: 100px;
}

.playlist-drawer.is-mobile {
  max-height: 55vh;
  padding-bottom: 100px;
}

.drawer-handle {
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
  cursor: grab;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: 2px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--color-border), 0.5);
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
  margin: 8px 16px;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 16px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.15);
}

.playing-cover {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: rotate-slow 8s linear infinite;
}

.playing-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: 0s; height: 60%; }
.wave-bar:nth-child(2) { animation-delay: 0.2s; height: 80%; }
.wave-bar:nth-child(3) { animation-delay: 0.4s; height: 40%; }
.wave-bar:nth-child(4) { animation-delay: 0.6s; height: 100%; }

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
  padding: 12px 16px;
  margin: 4px 12px;
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
  width: 44px;
  height: 44px;
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
  background: rgba(0, 0, 0, 0.3);
  z-index: 40;
}

.slide-up-enter-active {
  animation: slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-leave-active {
  animation: slide-down 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
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
  0%, 100% { transform: scaleY(0.5); }
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
    border-radius: 24px 0 0 24px;
    border-left: 1px solid rgba(var(--color-primary-rgb), 0.2);
    border-top: 1px solid rgba(var(--color-primary-rgb), 0.2);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15),
                0 0 20px rgba(var(--color-primary-rgb), 0.1);
    padding-bottom: 0;
  }
  
  .drawer-handle {
    display: none;
  }
}
</style>