<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { searchSongs, getHotSearch } from '../api';
import { usePlayerStore } from '../stores';
import { Play } from '@icon-park/vue-next';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();

const keyword = ref('');
const searchResults = ref<Song[]>([]);
const hotSearch = ref<string[]>([]);
const searching = ref(false);

const doSearch = async (kw: string) => {
  if (!kw.trim()) {
    searchResults.value = [];
    return;
  }
  searching.value = true;
  try {
    searchResults.value = await searchSongs(kw, 1, 30);
  } catch (e) {
    console.error(e);
  }
  searching.value = false;
};

onMounted(async () => {
  hotSearch.value = await getHotSearch();
  const q = route.query.q as string;
  if (q) {
    keyword.value = q;
    doSearch(q);
  }
});

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    keyword.value = newQ as string;
    doSearch(newQ as string);
  } else {
    keyword.value = '';
    searchResults.value = [];
  }
});

const playSong = (song: Song) => {
  playerStore.setSong(song);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-lg py-lg">
      <div class="flex items-center gap-md mb-lg">
        <div class="w-1 h-6 gradient-bg rounded-full"></div>
        <h1 class="text-2xl font-bold text-main">搜索结果</h1>
        <span v-if="keyword" class="text-lg text-secondary">"{{ keyword }}"</span>
      </div>

      <div v-if="searching" class="flex items-center justify-center py-xl">
        <div class="text-secondary">搜索中...</div>
      </div>

      <div v-else-if="searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        <div
          v-for="song in searchResults"
          :key="song.rid"
          class="bg-tertiary rounded-xl p-md cursor-pointer transition-all duration-200 hover:bg-active hover:shadow-lg hover:-translate-y-1 group"
          @click="playSong(song)"
        >
          <div class="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-md">
            <img :src="song.pic" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 w-12 h-12 gradient-bg rounded-full flex items-center justify-center transition-all duration-200 transform scale-75 group-hover:scale-100">
                <Play theme="filled" size="20" class="text-white" />
              </div>
            </div>
          </div>
          <div class="text-sm font-medium text-main truncate mb-1 group-hover:text-primary transition-colors">{{ song.name }}</div>
          <div class="text-xs text-secondary truncate">{{ song.artist }}</div>
        </div>
      </div>

      <div v-else-if="keyword" class="text-center py-xl text-secondary">
        未找到相关歌曲
      </div>

      <div v-else class="text-center py-lg text-secondary">
        在上方搜索框输入关键词搜索歌曲
      </div>
    </div>
  </div>
</template>
