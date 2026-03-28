<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores';
import { Like, Play, Delete } from '@icon-park/vue-next';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const playerStore = usePlayerStore();
const favorites = ref<Song[]>([]);

const loadFavorites = () => {
  const stored = localStorage.getItem('favorites');
  if (stored) {
    favorites.value = JSON.parse(stored);
  }
};

onMounted(loadFavorites);

const playSong = (song: Song, index: number) => {
  playerStore.playSongList(favorites.value, index);
};

const playAll = () => {
  if (favorites.value.length > 0) {
    playerStore.playSongList(favorites.value, 0);
  }
};

const removeFromFavorites = (song: Song) => {
  favorites.value = favorites.value.filter(s => s.rid !== song.rid);
  localStorage.setItem('favorites', JSON.stringify(favorites.value));
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-lg py-lg">
      <div class="flex items-center gap-md mb-lg">
        <div class="w-1 h-6 gradient-bg rounded-full"></div>
        <h1 class="text-2xl font-bold text-main">我喜欢</h1>
      </div>
      
      <div v-if="favorites.length > 0">
        <div class="flex items-center justify-between mb-lg">
          <div class="text-secondary">共 {{ favorites.length }} 首歌曲</div>
          <button 
            class="px-md py-sm gradient-bg text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
            @click="playAll"
          >
            <Play theme="filled" size="16" />
            播放全部
          </button>
        </div>
        
        <div class="space-y-1">
          <div
            v-for="(song, index) in favorites"
            :key="song.rid"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-tertiary cursor-pointer group transition-colors"
            @click="playSong(song, index)"
          >
            <img :src="song.pic" class="w-12 h-12 rounded-lg object-cover" />
            <div class="flex-1 min-w-0">
              <div class="text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
              <div class="text-sm text-secondary truncate">{{ song.artist }}</div>
            </div>
            <button 
              class="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all"
              @click.stop="removeFromFavorites(song)"
            >
              <Delete theme="outline" size="18" />
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-16 text-secondary">
        <Like theme="outline" size="48" class="mx-auto mb-4 opacity-50" />
        <div>暂无收藏歌曲</div>
        <div class="text-sm mt-2">在播放歌曲时可以收藏</div>
      </div>
    </div>
  </div>
</template>
