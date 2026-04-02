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
  return name.length > 12 ? name.substring(0, 12) + '...' : name;
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-secondary">加载中...</div>
    </div>
    
    <template v-else>
      <div class="px-md py-md md:px-lg md:py-lg">
        <div class="section-divider">
          <h1 class="text-xl md:text-2xl font-bold text-main">发现音乐</h1>
        </div>

        <section class="mb-lg md:mb-xl">
          <div class="section-divider">
            <h2 class="text-base md:text-lg font-semibold text-main">热门推荐</h2>
          </div>
          
          <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-sm md:gap-md">
            <div
              v-for="playlist in recommendList"
              :key="playlist.id"
              class="playlist-card-light"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="cover-light">
                <CoverPlay :pic-url="playlist.pic" :play-count="playlist.playCount" show-play-count />
              </div>
              <div class="mt-2 px-1 pb-1">
                <div class="text-xs md:text-sm text-main line-clamp-2 leading-snug">
                  {{ formatName(playlist.name) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-lg md:mb-xl">
          <div class="section-divider">
            <h2 class="text-base md:text-lg font-semibold text-main">新歌首发</h2>
          </div>
          
          <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-sm md:gap-md">
            <div
              v-for="(playlist, index) in newList"
              :key="playlist.id"
              class="playlist-card-light"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="cover-light relative">
                <CoverPlay :pic-url="playlist.pic" :play-count="playlist.playCount" show-play-count />
                <div v-if="index < 3" 
                  class="absolute top-1 left-1 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-sm"
                  :class="index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'"
                >
                  {{ index + 1 }}
                </div>
              </div>
              <div class="mt-2 px-1 pb-1">
                <div class="text-xs md:text-sm text-main line-clamp-2 leading-snug">
                  {{ formatName(playlist.name) }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>