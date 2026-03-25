<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistInfo, getPlaylistSongs } from '../api';
import { usePlayerStore } from '../stores';
import { Play, Like, ShareOne, Download } from '@icon-park/vue-next';

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

onMounted(async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    playlistInfo.value = await getPlaylistInfo(id);
    songs.value = await getPlaylistSongs(id);
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
});

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
  <div class="h-full overflow-y-auto bg-view">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-secondary">加载中...</div>
    </div>
    
    <template v-else-if="playlistInfo">
      <div class="relative">
        <div class="h-64 bg-gradient-to-b from-primary/20 to-transparent" />
        
        <div class="px-lg -mt-32 relative flex gap-lg">
          <div class="w-52 h-52 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
            <img 
              :src="playlistInfo.pic" 
              class="w-full h-full object-cover"
            />
          </div>
          
          <div class="flex-1 pt-md">
            <div class="flex items-center gap-md mb-md">
              <div class="w-1 h-6 gradient-bg rounded-full"></div>
              <h1 class="text-2xl font-bold text-main">{{ playlistInfo.name }}</h1>
            </div>
            
            <div class="text-secondary mb-md">{{ playlistInfo.desc || '暂无描述' }}</div>
            
            <div class="flex gap-md">
              <button 
                class="px-lg py-sm gradient-bg text-white rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-sm"
                @click="playAll"
              >
                <Play theme="filled" size="18" />
                播放全部
              </button>
              <button class="p-2.5 rounded-full bg-tertiary text-secondary hover:text-primary transition-colors">
                <Like theme="outline" size="20" />
              </button>
              <button class="p-2.5 rounded-full bg-tertiary text-secondary hover:text-primary transition-colors">
                <ShareOne theme="outline" size="20" />
              </button>
              <button class="p-2.5 rounded-full bg-tertiary text-secondary hover:text-primary transition-colors">
                <Download theme="outline" size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-8 py-6">
        <div class="text-lg font-semibold text-main mb-4">歌曲列表 ({{ songs.length }})</div>
        
        <div class="space-y-1">
          <div
            v-for="(song, index) in songs"
            :key="song.rid"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-tertiary cursor-pointer group transition-colors"
            @click="playSong(song)"
          >
            <div class="w-8 text-center text-secondary">{{ index + 1 }}</div>
            <img :src="song.pic" class="w-12 h-12 rounded-lg object-cover" />
            <div class="flex-1 min-w-0">
              <div class="text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
              <div class="text-sm text-secondary truncate">{{ song.artist }}</div>
            </div>
            <button class="opacity-0 group-hover:opacity-100 p-2 gradient-bg text-white rounded-full transition-all">
              <Play theme="filled" size="14" />
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="flex items-center justify-center h-64 text-secondary">
      歌单不存在
    </div>
  </div>
</template>
