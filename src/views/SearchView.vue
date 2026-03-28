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
    searchResults.value = await searchSongs(kw, 1, 100);
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

const playSong = (song: Song, index: number) => {
  playerStore.playSongList(searchResults.value, index);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-lg py-md">
      <div class="flex items-center gap-md mb-sm">
        <div class="w-1 h-6 gradient-bg rounded-full"></div>
        <h1 class="text-2xl font-bold text-main">搜索结果</h1>
        <span v-if="keyword" class="text-lg text-secondary">"{{ keyword }}"</span>
      </div>

      <div v-if="searching" class="flex items-center justify-center py-xl">
        <div class="text-secondary">搜索中...</div>
      </div>

      <div v-else-if="searchResults.length > 0" class="flex flex-col">
        <div
          v-for="(song, index) in searchResults"
          :key="song.rid"
          class="flex items-center gap-md py-sm rounded-2xl hover:bg-active cursor-pointer group transition-all duration-200 mb-xs"
          @click="playSong(song, index)"
        >
          <div class="w-10 text-center font-bold text-xl text-secondary">
            {{ index + 1 }}
          </div>
          <img 
            :src="song.pic" 
            class="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <div class="flex-1 min-w-0">
            <div class="text-lg font-medium text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
            <div class="text-sm text-secondary truncate mt-1">{{ song.artist }}</div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 p-2.5 gradient-bg text-white rounded-full transition-all">
            <Play theme="filled" size="18" />
          </button>
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
