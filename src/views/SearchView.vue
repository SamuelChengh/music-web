<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { searchSongs, getHotSearch } from '../api';
import { usePlayerStore, useFavoritesStore } from '../stores';
import LikeButton from '../components/LikeButton.vue';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();

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
    <div class="px-md py-sm md:px-lg md:py-md">
      <div class="section-divider">
        <h1 class="text-xl md:text-2xl font-bold text-main">搜索结果</h1>
        <span v-if="keyword" class="text-base md:text-lg text-secondary font-normal">
          "{{ keyword }}"
        </span>
      </div>

      <div v-if="searching" class="flex items-center justify-center py-xl">
        <div class="text-secondary">搜索中...</div>
      </div>

      <div v-else-if="searchResults.length > 0" class="flex flex-col">
        <div
          v-for="(song, index) in searchResults"
          :key="song.rid"
          class="song-row-simple group"
          @click="playSong(song, index)"
        >
          <div class="rank-badge">
            {{ index + 1 }}
          </div>
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
            :class="favoritesStore.isFavorite(song.rid) ? '' : 'opacity-0 group-hover:opacity-100'"
          />
        </div>
      </div>

      <div v-else-if="keyword" class="empty-state-simple">
        <div class="text-sm">未找到相关歌曲</div>
      </div>

      <div v-else class="empty-state-simple">
        <div class="text-sm">在上方搜索框输入关键词搜索歌曲</div>
      </div>
    </div>
  </div>
</template>