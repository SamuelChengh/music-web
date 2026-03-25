<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArtistSongs, getArtistInfo } from '../api';
import { usePlayerStore } from '../stores';
import { Play } from '@icon-park/vue-next';

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

watch(() => route.params.id, (newId) => {
  artistId.value = Number(newId);
  loadData();
});

const playSong = (song: Song) => {
  playerStore.setSong(song);
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view px-lg py-md">
    <div v-if="loading" class="text-center py-xl text-secondary">
      加载中...
    </div>

    <div v-else-if="artistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-lg mb-sm">
        <img :src="artistInfo.pic" class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg" />
        <div class="text-center sm:text-left">
          <h1 class="text-xl md:text-3xl font-bold text-primary">{{ artistInfo.name }}</h1>
          <p class="text-sm md:text-lg text-secondary mt-1 md:mt-2">共 {{ songs.length }} 首歌曲</p>
        </div>
      </div>

      <h2 class="text-lg font-semibold mb-sm text-main border-primary pb-sm">热门歌曲</h2>
      <div class="flex flex-col">
        <div
          v-for="(song, index) in songs"
          :key="song.rid"
          class="flex items-center gap-md py-sm rounded-2xl hover:bg-active cursor-pointer group transition-all duration-200 mb-xs"
          @click="playSong(song)"
        >
          <div class="w-10 text-center font-bold text-xl" :class="index < 3 ? 'text-primary' : 'text-secondary'">
            {{ index + 1 }}
          </div>
          <img :src="song.pic" class="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <div class="flex-1 min-w-0">
            <div class="text-lg font-medium text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
            <div class="text-sm text-secondary truncate mt-1">{{ song.artist || artistInfo.name }}</div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 p-2.5 gradient-bg text-white rounded-full transition-all">
            <Play theme="filled" size="18" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-xl text-secondary">
      歌手不存在
    </div>
  </div>
</template>
