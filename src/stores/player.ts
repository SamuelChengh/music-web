import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  lrc?: string;
  url?: string;
  duration?: number;
}

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<Song | null>(null);
  const playlist = ref<Song[]>([]);
  const currentIndex = ref(-1);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const quality = ref<'exhigh' | 'lossless' | 'hires'>('exhigh');
  const showLyric = ref(false);
  const showPlaylist = ref(false);
  const lyric = ref<{ time: string; lineLyric: string }[]>([]);
  const currentLyricIndex = ref(0);

  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const setSong = (song: Song, autoPlay = true) => {
    currentSong.value = song;
    isPlaying.value = autoPlay;
    currentTime.value = 0;
    duration.value = song.duration || 0;
    
    if (!playlist.value.find(s => s.rid === song.rid)) {
      playlist.value.push(song);
      currentIndex.value = playlist.value.length - 1;
    } else {
      currentIndex.value = playlist.value.findIndex(s => s.rid === song.rid);
    }
  };

  const play = () => {
    isPlaying.value = true;
  };

  const pause = () => {
    isPlaying.value = false;
  };

  const toggle = () => {
    isPlaying.value = !isPlaying.value;
  };

  const setCurrentTime = (time: number) => {
    currentTime.value = time;
    updateCurrentLyricIndex(time);
  };

  const parseLyricTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\.?(\d*)/);
    if (match) {
      const minutes = parseInt(match[1]) || 0;
      const seconds = parseFloat(match[2] + '.' + (match[3] || '0'));
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const updateCurrentLyricIndex = (time: number) => {
    if (lyric.value.length === 0) {
      currentLyricIndex.value = 0;
      return;
    }
    for (let i = lyric.value.length - 1; i >= 0; i--) {
      const lyricTime = parseLyricTime(lyric.value[i].time);
      if (time >= lyricTime) {
        currentLyricIndex.value = i;
        return;
      }
    }
    currentLyricIndex.value = 0;
  };

  const setDuration = (dur: number) => {
    duration.value = dur;
  };

  const setVolume = (vol: number) => {
    volume.value = Math.max(0, Math.min(1, vol));
  };

  const setQuality = (q: 'exhigh' | 'lossless' | 'hires') => {
    quality.value = q;
  };

  const setLyric = (l: { time: string; lineLyric: string }[]) => {
    lyric.value = l;
  };

  const setCurrentLyricIndex = (index: number) => {
    currentLyricIndex.value = index;
  };

  const addToPlaylist = (song: Song) => {
    if (!playlist.value.find(s => s.rid === song.rid)) {
      playlist.value.push(song);
    }
  };

  const clearPlaylist = () => {
    playlist.value = [];
    currentIndex.value = -1;
    currentSong.value = null;
    isPlaying.value = false;
    showPlaylist.value = false;
  };

  const removeFromList = (index: number) => {
    playlist.value.splice(index, 1);
    if (index < currentIndex.value) {
      currentIndex.value--;
    } else if (index === currentIndex.value) {
      if (playlist.value.length > 0) {
        const newIndex = Math.min(index, playlist.value.length - 1);
        currentSong.value = playlist.value[newIndex];
        currentIndex.value = newIndex;
      } else {
        currentSong.value = null;
        currentIndex.value = -1;
        isPlaying.value = false;
      }
    }
  };

  const playAt = (index: number) => {
    if (index >= 0 && index < playlist.value.length) {
      currentIndex.value = index;
      currentSong.value = playlist.value[index];
      isPlaying.value = true;
      currentTime.value = 0;
    }
  };

  const prev = () => {
    if (playlist.value.length === 0) return;
    let newIndex = currentIndex.value - 1;
    if (newIndex < 0) newIndex = playlist.value.length - 1;
    playAt(newIndex);
  };

  const next = () => {
    if (playlist.value.length === 0) return;
    let newIndex = currentIndex.value + 1;
    if (newIndex >= playlist.value.length) newIndex = 0;
    playAt(newIndex);
  };

  const togglePlaylist = () => {
    showPlaylist.value = !showPlaylist.value;
  };

  return {
    currentSong,
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    quality,
    showLyric,
    showPlaylist,
    lyric,
    currentLyricIndex,
    progress,
    setSong,
    play,
    pause,
    toggle,
    setCurrentTime,
    setDuration,
    setVolume,
    setQuality,
    setLyric,
    setCurrentLyricIndex,
    addToPlaylist,
    clearPlaylist,
    removeFromList,
    playAt,
    prev,
    next,
    togglePlaylist,
  };
});