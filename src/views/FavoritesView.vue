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
      
      <div v-if="favorites.length > 0" class="flex items-center justify-between mb-md md:mb-lg">
        <div class="text-sm md:text-secondary">共 {{ totalCount }} 首歌曲</div>
        <button 
          class="px-sm py-xs md:px-md md:py-sm gradient-bg text-white rounded-full text-xs md:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
          @click="playAll"
        >
          <Play theme="filled" size="14" />
          播放全部
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