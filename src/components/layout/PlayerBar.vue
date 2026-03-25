<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../../stores';
import { getSongUrl, getLyric } from '../../api';
import { 
  GoEnd, GoAhead, Play, Pause, Switch, Refresh, List, Text, Download
} from '@icon-park/vue-next';
import PlayerSlider from './PlayerSlider.vue';
import LyricPanel from '../LyricPanel.vue';

const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const showQualityMenu = ref(false);
const qualityMenuRef = ref<HTMLElement | null>(null);

const qualities = [
  { label: '标准', value: 'standard' as const, bitrate: '128K', icon: '128', color: 'text-gray-400' },
  { label: '高音质', value: 'exhigh' as const, bitrate: '320K', icon: 'HQ', color: 'text-blue-400' },
  { label: '无损', value: 'lossless' as const, bitrate: 'FLAC', icon: 'SQ', color: 'text-yellow-500' },
  { label: 'HiRes', value: 'hires' as const, bitrate: 'FLAC', icon: 'Hi-Res', color: 'text-purple-400' },
];

const currentQualityLabel = computed(() => {
  return qualities.find(q => q.value === playerStore.quality)?.label || '高音质';
});

const closeQualityMenu = (e: MouseEvent) => {
  if (qualityMenuRef.value && !qualityMenuRef.value.contains(e.target as Node)) {
    showQualityMenu.value = false;
  }
};

