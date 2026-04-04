import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useQueueStore } from './queue';
import { useHistoryStore } from './history';

export interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
  lrc?: string;
  url?: string;
  duration?: number;
}

export type PlayMode = 'order' | 'loop' | 'single' | 'shuffle';

const playModeLabels: Record<PlayMode, string> = {
  order: '顺序播放',
  loop: '列表循环',
  single: '单曲循环',
  shuffle: '随机播放',
};

export const usePlayerStore = defineStore('player', () => {
  const queueStore = useQueueStore();
  const historyStore = useHistoryStore();

  const currentSong = ref<Song | null>(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const quality = ref<'exhigh' | 'lossless' | 'hires' | 'standard'>('exhigh');
  const showLyric = ref(false);
  const showPlaylist = ref(false);
  const lyric = ref<{ time: string; lineLyric: string }[]>([]);
  const currentLyricIndex = ref(0);
  const playMode = ref<PlayMode>('order');
  const shuffledIndices = ref<number[]>([]);
  const shuffleIndex = ref(-1);

  const historyRecordedForSong = ref<number>(0);

  const playlist = computed(() => queueStore.playlist);
  const currentIndex = computed(() => queueStore.currentIndex);

  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const setSong = (song: Song, autoPlay = true) => {
    const isSameSong = currentSong.value && currentSong.value.rid === song.rid;

    currentSong.value = song;
    isPlaying.value = autoPlay;

    if (!isSameSong) {
      currentTime.value = 0;
      duration.value = song.duration || 0;
    }

    if (!queueStore.playlist.find(s => s.rid === song.rid)) {
      queueStore.addToQueue(song);
      const index = queueStore.playlist.findIndex(s => s.rid === song.rid);
      queueStore.setCurrentIndex(index);
    } else {
      const index = queueStore.playlist.findIndex(s => s.rid === song.rid);
      queueStore.setCurrentIndex(index);
    }
  };

  const playSongList = (songs: Song[], startIndex = 0) => {
    queueStore.playSongList(songs, startIndex);

    const targetSong = songs[startIndex];
    const isSameSong = currentSong.value && currentSong.value.rid === targetSong.rid;

    currentSong.value = targetSong;
    isPlaying.value = true;

    if (!isSameSong) {
      currentTime.value = 0;
      duration.value = targetSong.duration || 0;
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

  const setQuality = (q: 'exhigh' | 'lossless' | 'hires' | 'standard') => {
    quality.value = q;
    localStorage.setItem('player-quality', q);
  };

  const setLyric = (l: { time: string; lineLyric: string }[]) => {
    lyric.value = l;
  };

  const setCurrentLyricIndex = (index: number) => {
    currentLyricIndex.value = index;
  };

  const addToPlaylist = (song: Song) => {
    queueStore.addToQueue(song);
  };

  const clearPlaylist = () => {
    queueStore.clearQueue();
    currentSong.value = null;
    isPlaying.value = false;
    showPlaylist.value = false;
    currentTime.value = 0;
    duration.value = 0;
  };

  const removeFromList = (index: number) => {
    queueStore.removeFromQueue(index);

    if (index === queueStore.currentIndex) {
      if (queueStore.playlist.length > 0) {
        currentSong.value = queueStore.currentSong;
      } else {
        currentSong.value = null;
        isPlaying.value = false;
      }
    }
  };

  const playAt = (index: number) => {
    if (index >= 0 && index < queueStore.playlist.length) {
      const targetSong = queueStore.playlist[index];
      const isSameSong = currentSong.value && currentSong.value.rid === targetSong.rid;

      queueStore.setCurrentIndex(index);
      currentSong.value = targetSong;
      isPlaying.value = true;

      if (!isSameSong) {
        currentTime.value = 0;
        duration.value = targetSong.duration || 0;
      }
    }
  };

  const prev = () => {
    if (queueStore.playlist.length === 0) return;

    const prevResult = queueStore.getPrevSong();
    if (prevResult) {
      playAt(prevResult.index);
    }
  };

  const shufflePlaylist = () => {
    const indices = queueStore.playlist.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    shuffledIndices.value = indices;
    shuffleIndex.value = 0;
  };

  const next = () => {
    if (queueStore.playlist.length === 0) return;

    if (playMode.value === 'shuffle') {
      shuffleIndex.value++;
      if (shuffleIndex.value >= shuffledIndices.value.length) {
        shufflePlaylist();
      }
      playAt(shuffledIndices.value[shuffleIndex.value]);
      return;
    }

    const nextResult = queueStore.getNextSong();
    if (nextResult) {
      if (playMode.value === 'loop' || queueStore.currentIndex < queueStore.playlist.length - 1) {
        playAt(nextResult.index);
      } else {
        isPlaying.value = false;
      }
    }
  };

  const togglePlaylist = () => {
    showPlaylist.value = !showPlaylist.value;
  };

  const togglePlayMode = () => {
    const modes: PlayMode[] = ['order', 'loop', 'single', 'shuffle'];
    const currentIdx = modes.indexOf(playMode.value);
    const nextIdx = (currentIdx + 1) % modes.length;
    playMode.value = modes[nextIdx];

    localStorage.setItem('player-playMode', playMode.value);

    if (playMode.value === 'shuffle') {
      shufflePlaylist();
    }
  };

  const getPlayModeLabel = () => {
    return playModeLabels[playMode.value];
  };

  const MIN_HISTORY_DURATION = 10;

  const checkAndRecordHistory = (currentTime: number) => {
    if (currentSong.value && 
        currentTime >= MIN_HISTORY_DURATION && 
        historyRecordedForSong.value !== currentSong.value.rid) {
      historyStore.recordHistory(currentSong.value, currentTime);
      historyRecordedForSong.value = currentSong.value.rid;
    }
  };

  watch(currentSong, (newSong) => {
    if (newSong) {
      historyRecordedForSong.value = 0;
    }
  });

  const init = () => {
    const savedPlayMode = localStorage.getItem('player-playMode') as PlayMode;
    if (savedPlayMode && ['order', 'loop', 'single', 'shuffle'].includes(savedPlayMode)) {
      playMode.value = savedPlayMode;
    }

    const savedQuality = localStorage.getItem('player-quality') as 'exhigh' | 'lossless' | 'hires' | 'standard';
    if (savedQuality && ['exhigh', 'lossless', 'hires', 'standard'].includes(savedQuality)) {
      quality.value = savedQuality;
    }

    queueStore.init();
    historyStore.init();

    if (queueStore.currentSong) {
      currentSong.value = queueStore.currentSong;
      duration.value = queueStore.currentSong.duration || 0;
    }
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
    playMode,
    setSong,
    playSongList,
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
    togglePlayMode,
    getPlayModeLabel,
    checkAndRecordHistory,
    init,
  };
});