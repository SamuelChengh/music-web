<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getNewList, getRecommendList, type Playlist } from '../api';
import CoverPlay from '../components/CoverPlay.vue';

const router = useRouter();
const recommendList = ref<Playlist[]>([]);
const newList = ref<Playlist[]>([]);
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

const goToPlaylist = (id: number) => {
  router.push(`/playlist/${id}`);
};

const formatName = (name: string) => {
  return name.length > 15 ? name.substring(0, 15) + '...' : name;
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-secondary">加载中...</div>
    </div>
    
    <template v-else>
      <div class="px-md py-md md:px-lg md:py-lg">
        <div class="flex items-center gap-md mb-md md:mb-lg">
          <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
          <h1 class="text-xl md:text-2xl font-bold text-main">发现音乐</h1>
        </div>

        <div class="mb-lg md:mb-xl">
          <div class="flex items-center justify-between mb-md md:mb-lg">
            <h2 class="text-lg md:text-lg font-semibold text-main flex items-center gap-sm">
              <span class="w-1 h-4 gradient-bg rounded-full"></span>
              热门推荐
            </h2>
          </div>
          
          <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md md:gap-lg">
            <div
              v-for="playlist in recommendList"
              :key="playlist.id"
              class="group cursor-pointer"
              @click="goToPlaylist(playlist.id)"
            >
              <CoverPlay :pic-url="playlist.pic" :play-count="playlist.playCount" show-play-count />
              <div class="mt-2 md:mt-3 text-sm md:text-sm text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {{ formatName(playlist.name) }}
              </div>
              <div class="text-xs md:text-xs text-secondary mt-1 truncate">
                {{ playlist.songCount }}首 · {{ playlist.creator }}
              </div>
            </div>
          </div>
        </div>

        <div class="mb-lg md:mb-xl">
          <div class="flex items-center justify-between mb-md md:mb-lg">
            <h2 class="text-lg md:text-lg font-semibold text-main flex items-center gap-sm">
              <span class="w-1 h-4 gradient-bg rounded-full"></span>
              新歌首发
            </h2>
          </div>
          
          <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md md:gap-lg">
            <div
              v-for="(playlist, index) in newList"
              :key="playlist.id"
              class="group cursor-pointer"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="relative">
                <CoverPlay :pic-url="playlist.pic" :play-count="playlist.playCount" show-play-count />
                <div v-if="index < 3" 
                  class="absolute top-1.5 left-1.5 md:top-2 md:left-2 text-white text-xs md:text-xs font-bold w-5 h-5 md:w-5 md:h-5 flex items-center justify-center rounded"
                  :class="index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="mt-2 md:mt-3 text-sm md:text-sm text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {{ formatName(playlist.name) }}
              </div>
              <div class="text-xs md:text-xs text-secondary mt-1 truncate">
                {{ playlist.songCount }}首 · {{ playlist.creator }}
              </div>
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
