<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getRankList, getRankTags } from '../api';
import { usePlayerStore } from '../stores';
import { Play } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  info?: string;
}

const playerStore = usePlayerStore();
const rankTags = ref<{ name: string; pic: string }[]>([]);
const currentRank = ref('热歌榜');
const rankList = ref<Song[]>([]);
const loading = ref(false);

const allRanks = [
  '飙升榜', '新歌榜', '热歌榜', '短视频音乐排行榜', '万物DJ榜',
  '经典怀旧榜', '影视金曲榜', '会员畅听榜', '网红新歌榜', '古风音乐榜',
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

const playSong = (song: Song, index: number) => {
  playerStore.playSongList(rankList.value, index);
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-md py-sm md:px-lg md:py-md">
      <div class="flex items-center gap-md mb-sm">
        <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
        <h1 class="text-xl md:text-2xl font-bold text-main">排行榜</h1>
      </div>
      
      <div class="flex items-center gap-xs md:gap-sm mb-sm overflow-x-auto pb-2 md:pb-3 scrollbar-hide">
        <div
          v-for="rank in allRanks"
          :key="rank"
          class="flex-shrink-0 px-sm py-xs md:px-md md:py-sm rounded-lg cursor-pointer transition-all duration-200 text-base md:text-base whitespace-nowrap border border-transparent"
          :class="currentRank === rank 
            ? 'bg-primary text-white shadow-md border-primary' 
            : 'bg-tertiary/50 hover:bg-active hover:border-default text-secondary hover:text-main'"
          @click="currentRank = rank"
        >
          {{ rank }}
        </div>
      </div>

      <div v-if="loading" class="text-center py-xl text-secondary">
        加载中...
      </div>

      <div v-else class="flex flex-col">
        <div
          v-for="(song, index) in rankList"
          :key="song.rid"
          class="flex items-center gap-sm md:gap-md py-sm rounded-xl md:rounded-2xl hover:bg-active cursor-pointer group transition-all duration-200 mb-xs"
          @click="playSong(song, index)"
        >
          <div class="w-8 md:w-10 text-center font-bold text-lg md:text-xl" :class="index < 3 ? 'text-primary' : 'text-secondary'">
            {{ index + 1 }}
          </div>
          <img 
            :src="song.pic" 
            class="w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
            @error="handleImageError"
          />
          <div class="flex-1 min-w-0">
            <div class="text-lg md:text-lg font-medium text-main truncate group-hover:text-primary transition-colors">{{ song.name }}</div>
            <div class="text-sm md:text-sm text-secondary truncate mt-1">{{ song.artist }}</div>
          </div>
          <div v-if="song.info" class="text-sm text-secondary px-sm hidden lg:block max-w-xs truncate">
            {{ song.info }}
          </div>
          <el-tooltip content="播放" placement="top">
            <button class="opacity-0 group-hover:opacity-100 p-2 md:p-2.5 gradient-bg text-white rounded-full transition-all">
              <Play theme="filled" size="16" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
