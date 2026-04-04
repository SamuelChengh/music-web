import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Song } from './player';

export interface HistoryItem extends Song {
  playedAt: number;
  playDuration: number;
}

const MAX_HISTORY_COUNT = 500;
const MIN_PLAY_DURATION = 10;

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([]);

  const totalCount = computed(() => history.value.length);

  const sortedHistory = computed(() => {
    return [...history.value].sort((a, b) => b.playedAt - a.playedAt);
  });

  const recentHistory = computed(() => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const now = Date.now();
    
    return {
      today: sortedHistory.value.filter(item => now - item.playedAt < oneDayMs),
      thisWeek: sortedHistory.value.filter(item => 
        now - item.playedAt >= oneDayMs && now - item.playedAt < oneWeekMs
      ),
      older: sortedHistory.value.filter(item => now - item.playedAt >= oneWeekMs)
    };
  });

  const saveToStorage = () => {
    try {
      localStorage.setItem('player-history', JSON.stringify(history.value));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('player-history');
      if (stored) {
        const data = JSON.parse(stored);
        history.value = data || [];
        
        if (history.value.length > MAX_HISTORY_COUNT) {
          history.value = history.value.slice(0, MAX_HISTORY_COUNT);
          saveToStorage();
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e);
      history.value = [];
    }
  };

  const shouldRecord = (playDuration: number): boolean => {
    return playDuration >= MIN_PLAY_DURATION;
  };

  const recordHistory = (song: Song, playDuration: number) => {
    if (!shouldRecord(playDuration)) {
      return false;
    }

    const existingIndex = history.value.findIndex(item => item.rid === song.rid);
    
    if (existingIndex !== -1) {
      history.value[existingIndex].playedAt = Date.now();
      history.value[existingIndex].playDuration = playDuration;
    } else {
      const newHistoryItem: HistoryItem = {
        ...song,
        playedAt: Date.now(),
        playDuration: playDuration
      };
      
      history.value.unshift(newHistoryItem);
      
      if (history.value.length > MAX_HISTORY_COUNT) {
        history.value = history.value.slice(0, MAX_HISTORY_COUNT);
      }
    }
    
    saveToStorage();
    return true;
  };

  const removeFromHistory = (rid: number) => {
    history.value = history.value.filter(item => item.rid !== rid);
    saveToStorage();
  };

  const clearHistory = () => {
    history.value = [];
    saveToStorage();
  };

  const isInHistory = (rid: number): boolean => {
    return history.value.some(item => item.rid === rid);
  };

  const getLastPlayedTime = (rid: number): number | null => {
    const item = history.value.find(item => item.rid === rid);
    return item ? item.playedAt : null;
  };

  const getPlayCount = (rid: number): number => {
    return history.value.filter(item => item.rid === rid).length;
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    history,
    totalCount,
    sortedHistory,
    recentHistory,
    shouldRecord,
    recordHistory,
    removeFromHistory,
    clearHistory,
    isInHistory,
    getLastPlayedTime,
    getPlayCount,
    init
  };
});