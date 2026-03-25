<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArtistInfo } from '../api';
import { Play } from '@icon-park/vue-next';

interface Artist {
  id: number;
  name: string;
  pic: string;
}

const router = useRouter();
const artists = ref<Artist[]>([]);
const loading = ref(false);
const category = ref('全部');
const page = ref(1);

const categories = ['全部', '华语男', '华语女', '华语组合', '日韩男', '日韩女', '日韩组合', '欧美男', '欧美女', '欧美组合'];

const loadArtists = async () => {
  loading.value = true;
  artists.value = await getArtistInfo(category.value, page.value, 60);
  loading.value = false;
};

onMounted(loadArtists);

const changeCategory = async (cat: string) => {
  category.value = cat;
  page.value = 1;
  await loadArtists();
};

const goToArtistDetail = (id: number) => {
  router.push(`/artist/${id}`);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-lg py-lg">
      <div class="flex items-center gap-md mb-lg">
        <div class="w-1 h-6 gradient-bg rounded-full"></div>
        <h1 class="text-2xl font-bold text-main">歌手</h1>
      </div>
      
      <div class="flex gap-sm mb-lg overflow-x-auto pb-3 scrollbar-hide">
        <div
          v-for="cat in categories"
          :key="cat"
          class="flex-shrink-0 px-md py-sm rounded-full cursor-pointer transition-all duration-200 text-sm whitespace-nowrap"
          :class="category === cat 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-tertiary hover:bg-active text-secondary hover:text-active'"
          @click="changeCategory(cat)"
        >
          {{ cat }}
        </div>
      </div>

      <div v-if="loading" class="text-center py-xl text-secondary">
        加载中...
      </div>

      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-lg">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="cursor-pointer group"
          @click="goToArtistDetail(artist.id)"
        >
          <div class="relative aspect-square">
            <img 
              :src="artist.pic" 
              class="w-full h-full object-cover rounded-full shadow-md group-hover:shadow-lg transition-all group-hover:scale-105" 
            />
            <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <Play theme="filled" size="32" class="text-white opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
          <div class="mt-3 text-center text-sm font-medium text-main truncate group-hover:text-primary transition-colors">{{ artist.name }}</div>
        </div>
      </div>
    </div>
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
