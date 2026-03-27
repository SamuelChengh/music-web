<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '../../stores';
import { getSongUrl, getLyric } from '../../api';
import { 
  Play, Pause, List, Text, Download, Close
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
  <audio
    ref="audioRef"
    @timeupdate="handleTimeUpdate"
    @ended="handleEnded"
    @loadedmetadata="() => audioRef && playerStore.setDuration(audioRef.duration)"
  />
  
  <div class="hidden lg:flex h-24 bg-main border-t border-default items-center px-md relative lg:h-player">
    
    <div class="flex items-center w-64 lg:w-64">
      <div 
        class="w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-default hover:opacity-80"
        :class="playerStore.currentSong ? 'lg:cursor-pointer' : ''"
        @click="playerStore.showLyric = !playerStore.showLyric"
      >
        <img
          v-if="playerStore.currentSong"
          :src="playerStore.currentSong.pic"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-tertiary" />
      </div>
      
      <div class="px-sm flex-1 min-w-0 hidden lg:block" v-if="playerStore.currentSong">
        <div class="text-sm text-main truncate">{{ playerStore.currentSong.name }}</div>
        <div class="text-xs text-secondary truncate">{{ playerStore.currentSong.artist }}</div>
      </div>
      <div v-else class="px-sm flex-1 hidden lg:block">
        <div class="text-sm text-secondary">暂无播放</div>
      </div>
    </div>

    <div class="flex-1 flex-col items-center max-w-2xl mx-auto hidden lg:flex">
      <div class="flex items-center gap-5 mb-2">
        <button class="text-secondary hover-text transition-default" @click="playerStore.prev()">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <button
          class="text-primary hover:text-primary-hover transition-default"
          @click="playerStore.toggle()"
        >
          <Pause v-if="playerStore.isPlaying" theme="filled" size="28" />
          <Play v-else theme="filled" size="28" />
        </button>
        
        <button class="text-secondary hover-text transition-default" @click="playerStore.next()">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>
      
      <div class="w-full flex items-center gap-3">
        <span class="text-xs text-secondary w-10 text-right">{{ formatTime(playerStore.currentTime) }}</span>
        <PlayerSlider class="flex-1" />
        <span class="text-xs text-secondary w-10">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-md w-64 justify-end hidden lg:flex" @click.self="showQualityMenu = !showQualityMenu">
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
              v-for="q in qualities"
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
  </div>
  
  <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-main border-t border-default z-50" style="height: calc(80px + env(safe-area-inset-bottom, 0));">
    <div class="h-[80px] flex flex-col justify-center px-md">
      <div class="h-[56px] grid grid-cols-3 items-center">
        <div class="flex items-center gap-sm justify-self-start" @click="playerStore.showLyric = !playerStore.showLyric">
          <img
            v-if="playerStore.currentSong"
            :src="playerStore.currentSong.pic"
            class="w-11 h-11 rounded-lg object-cover"
          />
          <div v-else class="w-11 h-11 bg-tertiary rounded-lg" />
          
          <div class="min-w-0 max-w-[20vw]" v-if="playerStore.currentSong">
            <div class="text-sm text-main truncate">{{ playerStore.currentSong.name }}</div>
            <div class="text-xs text-secondary truncate">{{ playerStore.currentSong.artist }}</div>
          </div>
        </div>
        
        <div class="flex items-center justify-center gap-5">
          <button class="text-secondary" @click="playerStore.prev()">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button
            class="text-primary hover:text-primary-hover transition-default"
            @click="playerStore.toggle()"
          >
            <Pause v-if="playerStore.isPlaying" theme="filled" size="28" />
            <Play v-else theme="filled" size="28" />
          </button>
          
          <button class="text-secondary" @click="playerStore.next()">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
        
        <div class="flex items-center justify-end gap-sm">
          <button
            class="text-xs px-2 py-1 rounded border border-default"
            :class="qualities.find(q => q.value === playerStore.quality)?.color"
            @touchstart="showQualityMenu = true"
          >
            {{ qualities.find(q => q.value === playerStore.quality)?.icon }}
          </button>
          <button
            class="text-secondary"
            @click="playerStore.showLyric = !playerStore.showLyric"
          >
            <Text theme="outline" size="22" />
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-3 items-center h-[24px]">
        <div></div>
        <div class="flex items-center gap-sm justify-center">
          <span class="text-xs text-secondary w-8 text-right flex-shrink-0">{{ formatTime(playerStore.currentTime) }}</span>
          <PlayerSlider class="flex-1 min-w-[80px]" />
          <span class="text-xs text-secondary w-8 flex-shrink-0">{{ formatTime(playerStore.duration) }}</span>
        </div>
        <div></div>
      </div>
    </div>
  </div>
  
  <Teleport to="body">
    <Transition name="slide-up">
      <div 
        v-if="showQualityMenu"
        class="fixed inset-0 z-[100] lg:hidden"
      >
        <div 
          class="absolute inset-0 bg-black/50"
          @click="showQualityMenu = false"
        />
        <div class="quality-panel absolute bottom-0 left-0 right-0 bg-view rounded-t-2xl safe-area-bottom">
          <div class="flex items-center justify-between p-md border-b border-default">
            <span class="text-base text-main font-medium">音质选择</span>
            <button 
              class="p-sm rounded-full hover:bg-tertiary text-secondary"
              @click="showQualityMenu = false"
            >
              <Close theme="outline" size="20" />
            </button>
          </div>
          <div class="p-md">
            <div
              v-for="q in qualities"
              :key="q.value"
              class="flex items-center gap-md p-md rounded-xl cursor-pointer transition-colors mb-sm"
              :class="playerStore.quality === q.value ? 'bg-active' : 'hover:bg-tertiary'"
              @click="selectQuality(q)"
            >
              <span :class="q.color" class="text-sm font-bold w-12">{{ q.icon }}</span>
              <div class="flex-1">
                <div class="text-main font-medium">{{ q.label }}</div>
                <div class="text-xs text-secondary">{{ q.bitrate }}</div>
              </div>
              <span v-if="playerStore.quality === q.value" class="text-primary">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  
  <LyricPanel v-if="playerStore.showLyric" />
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .quality-panel,
.slide-up-leave-to .quality-panel {
  transform: translateY(100%);
}

.quality-panel {
  transition: transform 0.3s ease;
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
