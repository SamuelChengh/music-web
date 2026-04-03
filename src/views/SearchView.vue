<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { searchSongs, getHotSearch } from '../api';
import { usePlayerStore, useFavoritesStore, useQueueStore } from '../stores';
import SongRowMobile from '../components/SongRowMobile.vue';
import LikeButton from '../components/LikeButton.vue';
import { useIsMobile } from '../composables/useIsMobile';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const queueStore = useQueueStore();
const { isMobile } = useIsMobile();

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

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
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
        <!-- 移动端歌曲列表 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="song in searchResults"
            :key="song.rid"
            :song="song"
            @play="playSong"
          />
        </div>
        
        <!-- PC端歌曲列表 -->
        <div class="hidden md:block">
          <div
            v-for="song in searchResults"
            :key="song.rid"
            class="song-row-simple group"
            @click="playSong(song)"
          >
            <img :src="song.pic" class="song-cover-simple" />
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
              :class="favoritesStore.isFavorite(song.rid) || isMobile ? '' : 'opacity-0 group-hover:opacity-100'"
            />
          </div>
        </div>
      </div>

      <div v-else-if="keyword && !searching" class="text-center py-xl text-secondary">
        未找到相关结果
      </div>

      <div v-if="hotSearch.length > 0 && !keyword" class="mt-md">
        <h3 class="text-base font-semibold text-main mb-sm">热门搜索</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(tag, index) in hotSearch"
            :key="index"
            class="hot-tag"
            @click="keyword = tag; doSearch(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>