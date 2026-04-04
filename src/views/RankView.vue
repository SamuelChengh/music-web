<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getRankList, getRankTags } from '../api';
import { usePlayerStore, useFavoritesStore, useQueueStore } from '../stores';
import SongRowMobile from '../components/SongRowMobile.vue';
import LikeButton from '../components/LikeButton.vue';
import { useIsMobile } from '../composables/useIsMobile';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  info?: string;
}

const playerStore = usePlayerStore();
const favoritesStore = useFavoritesStore();
const queueStore = useQueueStore();
const { isMobile } = useIsMobile();
const rankTags = ref<{ name: string; pic: string }[]>([]);
const currentRank = ref('新歌榜');
const rankList = ref<Song[]>([]);
const loading = ref(false);

const allRanks = [
  '飙升榜', '新歌榜', '热歌榜', '短视频音乐排行榜', '万物DJ榜',
  '经典怀旧榜', '影视金曲榜', '网红新歌榜', '古风音乐榜',
  '热评榜', '翻唱榜', '极品电音榜', '华语榜', '粤语榜',
  '欧美榜', '韩语榜', '日语榜'
];

onMounted(async () => {
  try {
    const tags = await getRankTags();
    rankTags.value = tags;
  } catch (e) {
    console.error(e);
  }
});

const loadRank = async (rankName: string) => {
  loading.value = true;
  rankList.value = await getRankList(rankName, 1, 50);
  loading.value = false;
};

watch(currentRank, loadRank, { immediate: true });

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
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
      <div class="section-divider">
        <h1 class="text-xl md:text-2xl font-bold text-main">排行榜</h1>
      </div>
      
      <div class="tag-pill-bar">
        <button
          v-for="rank in allRanks"
          :key="rank"
          class="tag-pill"
          :class="currentRank === rank ? 'active' : ''"
          @click="currentRank = rank"
        >
          {{ rank }}
        </button>
      </div>
      
      <div v-if="loading" class="text-center py-xl text-secondary">
        加载中...
      </div>
      
      <div v-else class="flex flex-col">
        <!-- 移动端歌曲列表 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="(song, index) in rankList"
            :key="song.rid"
            :song="song"
            :rank="index + 1"
            :show-rank="true"
            :rank-class="getRankClass(index)"
            @play="playSong"
          />
        </div>
        
        <!-- PC端歌曲列表 -->
        <div class="hidden md:block">
          <div
            v-for="(song, index) in rankList"
            :key="song.rid"
            class="song-row-simple group"
            @click="playSong(song)"
          >
            <div class="rank-badge" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
            <img 
              :src="song.pic" 
              class="song-cover-simple"
              @error="handleImageError"
            />
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
    </div>
  </div>
</template>