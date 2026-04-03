<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { usePlayerStore, useFavoritesStore, useQueueStore } from '../../stores';
import { Close, Delete, Music, Down, Up } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';
import LikeButton from '../LikeButton.vue';
import { useIsMobile } from '../../composables/useIsMobile';
import { useScrollLock } from '@vueuse/core';

const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const queueStore = useQueueStore();
const listRef = ref<HTMLDivElement | null>(null);
const drawerRef = ref<HTMLDivElement | null>(null);
const touchStartY = ref(0);
const touchDeltaY = ref(0);
const isDragging = ref(false);
const isClosing = ref(false);

const bodyRef = ref(document.body);
const isLocked = useScrollLock(bodyRef);

const playSong = (index: number) => {
  playerStore.playAt(index);
};

const removeSong = (index: number) => {
  playerStore.removeFromList(index);
};

const downgradeSong = (index: number) => {
  queueStore.downgradePriority(index);
};

const upgradeToPriority = (index: number) => {
  queueStore.upgradePriority(index);
};

const pendingDeleteIndex = ref<number | null>(null);
const deleteTimer = ref<number | null>(null);

const pendingUpgradeIndex = ref<number | null>(null);
const upgradeTimer = ref<number | null>(null);

const pendingDowngradeIndex = ref<number | null>(null);
const downgradeTimer = ref<number | null>(null);

const handleDeleteClick = (index: number) => {
  if (pendingDeleteIndex.value === index) {
    removeSong(index);
    clearDeletePending();
  } else {
    pendingDeleteIndex.value = index;
    
    if (deleteTimer.value) {
      clearTimeout(deleteTimer.value);
    }
    
    deleteTimer.value = setTimeout(() => {
      clearDeletePending();
    }, 3000);
  }
};

const clearDeletePending = () => {
  pendingDeleteIndex.value = null;
  if (deleteTimer.value) {
    clearTimeout(deleteTimer.value);
    deleteTimer.value = null;
  }
};

const handleUpgradeClick = (index: number) => {
  // 立即执行升级
  queueStore.upgradePriority(index);
  
  // 短暂视觉反馈
  pendingUpgradeIndex.value = index;
  setTimeout(() => {
    clearUpgradePending();
  }, 500);
};

const clearUpgradePending = () => {
  pendingUpgradeIndex.value = null;
  if (upgradeTimer.value) {
    clearTimeout(upgradeTimer.value);
    upgradeTimer.value = null;
  }
};

const handleDowngradeClick = (index: number) => {
  // 立即执行降级
  queueStore.downgradePriority(index);
  
  // 短暂视觉反馈
  pendingDowngradeIndex.value = index;
  setTimeout(() => {
    pendingDowngradeIndex.value = null;
  }, 500);
};

const clearDowngradePending = () => {
  pendingDowngradeIndex.value = null;
  if (downgradeTimer.value) {
    clearTimeout(downgradeTimer.value);
    downgradeTimer.value = null;
  }
};

const clearAll = () => {
  playerStore.clearPlaylist();
};

const clearPriority = () => {
  queueStore.clearPriorityQueue();
};

const priorityQueueItems = computed(() => {
  return queueStore.playlist
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => item.priority === 'high' && item.originalIndex !== queueStore.currentIndex);
});

const normalQueueItems = computed(() => {
  return queueStore.playlist
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => item.priority === 'normal');
});

const displayQueueItems = computed(() => {
  const items = [];
  
  if (queueStore.currentIndex >= 0 && queueStore.currentIndex < queueStore.playlist.length) {
    const currentSong = queueStore.playlist[queueStore.currentIndex];
    items.push({ ...currentSong, originalIndex: queueStore.currentIndex });
  }
  
  queueStore.playlist.forEach((item, index) => {
    if (index !== queueStore.currentIndex && item.priority === 'normal') {
      items.push({ ...item, originalIndex: index });
    }
  });
  
  return items;
});

const currentSongItem = computed(() => {
  if (queueStore.currentIndex >= 0 && queueStore.currentIndex < queueStore.playlist.length) {
    return queueStore.playlist[queueStore.currentIndex];
  }
  return null;
});

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
    isLocked.value = true;
  } else {
    isLocked.value = false;
  }
});

