<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '../stores';
import { getSongUrl, getLyric } from '../api';
import LyricPanel from './LyricPanel.vue';

const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const showQualityMenu = ref(false);
const qualities = [
  { label: '高音质 (320K)', value: 'exhigh' as const },
  { label: '无损 (FLAC)', value: 'lossless' as const },
  { label: 'HiRes', value: 'hires' as const },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const handleTimeUpdate = () => {
    if (audioRef.value) {
      playerStore.setCurrentTime(audioRef.value.currentTime);
      playerStore.checkAndRecordHistory(audioRef.value.currentTime);
    }
  };

const handleEnded = () => {
  if (playerStore.playMode === 'single') {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      audioRef.value.play();
    }
  } else {
    playerStore.next();
  }
};

const handleSeek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  if (audioRef.value && playerStore.duration) {
    audioRef.value.currentTime = percent * playerStore.duration;
  }
};

const downloadSong = async () => {
  if (!playerStore.currentSong) return;
  const quality = playerStore.quality;
  const isLossless = quality === 'lossless' || quality === 'hires';
  const format = isLossless ? 'flac' : 'mp3';
  const ext = isLossless ? 'flac' : 'mp3';
  const filename = `${playerStore.currentSong.artist} - ${playerStore.currentSong.name}.${ext}`;
  const downloadUrl = `/download?url=${encodeURIComponent(`https://kw-api.cenguigui.cn/?id=${playerStore.currentSong.rid}&type=song&level=${quality}&format=${format}`)}&filename=${encodeURIComponent(filename)}`;
  window.location.href = downloadUrl;
};

watch(() => playerStore.currentSong, async (song, oldSong) => {
  if (song) {
    // 判断是否切换到了新歌曲（基于 rid）
    const isSameSong = oldSong && oldSong.rid === song.rid;
    
    if (isSameSong) {
      // 同一首歌：恢复播放进度，不重新加载
      if (audioRef.value) {
        audioRef.value.currentTime = playerStore.currentTime;
        if (playerStore.isPlaying) {
          audioRef.value.play();
        }
      }
    } else {
      // 不同歌曲：重新加载
      if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value.currentTime = 0;
      }
      const { url } = await getSongUrl(song.rid, playerStore.quality, 'mp3');
      if (audioRef.value) {
        audioRef.value.src = url;
        audioRef.value.play();
      }
      
      const lyricData = await getLyric(song.rid, 'lineLyric');
      playerStore.setLyric(lyricData);
    }
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
    const { url } = await getSongUrl(playerStore.currentSong.rid, playerStore.quality, 'mp3');
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

const currentQualityLabel = computed(() => {
  return qualities.find(q => q.value === playerStore.quality)?.label || '高音质';
});

const playModeIcons: Record<string, string> = {
  order: '➡️',
  loop: '🔁',
  single: '🔂',
  shuffle: '🔀',
};

const playModeIcon = computed(() => playModeIcons[playerStore.playMode]);
</script>

<template>
  <div class="h-20 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center relative flex-shrink-0">
    <audio
      ref="audioRef"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @loadedmetadata="() => audioRef && playerStore.setDuration(audioRef.duration)"
    />
    
    <div class="flex items-center w-64 px-5">
      <img
        v-if="playerStore.currentSong"
        :src="playerStore.currentSong.pic"
        class="w-11 h-11 rounded object-cover shadow cursor-pointer"
        @click="playerStore.showLyric = !playerStore.showLyric"
      />
      <div v-else class="w-11 h-11 bg-[var(--color-bg-tertiary)] rounded" />
      <div class="ml-3 flex-1 min-w-0" v-if="playerStore.currentSong">
        <div class="text-sm font-medium truncate">{{ playerStore.currentSong.name }}</div>
        <div class="text-xs text-[var(--color-text-secondary)] truncate">{{ playerStore.currentSong.artist }}</div>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center">
      <div class="flex items-center gap-6 mb-1">
        <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors hidden md:block text-lg">🔀</button>
        <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-xl">⏮</button>
        <button
          class="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90 shadow transition-opacity"
          @click="playerStore.toggle()"
        >
          <span v-if="playerStore.isPlaying" class="text-lg">⏸</span>
          <span v-else class="text-lg">▶</span>
        </button>
        <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-xl">⏭</button>
        <button 
          class="text-[var(--color-primary)] hover:opacity-80 transition-colors text-lg select-none"
          :title="playerStore.getPlayModeLabel()"
          @click="playerStore.togglePlayMode()"
        ><span v-text="playModeIcon"></span></button>
      </div>
      
      <div class="w-full max-w-xl flex items-center gap-2">
        <span class="text-xs text-[var(--color-text-secondary)] w-10 text-right hidden sm:block">{{ formatTime(playerStore.currentTime) }}</span>
        <div
          class="flex-1 h-1 bg-[var(--color-bg-tertiary)] rounded-full cursor-pointer relative group"
          @click="handleSeek"
        >
          <div
            class="h-full bg-[var(--color-primary)] rounded-full relative"
            :style="{ width: playerStore.progress + '%' }"
          >
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-primary)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span class="text-xs text-[var(--color-text-secondary)] w-10 hidden sm:block">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-4 px-5 w-64 justify-end">
      <button
        class="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        @click="playerStore.showLyric = !playerStore.showLyric"
        title="歌词"
      >
        📝
      </button>
      
      <div class="hidden lg:flex items-center gap-3">
        <button
          class="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] border border-[var(--color-border)] rounded-full transition-colors relative"
          @click="showQualityMenu = !showQualityMenu"
        >
          {{ currentQualityLabel }}
          <div v-if="showQualityMenu" class="absolute bottom-full mb-2 right-0 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-xl p-2 min-w-32 z-50">
            <div
              v-for="q in qualities"
              :key="q.value"
              class="px-3 py-2 cursor-pointer hover:bg-[var(--color-bg-tertiary)] rounded text-sm whitespace-nowrap"
              :class="playerStore.quality === q.value ? 'text-[var(--color-primary)] font-medium' : ''"
              @click.stop="playerStore.setQuality(q.value); showQualityMenu = false"
            >
              {{ q.label }}
            </div>
          </div>
        </button>
        
        <button
          v-if="playerStore.currentSong"
          class="px-3 py-1 text-xs text-white bg-[var(--color-primary)] hover:opacity-90 rounded-full transition-opacity"
          @click="downloadSong"
        >
          ⬇️
        </button>
      </div>
    </div>

    <LyricPanel v-if="playerStore.showLyric" />
  </div>
</template>
