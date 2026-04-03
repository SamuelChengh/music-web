<script setup lang="ts">
import { computed } from 'vue';
import { useFavoritesStore, usePlayerStore, useQueueStore } from '../stores';
import { Play } from '@icon-park/vue-next';
import SongRowMobile from '../components/SongRowMobile.vue';
import LikeButton from '../components/LikeButton.vue';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();

const favorites = computed(() => favoritesStore.sortedFavorites);
const totalCount = computed(() => favoritesStore.totalCount);

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
};

const playAll = () => {
  if (favorites.value.length > 0) {
    playerStore.playSongList(favorites.value, 0);
  }
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-md py-sm md:px-lg md:py-md">
      <div class="section-divider">
        <h1 class="text-xl md:text-2xl font-bold text-main">我喜欢</h1>
      </div>
      
      <div v-if="favorites.length > 0" class="mb-md md:mb-lg flex items-center justify-between">
        <div class="text-sm text-secondary">共 {{ totalCount }} 首歌曲</div>
        <button 
          class="play-all-btn"
          @click="playAll"
        >
          <div class="play-icon-wrapper">
            <Play theme="outline" size="16" />
          </div>
          <span class="play-text">播放全部</span>
          <span class="play-count">{{ totalCount }}</span>
        </button>
      </div>
      
      <div v-if="favorites.length > 0" class="flex flex-col">
        <!-- 移动端歌曲列表 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="song in favorites"
            :key="song.rid"
            :song="song"
            @play="playSong"
          />
        </div>
        
        <!-- PC端歌曲列表 -->
        <div class="hidden md:block">
          <div
            v-for="song in favorites"
            :key="song.rid"
            class="song-row-simple group"
            @click="playSong(song)"
          >
            <img 
              :src="song.pic" 
              class="song-cover-simple"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="flex-1 min-w-0">
              <div class="text-base md:text-lg font-medium text-main truncate">
                {{ song.name }}
              </div>
              <div class="text-sm md:text-base text-secondary truncate mt-0.5">
                {{ song.artist }}
              </div>
            </div>
            <LikeButton
              :song="song"
              size="small"
              :show-tooltip="false"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state-simple">
        <div class="text-sm">暂无收藏歌曲</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.play-all-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--color-primary) 0%, rgba(var(--color-primary-rgb), 0.8) 100%);
  border-radius: 14px;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.3),
              0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.play-all-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-all-btn:hover::before {
  opacity: 1;
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--color-primary-rgb), 0.4),
              0 4px 12px rgba(0, 0, 0, 0.15);
}

.play-all-btn:active {
  transform: translateY(0);
}

.play-icon-wrapper {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: background 0.3s ease;
}

.play-all-btn:hover .play-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
}

.play-text {
  flex: 1;
}

.play-count {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .play-all-btn {
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 12px;
    gap: 6px;
  }
  
  .play-icon-wrapper {
    width: 22px;
    height: 22px;
  }

  .play-count {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>