const { isMobile } = useIsMobile();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
<div 
  v-if="playerStore.showPlaylist" 
  class="drawer-overlay"
  @click="playerStore.showPlaylist = false"
  @touchmove.prevent
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
          <span class="text-xs text-secondary">({{ queueStore.totalCount }})</span>
        </div>
        <div class="header-actions">
          <el-tooltip v-if="priorityQueueItems.length > 0" content="清空下一首播放" placement="top">
            <button class="action-btn priority-btn" @click="clearPriority">
              清空优先
            </button>
          </el-tooltip>
          <el-tooltip v-if="queueStore.totalCount > 0" content="清空全部队列" placement="top">
            <button class="action-btn" @click="clearAll">
              清空全部
            </button>
          </el-tooltip>
        </div>
      </div>
      
      <div ref="listRef" class="drawer-content">
        <div v-if="queueStore.totalCount === 0" class="empty-state">
          <Music theme="outline" size="48" class="text-description" />
          <span class="text-secondary text-sm">播放列表为空</span>
        </div>
        
        <template v-else>
          <!-- 下一首播放 -->
          <div v-if="priorityQueueItems.length > 0" class="queue-section priority-section">
            <div class="section-label priority-label">
              <span>下一首播放</span>
              <span class="count-badge">{{ priorityQueueItems.length }}</span>
            </div>
            <div
              v-for="song in priorityQueueItems"
              :key="song.rid"
              class="song-item group priority-item"
              @click="playSong(song.originalIndex)"
            >
              <div class="song-cover">
                <img :src="song.pic" class="cover-thumb" />
              </div>
              <div class="song-info">
                <div class="song-name">
                  <span class="priority-icon">⚡</span>
                  {{ song.name }}
                </div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
              <LikeButton
                :song="song"
                size="small"
                :show-tooltip="false"
                :class="favoritesStore.isFavorite(song.rid) || isMobile ? '' : 'opacity-0 group-hover:opacity-100'"
              />
              <button 
                class="downgrade-btn"
                :class="{ 'pending-action': pendingDowngradeIndex === song.originalIndex }"
                @click.stop="handleDowngradeClick(song.originalIndex)"
              >
                <Down theme="outline" size="16" />
                <span v-if="pendingDowngradeIndex === song.originalIndex" class="action-text">降级</span>
              </button>
              <button
                class="remove-btn"
                :class="{ 'pending-delete': pendingDeleteIndex === song.originalIndex }"
                @click.stop="handleDeleteClick(song.originalIndex)"
              >
                <Delete theme="outline" size="16" />
                <span v-if="pendingDeleteIndex === song.originalIndex" class="delete-text">删除</span>
              </button>
            </div>
          </div>

          <!-- 播放队列 -->
          <div v-if="displayQueueItems.length > 0" class="queue-section">
            <div class="section-label">播放队列</div>
            <div
              v-for="song in displayQueueItems"
              :key="song.rid"
              class="song-item group"
              :class="{ 
                'is-playing': queueStore.currentIndex === song.originalIndex,
                'priority-item': song.priority === 'high'
              }"
              @click="playSong(song.originalIndex)"
            >
              <div class="song-cover">
                <img :src="song.pic" class="cover-thumb" />
              </div>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
              <div v-if="queueStore.currentIndex === song.originalIndex" class="song-playing-indicator">
                <div class="mini-wave-bar"></div>
                <div class="mini-wave-bar"></div>
                <div class="mini-wave-bar"></div>
              </div>
              <LikeButton
                :song="song"
                size="small"
                :show-tooltip="false"
                :class="favoritesStore.isFavorite(song.rid) || isMobile ? '' : 'opacity-0 group-hover:opacity-100'"
              />
              <button
                class="upgrade-btn"
                :class="{ 'pending-action': pendingUpgradeIndex === song.originalIndex }"
                @click.stop="handleUpgradeClick(song.originalIndex)"
              >
                <Up theme="outline" size="16" />
                <span v-if="pendingUpgradeIndex === song.originalIndex" class="action-text">升级</span>
              </button>
              <button
                class="remove-btn"
                :class="{ 'pending-delete': pendingDeleteIndex === song.originalIndex }"
                @click.stop="handleDeleteClick(song.originalIndex)"
              >
                <Delete theme="outline" size="16" />
                <span v-if="pendingDeleteIndex === song.originalIndex" class="delete-text">删除</span>
              </button>
            </div>
          </div>
        </template>
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

.action-btn.priority-btn {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.action-btn.priority-btn:hover {
  background: rgba(245, 158, 11, 0.2);
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

.queue-section {
  margin-bottom: 8px;
}

.section-label {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: rgba(var(--color-bg-tertiary), 0.3);
}

.section-label.priority-label {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: #f59e0b;
  border-radius: 10px;
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

.song-item.priority-item {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.song-item.priority-item:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
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
  margin-right: auto;
}

.song-name {
  font-size: 13px;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.song-item.is-playing .song-name {
  color: var(--color-primary);
  font-weight: 500;
}

.priority-icon {
  font-size: 12px;
  color: #f59e0b;
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

.upgrade-btn,
.downgrade-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 8px;
  color: var(--color-primary);
  transition: all 0.2s ease;
}

.upgrade-btn.pending-action,
.downgrade-btn.pending-action {
  background: rgba(var(--color-primary-rgb), 0.15);
}

.action-text {
  font-size: 11px;
  font-weight: 500;
}

.remove-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.remove-btn.pending-delete {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.delete-text {
  font-size: 11px;
  font-weight: 500;
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
    width: 340px;
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