<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getNewList, getRecommendList } from '../api';
import { usePlayerStore } from '../stores';
import CoverPlay from '../components/CoverPlay.vue';
import { Play } from '@icon-park/vue-next';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  duration?: number;
}

const playerStore = usePlayerStore();
const recommendList = ref<Song[]>([]);
const newList = ref<Song[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const [newData, recData] = await Promise.all([
      getNewList(1, 30),
      getRecommendList('伤感', 1, 20),
    ]);
    newList.value = newData.slice(0, 20);
    recommendList.value = recData.slice(0, 20);
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

onMounted(loadData);

const playSong = (song: Song) => {
  playerStore.setSong(song);
};

const playAll = () => {
  if (newList.value.length > 0) {
    playerStore.setSong(newList.value[0]);
  }
};

const formatArtist = (artist: string) => {
  return artist.length > 10 ? artist.substring(0, 10) + '...' : artist;
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-secondary">加载中...</div>
    </div>
    
    <template v-else>
      <div class="px-lg py-lg">
        <!-- 发现音乐标题 -->
        <div class="flex items-center gap-md mb-lg">
          <div class="w-1 h-6 gradient-bg rounded-full"></div>
          <h1 class="text-2xl font-bold text-main">发现音乐</h1>
        </div>

        <!-- 热门推荐 -->
        <div class="mb-xl">
          <div class="flex items-center justify-between mb-lg">
            <h2 class="text-lg font-semibold text-main flex items-center gap-sm">
              <span class="w-1 h-4 gradient-bg rounded-full"></span>
              热门推荐
            </h2>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-lg">
            <div
              v-for="song in recommendList"
              :key="song.rid"
              class="group"
            >
              <CoverPlay :pic-url="song.pic" @click="playSong(song)" />
              <div class="mt-3 text-sm text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {{ song.name }}
              </div>
              <div class="text-xs text-secondary mt-1 truncate">{{ formatArtist(song.artist) }}</div>
            </div>
          </div>
        </div>

          <!-- 新歌首发 -->
        <div class="mb-xl">
          <div class="flex items-center justify-between mb-lg">
            <h2 class="text-lg font-semibold text-main flex items-center gap-sm">
              <span class="w-1 h-4 gradient-bg rounded-full"></span>
              新歌首发
            </h2>
            
            <button 
              class="px-md py-sm gradient-bg text-white text-sm rounded-full hover:opacity-90 transition-opacity flex items-center gap-sm"
              @click="playAll"
            >
              <Play theme="filled" size="14" />
              <span>播放全部</span>
            </button>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-lg">
            <div
              v-for="(song, index) in newList"
              :key="song.rid"
              class="group"
            >
              <div class="relative">
                <CoverPlay :pic-url="song.pic" @click="playSong(song)" />
                <div v-if="index < 3" 
                  class="absolute top-2 left-2 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded"
                  :class="index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="mt-3 text-sm text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {{ song.name }}
              </div>
              <div class="text-xs text-secondary mt-1 truncate">{{ formatArtist(song.artist) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
