<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylistInfo, getPlaylistSongs } from '../api';
import { usePlayerStore, useFavoritesStore, useQueueStore } from '../stores';
import SongRowMobile from '../components/SongRowMobile.vue';
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
const queueStore = useQueueStore();
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

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
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
        <div class="playlist-header-compact">
          <img :src="playlistInfo.pic" class="playlist-cover-compact" />
          <div class="playlist-info-side flex flex-col justify-between min-h-[100px]">
            <h1 class="playlist-name-compact line-clamp-2">
              {{ playlistInfo.name }}
            </h1>
            <button class="play-all-btn-compact" @click="playAll">
              <Play theme="outline" size="14" />
              <span>播放全部</span>
              <span class="song-count-badge">{{ songs.length }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="md:hidden">
            <SongRowMobile
              v-for="(song, index) in songs"
              :key="song.rid"
              :song="song"
              :rank="index + 1"
              :show-rank="true"
              :rank-class="getRankClass(index)"
              @play="playSong"
            />
          </div>
          
          <div class="hidden md:block">
            <div
              v-for="(song, index) in songs"
              :key="song.rid"
              class="song-row-simple group"
              @click="playSong(song)"
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
        </div>
      </template>

      <div v-else class="empty-state-simple">
        <div class="text-sm">歌单不存在</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-header-compact {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  margin-bottom: 20px;
}

.playlist-cover-compact {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.playlist-name-compact {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-main);
  line-height: 1.4;
  margin: 0;
}

.play-all-btn-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, rgba(var(--color-primary-rgb), 0.85) 100%);
  border-radius: 20px;
  border: none;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 12px rgba(var(--color-primary-rgb), 0.25);
}

.play-all-btn-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(var(--color-primary-rgb), 0.35);
}

.play-all-btn-compact:active {
  transform: translateY(0);
}

.song-count-badge {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 2px;
}

@media (max-width: 768px) {
  .playlist-header-compact {
    gap: 14px;
    padding: 14px 0;
    margin-bottom: 16px;
  }
  
  .playlist-cover-compact {
    width: 88px;
    height: 88px;
    border-radius: 10px;
  }
  
  .playlist-info-side {
    min-height: 88px;
  }
  
  .playlist-name-compact {
    font-size: 15px;
  }
  
  .play-all-btn-compact {
    padding: 6px 14px;
    font-size: 12px;
    gap: 5px;
  }
  
  .song-count-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

@media (max-width: 400px) {
  .playlist-cover-compact {
    width: 80px;
    height: 80px;
    border-radius: 8px;
  }
  
  .playlist-info-side {
    min-height: 80px;
  }
  
  .playlist-name-compact {
    font-size: 14px;
  }
}
</style>