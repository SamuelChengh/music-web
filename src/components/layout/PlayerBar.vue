<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePlayerStore } from '../../stores';
import { getSongUrl, getLyric } from '../../api';
import { 
  GoEnd, GoAhead, Play, Pause, Switch, Refresh, List, Text, Download
} from '@icon-park/vue-next';
import PlayerSlider from './PlayerSlider.vue';
import LyricPanel from '../LyricPanel.vue';

const playerStore = usePlayerStore();
const audioRef = ref<HTMLAudioElement | null>(null);

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

const downloadSong = async () => {
  if (!playerStore.currentSong) return;
  const filename = `${playerStore.currentSong.artist} - ${playerStore.currentSong.name}.mp3`;
  const downloadUrl = `/download?url=${encodeURIComponent(`https://kw-api.cenguigui.cn/?id=${playerStore.currentSong.rid}&type=song&level=${playerStore.quality}&format=mp3`)}&filename=${encodeURIComponent(filename)}`;
  window.location.href = downloadUrl;
};
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

    <div class="flex items-center gap-3 w-64 justify-end">
      <button
        class="text-secondary hover-text transition-default hidden lg:flex"
        @click="playerStore.showLyric = !playerStore.showLyric"
        title="歌词"
      >
        <Text theme="outline" size="18" />
      </button>
      
      <button
        class="text-secondary hover-text transition-default"
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
