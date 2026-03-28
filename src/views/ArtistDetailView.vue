<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getArtistSongs, getArtistInfo } from '../api';
import { usePlayerStore } from '../stores';
import { Play } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

interface Artist {
  id: number;
  name: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();
const artistId = ref(Number(route.params.id));
const artistInfo = ref<Artist | null>(null);
const loading = ref(true);

const page = ref(1);
const pageSize = 30;
const hasMore = ref(true);
const loadingMore = ref(false);
const allSongs = ref<Song[]>([]);

const songs = computed(() => {
  return allSongs.value.slice(0, page.value * pageSize);
});

const loadData = async () => {
  loading.value = true;
  page.value = 1;
  hasMore.value = true;
  try {
    const artists = await getArtistInfo('', 1, 1);
    const artist = artists.find((a: Artist) => a.id === artistId.value);
    if (artist) {
      artistInfo.value = artist;
    }
    allSongs.value = await getArtistSongs(artistId.value, 1, 100);
    hasMore.value = allSongs.value.length > pageSize;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return;
  
  const loadedCount = page.value * pageSize;
  if (loadedCount >= allSongs.value.length) {
    hasMore.value = false;
    return;
  }
  
  loadingMore.value = true;
  setTimeout(() => {
    page.value++;
    loadingMore.value = false;
  }, 200);
};

const handleScroll = (e: Event) => {
  if (loadingMore.value || !hasMore.value || loading.value) return;
  
  const target = e.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadMore();
  }
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
});

watch(() => route.params.id, (newId) => {
  artistId.value = Number(newId);
  loadData();
});

const playSong = (song: Song, index: number) => {
  playerStore.playSongList(allSongs.value, index);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view px-lg py-md" @scroll="handleScroll">
    <div v-if="loading" class="text-center py-xl text-secondary">
      加载中...
    </div>

    <div v-else-if="artistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-lg mb-sm">
        <img :src="artistInfo.pic" class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg" />
        <div class="text-center sm:text-left">
          <h1 class="text-xl md:text-3xl font-bold text-primary">{{ artistInfo.name }}</h1>
          <p class="text-sm md:text-lg text-secondary mt-1 md:mt-2">共 {{ allSongs.length }} 首歌曲</p>
        </div>
      </div>

      <h2 class="text-lg font-semibold mb-sm text-main border-primary pb-sm">热门歌曲</h2>
      <div class="flex flex-col">
        <div
          v-for="(song, index) in songs"
          :key="song.rid"
          class="flex items-center gap-md py-sm rounded-2xl hover:bg-active cursor-pointer group transition-all duration-200 mb-xs"
          @click="playSong(song, index)"
        >
          <div class="w-10 text-center font-bold text-xl" :class="index < 3 ? 'text-primary' : 'text-secondary'">
            {{ index + 1 }}
          </div>
          <img :src="song.pic" class="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <div class="flex-1 min-w-0">
            <div class="text-lg font-medium text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
            <div class="text-sm text-secondary truncate mt-1">{{ song.artist || artistInfo.name }}</div>
          </div>
          <el-tooltip content="播放" placement="top">
            <button class="opacity-0 group-hover:opacity-100 p-2.5 gradient-bg text-white rounded-full transition-all">
              <Play theme="filled" size="18" />
            </button>
          </el-tooltip>
        </div>
      </div>

      <div class="py-lg text-center">
        <div v-if="loadingMore" class="text-secondary">加载中...</div>
        <div v-else-if="!hasMore && allSongs.length > 0" class="text-secondary">加载完毕</div>
      </div>
    </div>

    <div v-else class="text-center py-xl text-secondary">
      歌手不存在
    </div>
  </div>
</template>
