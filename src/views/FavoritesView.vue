<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores';
import { Like, Play, Delete } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

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
  <div class="h-full overflow-y-auto bg-view flex flex-col">
    <div class="px-md py-md md:px-lg md:py-lg flex-1 flex flex-col">
      <div class="flex items-center gap-md mb-md md:mb-lg">
        <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
        <h1 class="text-xl md:text-2xl font-bold text-main">我喜欢</h1>
      </div>
      
      <div v-if="favorites.length > 0" class="flex-1">
        <div class="flex items-center justify-between mb-md md:mb-lg">
          <div class="text-sm md:text-secondary">共 {{ favorites.length }} 首歌曲</div>
          <button 
            class="px-sm py-xs md:px-md md:py-sm gradient-bg text-white rounded-full text-xs md:text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
            @click="playAll"
          >
            <Play theme="filled" size="14" />
            播放全部
          </button>
        </div>
        
        <div class="space-y-1">
          <div
            v-for="(song, index) in favorites"
            :key="song.rid"
            class="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-tertiary cursor-pointer group transition-colors"
            @click="playSong(song, index)"
          >
            <img :src="song.pic" class="w-11 h-11 md:w-12 md:h-12 rounded-lg object-cover" />
            <div class="flex-1 min-w-0">
              <div class="text-base md:text-base text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
              <div class="text-sm md:text-sm text-secondary truncate">{{ song.artist }}</div>
            </div>
            <el-tooltip content="移除收藏" placement="top">
              <button 
                class="opacity-0 group-hover:opacity-100 p-1.5 md:p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all"
                @click.stop="removeFromFavorites(song)"
              >
                <Delete theme="outline" size="16" />
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>
      
      <div v-else class="flex-1 flex items-center justify-center gap-3 text-secondary">
        <Like theme="outline" size="20" class="opacity-50" />
        <div class="text-base">暂无收藏歌曲</div>
      </div>
    </div>
  </div>
</template>
