<script setup lang="ts">
import { computed } from 'vue';
import { PlayOne, Add, Like, Close } from '@icon-park/vue-next';
import { useQueueStore, useFavoritesStore } from '../stores';
import type { Song } from '../stores/player';

interface Props {
  visible: boolean;
  song: Song | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const queueStore = useQueueStore();
const favoritesStore = useFavoritesStore();

const isFavorite = computed(() => {
  return props.song ? favoritesStore.isFavorite(props.song.rid) : false;
});

const handlePlayNext = () => {
  if (props.song) {
    queueStore.playNext(props.song);
    emit('close');
  }
};

const handleAddToQueue = () => {
  if (props.song) {
    queueStore.addToQueue(props.song);
    emit('close');
  }
};

const handleToggleFavorite = () => {
  if (props.song) {
    if (isFavorite.value) {
      favoritesStore.removeFromFavorites(props.song.rid);
    } else {
      favoritesStore.addToFavorites(props.song);
    }
    emit('close');
  }
};

const handleClose = () => {
  emit('close');
};

const handleOverlayClick = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="visible" 
        class="action-sheet-overlay"
        @click="handleOverlayClick"
      />
    </Transition>
    
    <Transition name="slide-up">
      <div v-if="visible" class="action-sheet">
        <div class="action-sheet-header">
          <div class="song-preview" v-if="song">
            <img :src="song.pic" class="song-cover" />
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
          </div>
        </div>
        
        <div class="action-sheet-content">
          <button class="action-item" @click="handlePlayNext">
            <PlayOne theme="outline" size="20" class="action-icon" />
            <span>下一首播放</span>
          </button>
          
          <button class="action-item" @click="handleAddToQueue">
            <Add theme="outline" size="20" class="action-icon" />
            <span>添加到队列</span>
          </button>
          
          <button class="action-item" @click="handleToggleFavorite">
            <Like 
              :theme="isFavorite ? 'filled' : 'outline'" 
              size="20" 
              class="action-icon"
              :style="{ color: isFavorite ? '#ff4757' : '' }"
            />
            <span>{{ isFavorite ? '取消收藏' : '收藏' }}</span>
          </button>
        </div>
        
        <div class="action-sheet-footer">
          <button class="cancel-btn" @click="handleClose">
            取消
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.action-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
}

.action-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-bg-view-rgb), 0.98);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  z-index: 101;
  max-height: 80vh;
  overflow: hidden;
}

.action-sheet-header {
  padding: 16px;
  border-bottom: 1px solid rgba(var(--color-border), 0.5);
}

.song-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-sheet-content {
  padding: 8px 0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: transparent;
  color: var(--color-text-main);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-item:hover {
  background: rgba(var(--color-primary-rgb), 0.08);
}

.action-item:active {
  background: rgba(var(--color-primary-rgb), 0.15);
  transform: scale(0.98);
}

.action-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.action-sheet-footer {
  padding: 8px 16px 20px;
  border-top: 1px solid rgba(var(--color-border), 0.5);
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: rgba(var(--color-bg-tertiary), 0.8);
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(var(--color-bg-tertiary), 1);
}

.cancel-btn:active {
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .action-sheet {
    display: none;
  }
  
  .action-sheet-overlay {
    display: none;
  }
}
</style>