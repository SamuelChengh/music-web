<script setup lang="ts">
import { useQueueStore } from '../stores';
import LikeButton from './LikeButton.vue';
import { Add, PlayOne } from '@icon-park/vue-next';
import type { Song } from '../stores/player';

interface Props {
  song: Song;
  rank?: number;
  showRank?: boolean;
  rankClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showRank: false,
  rankClass: ''
});

const emit = defineEmits<{
  play: [song: Song];
}>();

const queueStore = useQueueStore();

const handleClick = () => {
  emit('play', props.song);
};

const handleAddToQueue = (e: Event) => {
  e.stopPropagation();
  queueStore.addToQueue(props.song);
};

const handlePlayNext = (e: Event) => {
  e.stopPropagation();
  queueStore.playNext(props.song);
};
</script>

<template>
  <div class="song-row-mobile" @click="handleClick">
    <!-- 排名徽章 -->
    <div v-if="showRank" class="rank-badge-mobile" :class="rankClass">
      {{ rank }}
    </div>
    
    <!-- 封面 -->
    <img 
      :src="song.pic" 
      class="song-cover-mobile"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    
    <!-- 歌曲信息 -->
    <div class="song-info-mobile">
      <div class="song-name-mobile">{{ song.name }}</div>
      <div class="song-artist-mobile">{{ song.artist }}</div>
    </div>
    
    <!-- 操作按钮：收藏 + 添加队列 + 下一首播放 -->
    <div class="song-actions-mobile">
      <LikeButton
        :song="song"
        size="small"
        :show-tooltip="false"
      />
      <button 
        class="action-btn" 
        @click.stop="handleAddToQueue"
        aria-label="添加到播放队列"
      >
        <Add theme="outline" size="20" />
      </button>
      <button 
        class="action-btn play-next" 
        @click.stop="handlePlayNext"
        aria-label="下一首播放"
      >
        <PlayOne theme="outline" size="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.song-row-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(var(--color-bg-view-rgb), 0.98);
  cursor: pointer;
  transition: background 0.2s ease;
}

.song-row-mobile:active {
  background: rgba(var(--color-bg-tertiary), 0.5);
}

.rank-badge-mobile {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  border-radius: 8px;
  background: rgba(var(--color-bg-tertiary), 0.5);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.rank-badge-mobile.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-badge-mobile.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-badge-mobile.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8722d 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.song-cover-mobile {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.song-info-mobile {
  flex: 1;
  min-width: 0;
}

.song-name-mobile {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist-mobile {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: var(--color-primary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
}

.action-btn:active {
  transform: scale(0.92);
}

.action-btn.play-next {
  color: #f59e0b;
}

.action-btn.play-next:hover {
  background: rgba(245, 158, 11, 0.1);
}

@media (min-width: 768px) {
  .song-row-mobile {
    display: none;
  }
}
</style>