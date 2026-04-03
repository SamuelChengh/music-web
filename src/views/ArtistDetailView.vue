<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getArtistSongs, getArtistInfo } from '../api';
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

interface Artist {
  id: number;
  name: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const queueStore = useQueueStore();
const { isMobile } = useIsMobile();
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

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view px-md py-sm md:px-lg md:py-md" @scroll="handleScroll">
    <div v-if="loading" class="text-center py-xl text-secondary">
      加载中...
    </div>

    <div v-else-if="artistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-md md:gap-lg mb-sm">
        <img :src="artistInfo.pic" class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg" />
        <div class="text-center sm:text-left">
          <h1 class="text-xl md:text-xl font-bold text-primary">{{ artistInfo.name }}</h1>
          <p class="text-sm md:text-sm text-secondary mt-1">共 {{ allSongs.length }} 首歌曲</p>
        </div>
      </div>

      <h2 class="text-lg md:text-lg font-semibold mb-sm text-main">热门歌曲</h2>
      
      <div class="flex flex-col">
        <!-- 移动端歌曲列表 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="song in songs"
            :key="song.rid"
            :song="song"
            @play="playSong"
          />
        </div>
        
        <!-- PC端歌曲列表 -->
        <div class="hidden md:block">
          <div
            v-for="song in songs"
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

      <div v-if="loadingMore" class="text-center py-md text-secondary">
        加载更多...
      </div>
      <div v-else-if="!hasMore && songs.length > 0" class="text-center py-md text-tertiary text-sm">
        没有更多了
      </div>
    </div>

    <div v-else class="empty-state-simple">
      <div class="text-sm">歌手不存在</div>
    </div>
  </div>
</template>