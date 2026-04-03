<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistInfo, getPlaylistSongs } from '../api';
import { usePlayerStore, useFavoritesStore } from '../stores';
import LikeButton from '../components/LikeButton.vue';
import { useIsMobile } from '../composables/useIsMobile';
import { Play } from '@icon-park/vue-next';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const route = useRoute();
const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const { isMobile } = useIsMobile();

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

const getRankClass = (index: number) => {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-md py-sm md:px-lg md:py-md">
      <div v-if="loading" class="text-center py-xl text-secondary">
        加载中...
      </div>

      <template v-else-if="playlistInfo">
        <div class="playlist-header-light">
          <img :src="playlistInfo.pic" class="playlist-cover-large" />
          <div class="flex-1 min-w-0">
            <h1 class="text-lg md:text-xl font-bold text-main mb-1 line-clamp-2">
              {{ playlistInfo.name }}
            </h1>
            <p class="text-xs md:text-sm text-secondary line-clamp-2">
              {{ playlistInfo.desc || '暂无描述' }}
            </p>
          </div>
        </div>

        <button class="play-all-btn-light" @click="playAll">
          <Play theme="filled" size="14" />
          播放全部
        </button>

        <div class="flex flex-col">
          <div
            v-for="(song, index) in songs"
            :key="song.rid"
            class="song-row-simple group"
            @click="playSong(song, index)"
          >
            <div class="rank-badge" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
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
      </template>

      <div v-else class="empty-state-simple">
        <div class="text-sm">歌单不存在</div>
      </div>
    </div>
  </div>
</template>