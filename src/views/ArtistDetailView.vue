<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArtistSongs, getArtistInfo } from '../api';
import { usePlayerStore } from '../stores';

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
const router = useRouter();
const playerStore = usePlayerStore();
const artistId = ref(Number(route.params.id));
const artistInfo = ref<Artist | null>(null);
const songs = ref<Song[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const artists = await getArtistInfo('', 1, 1);
    const artist = artists.find((a: Artist) => a.id === artistId.value);
    if (artist) {
      artistInfo.value = artist;
    }
    songs.value = await getArtistSongs(artistId.value, 1, 50);
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

onMounted(loadData);

const playSong = (song: Song) => {
  playerStore.setSong(song);
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 pb-24 md:pb-4">
    <button v-if="artistInfo" class="mb-4 md:mb-6 text-sm md:text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 md:gap-2 transition-colors" @click="goBack">
      <span>←</span>
      <span>返回</span>
    </button>
    
    <div v-if="loading" class="text-center py-16 text-lg text-[var(--color-text-secondary)]">
      加载中...
    </div>

    <div v-else-if="artistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 mb-6 md:mb-10">
        <img :src="artistInfo.pic" class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg" />
        <div class="text-center sm:text-left">
          <h1 class="text-xl md:text-3xl font-bold text-[var(--color-text-primary)]">{{ artistInfo.name }}</h1>
          <p class="text-sm md:text-lg text-[var(--color-text-secondary)] mt-1 md:mt-2">共 {{ songs.length }} 首歌曲</p>
        </div>
      </div>

      <h2 class="text-lg md:text-2xl font-semibold mb-4 md:mb-6 text-[var(--color-text-primary)] border-b-2 border-[var(--color-primary)] pb-2">热门歌曲</h2>
      <div class="space-y-2 md:space-y-3">
        <div
          v-for="(song, index) in songs"
          :key="song.rid"
          class="flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl hover:bg-[var(--color-bg-secondary)] cursor-pointer group transition-colors"
          @click="playSong(song)"
        >
          <div class="w-6 md:w-8 text-center text-sm md:text-lg text-[var(--color-text-secondary)]">
            {{ index + 1 }}
          </div>
          <img :src="song.pic" class="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover shadow" />
          <div class="flex-1 min-w-0">
            <div class="text-sm md:text-lg font-medium text-[var(--color-text-primary)] truncate">{{ song.name }}</div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 px-3 md:px-5 py-1.5 md:py-2 bg-[var(--color-primary)] text-white rounded-lg text-xs md:text-base font-medium transition-opacity">
            播放
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-lg text-[var(--color-text-secondary)]">
      歌手不存在
    </div>
  </div>
</template>
