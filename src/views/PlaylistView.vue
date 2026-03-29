<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistInfo, getPlaylistSongs } from '../api';
import { usePlayerStore } from '../stores';
import { Play } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

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

const playSong = (song: Song, index: number) => {
  playerStore.playSongList(songs.value, index);
};

const playAll = () => {
  if (songs.value.length > 0) {
    playerStore.playSongList(songs.value, 0);
  }
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view px-md py-sm md:px-lg md:py-md">
    <div v-if="loading" class="text-center py-xl text-secondary">
      加载中...
    </div>

    <template v-else-if="playlistInfo">
      <div class="flex flex-col sm:flex-row items-center sm:items-stretch gap-md md:gap-lg mb-sm md:mb-md">
        <img :src="playlistInfo.pic" class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-lg flex-shrink-0" />
        <div class="text-center sm:text-left flex-1 flex flex-col justify-between">
          <div>
            <h1 class="text-xl md:text-xl font-bold text-main mb-sm">{{ playlistInfo.name }}</h1>
            <p class="text-sm md:text-sm text-secondary mb-md">{{ playlistInfo.desc || '暂无描述' }}</p>
          </div>
          <div class="flex justify-center sm:justify-start">
            <button 
              class="px-md py-sm md:px-lg gradient-bg text-white rounded-full text-sm md:text-base font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
              @click="playAll"
            >
              <Play theme="filled" size="14" />
              播放全部
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <div
          v-for="(song, index) in songs"
          :key="song.rid"
          class="flex items-center gap-sm md:gap-md py-sm rounded-xl md:rounded-2xl hover:bg-active cursor-pointer group transition-all duration-200 mb-xs"
          @click="playSong(song, index)"
        >
          <div class="w-8 md:w-10 text-center font-bold text-lg md:text-xl" :class="index < 3 ? 'text-primary' : 'text-secondary'">
            {{ index + 1 }}
          </div>
          <img :src="song.pic" class="w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <div class="flex-1 min-w-0">
            <div class="text-lg md:text-lg font-medium text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
            <div class="text-sm md:text-sm text-secondary truncate mt-1">{{ song.artist }}</div>
          </div>
          <el-tooltip content="播放" placement="top">
            <button class="opacity-0 group-hover:opacity-100 p-2 md:p-2.5 gradient-bg text-white rounded-full transition-all">
              <Play theme="filled" size="16" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-xl text-secondary">
      歌单不存在
    </div>
  </div>
</template>