const selectQuality = (q: typeof qualities[0]) => {
  playerStore.setQuality(q.value);
  showQualityMenu.value = false;
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const handleTimeUpdate = () => {
  if (audioRef.value) {
    playerStore.setCurrentTime(audioRef.value.currentTime);
  }
};

const handleEnded = () => {
  playerStore.pause();
};

watch(() => playerStore.currentSong, async (song) => {
  if (song) {
    const { url } = await getSongUrl(song.rid, playerStore.quality);
    if (audioRef.value) {
      audioRef.value.src = url;
      audioRef.value.play();
    }
    
    const lyricData = await getLyric(song.rid, 'lineLyric');
    playerStore.setLyric(lyricData);
  }
}, { immediate: true });

watch(() => playerStore.isPlaying, (playing) => {
  if (audioRef.value) {
    if (playing) {
      audioRef.value.play();
    } else {
      audioRef.value.pause();
    }
  }
});

watch(() => playerStore.quality, async () => {
  if (playerStore.currentSong) {
    const { url } = await getSongUrl(playerStore.currentSong.rid, playerStore.quality);
    if (audioRef.value) {
      const currentTime = audioRef.value.currentTime;
      audioRef.value.src = url;
      audioRef.value.currentTime = currentTime;
      if (playerStore.isPlaying) {
        audioRef.value.play();
      }
    }
  }
});

const downloadSong = async () => {
  if (!playerStore.currentSong) return;
  const filename = `${playerStore.currentSong.artist} - ${playerStore.currentSong.name}.mp3`;
  const downloadUrl = `/download?url=${encodeURIComponent(`https://kw-api.cenguigui.cn/?id=${playerStore.currentSong.rid}&type=song&level=${playerStore.quality}&format=mp3`)}&filename=${encodeURIComponent(filename)}`;
  window.location.href = downloadUrl;
};

onMounted(() => {
  document.addEventListener('click', closeQualityMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeQualityMenu);
});
</script>

<template>
  <div class="h-24 bg-main border-t border-default flex items-center px-md relative">
    <audio
      ref="audioRef"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @loadedmetadata="() => audioRef && playerStore.setDuration(audioRef.duration)"
    />
    
    <div class="flex items-center w-64">
      <div 
        class="w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-default hover:opacity-80"
        @click="playerStore.showLyric = !playerStore.showLyric"
      >
        <img
          v-if="playerStore.currentSong"
          :src="playerStore.currentSong.pic"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-tertiary" />
      </div>
      
      <div class="px-sm flex-1 min-w-0" v-if="playerStore.currentSong">
        <div class="text-sm text-main truncate">{{ playerStore.currentSong.name }}</div>
        <div class="text-xs text-secondary truncate">{{ playerStore.currentSong.artist }}</div>
      </div>
      <div v-else class="px-sm flex-1">
        <div class="text-sm text-secondary">暂无播放</div>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center max-w-2xl mx-auto">
      <div class="flex items-center gap-5 mb-2">
        <button class="text-secondary hover-text transition-default hidden lg:block">
          <Switch theme="outline" size="20" />
        </button>
        
        <button class="text-secondary hover-text transition-default" @click="playerStore.prev()">
          <GoEnd theme="outline" size="22" />
        </button>
        
        <button
          class="text-primary hover:text-primary-hover transition-default"
          @click="playerStore.toggle()"
        >
          <Pause v-if="playerStore.isPlaying" theme="filled" size="28" />
          <Play v-else theme="filled" size="28" />
        </button>
        
        <button class="text-secondary hover-text transition-default" @click="playerStore.next()">
          <GoAhead theme="outline" size="22" />
        </button>
        
        <button class="text-secondary hover-text transition-default hidden lg:block">
          <Refresh theme="outline" size="20" />
        </button>
      </div>
      
      <div class="w-full flex items-center gap-3">
        <span class="text-xs text-secondary w-10 text-right">{{ formatTime(playerStore.currentTime) }}</span>
        <PlayerSlider class="flex-1" />
        <span class="text-xs text-secondary w-10">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-md w-64 justify-end" @click.self="showQualityMenu = !showQualityMenu">
      <div class="relative" ref="qualityMenuRef">
        <button
          class="text-xs px-sm py-1.5 rounded-full border border-default text-secondary hover:text-primary hover:border-primary transition-colors flex items-center gap-1.5"
          @click="showQualityMenu = !showQualityMenu"
        >
          <span :class="qualities.find(q => q.value === playerStore.quality)?.color" class="text-[10px] font-bold">
            {{ qualities.find(q => q.value === playerStore.quality)?.icon }}
          </span>
          {{ currentQualityLabel }}
        </button>
        <Transition name="fade-scale">
          <div v-if="showQualityMenu" class="absolute bottom-full mb-2 right-0 bg-view border border-default rounded-xl shadow-xl p-2 px-sm py-sm min-w-quality-menu min-h-quality-menu z-50">
            <div class="text-xs text-secondary px-3 py-2 font-bold mb-sm">音质选择</div>
            <div
              v-for="(q, index) in qualities"
              :key="q.value"
              class="flex items-center gap-3 px-3 py-4 cursor-pointer hover:bg-tertiary rounded-lg transition-colors group mb-sm"
              :class="{ 'bg-tertiary/50': playerStore.quality === q.value }"
              @click="selectQuality(q)"
            >
              <span :class="q.color" class="text-xs font-bold min-w-[40px]">{{ q.icon }}</span>
              <span class="flex-1 text-sm font-bold" :class="playerStore.quality === q.value ? 'text-primary' : 'text-secondary group-hover:text-main'">
                {{ q.label }}
              </span>
              <span class="text-xs text-tertiary">{{ q.bitrate }}</span>
              <span v-if="playerStore.quality === q.value" class="text-primary">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
            </div>
          </div>
        </Transition>
      </div>
      
      <button
        class="hover-text transition-default"
        :class="playerStore.showLyric ? 'text-primary' : 'text-secondary'"
        @click="playerStore.showLyric = !playerStore.showLyric"
        title="歌词"
      >
        <Text theme="outline" size="18" />
      </button>
      
      <button
        class="hover-text transition-default"
        :class="playerStore.showPlaylist ? 'text-primary' : 'text-secondary'"
        @click="playerStore.togglePlaylist"
        title="播放列表"
      >
        <List theme="outline" size="18" />
      </button>
      
      <button
        v-if="playerStore.currentSong"
        class="text-secondary hover-text transition-default"
        @click="downloadSong"
        title="下载"
      >
        <Download theme="outline" size="18" />
      </button>
    </div>
    
    <LyricPanel v-if="playerStore.showLyric" />
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
