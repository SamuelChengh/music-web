<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistInfo, getPlaylistSongs } from '../api';
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

const playlistInfo = ref<any>(null);
const songs = ref<Song[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    playlistInfo.value = await getPlaylistInfo(id);
    songs.value = await getPlaylistSongs(id);
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

onMounted(loadData);

watch(() => route.params.id, loadData);

const playSong = (song: Song) => {
  playerStore.setSong(song);
};

const playAll = () => {
  if (songs.value.length > 0) {
    playerStore.setSong(songs.value[0]);
  }
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view px-lg py-md">
    <div v-if="loading" class="text-center py-xl text-secondary">
      加载中...
    </div>

    <template v-else-if="playlistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-stretch gap-lg mb-md">
        <img :src="playlistInfo.pic" class="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shadow-lg flex-shrink-0" />
        <div class="text-center sm:text-left flex-1 flex flex-col justify-between">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-main mb-sm">{{ playlistInfo.name }}</h1>
            <p class="text-sm text-secondary mb-md">{{ playlistInfo.desc || '暂无描述' }}</p>
          </div>
          <div class="flex justify-center sm:justify-start">
            <button 
              class="px-lg py-sm gradient-bg text-white rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
              @click="playAll"
            >
              <Play theme="filled" size="16" />
              播放全部
            </button>
          </div>
        </div>
      </div>

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
            <div class="text-sm text-secondary truncate mt-1">{{ song.artist }}</div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 p-2.5 gradient-bg text-white rounded-full transition-all">
            <Play theme="filled" size="18" />
          </button>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-xl text-secondary">
      歌单不存在
    </div>
  </div>
</template>
