import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Song } from './player';

export type Priority = 'normal' | 'high';

export interface PlaylistItem extends Song {
  priority: Priority;
  addedAt: number;
}

export const useQueueStore = defineStore('queue', () => {
  const playlist = ref<PlaylistItem[]>([]);
  const currentIndex = ref(-1);

  const currentSong = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < playlist.value.length) {
      return playlist.value[currentIndex.value];
    }
    return null;
  });

  const priorityQueue = computed(() => {
    return playlist.value.filter(item => item.priority === 'high');
  });

  const normalQueue = computed(() => {
    return playlist.value.filter(item => item.priority === 'normal');
  });

  const totalCount = computed(() => playlist.value.length);
  const priorityCount = computed(() => priorityQueue.value.length);

  const saveToStorage = () => {
    try {
      const data = {
        playlist: playlist.value,
        currentIndex: currentIndex.value
      };
      localStorage.setItem('player-queue', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save queue:', e);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('player-queue');
      if (stored) {
        const data = JSON.parse(stored);
        playlist.value = data.playlist || [];
        currentIndex.value = data.currentIndex || -1;
      }
    } catch (e) {
      console.error('Failed to load queue:', e);
      playlist.value = [];
      currentIndex.value = -1;
    }
  };

  const playNext = (song: Song) => {
    const existingIndex = playlist.value.findIndex(s => s.rid === song.rid);
    
    if (existingIndex !== -1) {
      playlist.value[existingIndex].priority = 'high';
      playlist.value[existingIndex].addedAt = Date.now();
    } else {
      const newItem: PlaylistItem = {
        ...song,
        priority: 'high',
        addedAt: Date.now()
      };
      
      const insertPosition = currentIndex.value + 1;
      playlist.value.splice(insertPosition, 0, newItem);
      
      if (currentIndex.value >= insertPosition) {
        currentIndex.value++;
      }
    }
    
    saveToStorage();
  };

  const addToQueue = (song: Song) => {
    if (!playlist.value.find(s => s.rid === song.rid)) {
      const newItem: PlaylistItem = {
        ...song,
        priority: 'normal',
        addedAt: Date.now()
      };
      playlist.value.push(newItem);
      saveToStorage();
    }
  };

  const addToQueueBatch = (songs: Song[], priority: Priority = 'normal') => {
    const newItems: PlaylistItem[] = songs
      .filter(song => !playlist.value.find(s => s.rid === song.rid))
      .map(song => ({
        ...song,
        priority,
        addedAt: Date.now()
      }));
    
    playlist.value.push(...newItems);
    saveToStorage();
  };

  const playSong = (song: Song) => {
    clearQueue();
    
    const newItem: PlaylistItem = {
      ...song,
      priority: 'normal',
      addedAt: Date.now()
    };
    
    playlist.value.push(newItem);
    currentIndex.value = 0;
    saveToStorage();
  };

  const playSongList = (songs: Song[], startIndex: number = 0) => {
    clearQueue();
    
    const newItems: PlaylistItem[] = songs.map(song => ({
      ...song,
      priority: 'normal',
      addedAt: Date.now()
    }));
    
    playlist.value = newItems;
    currentIndex.value = startIndex;
    saveToStorage();
  };

  const removeFromQueue = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return;
    
    playlist.value.splice(index, 1);
    
    if (index < currentIndex.value) {
      currentIndex.value--;
    } else if (index === currentIndex.value) {
      if (playlist.value.length > 0) {
        currentIndex.value = Math.min(index, playlist.value.length - 1);
      } else {
        currentIndex.value = -1;
      }
    }
    
    saveToStorage();
  };

  const clearQueue = () => {
    playlist.value = [];
    currentIndex.value = -1;
    saveToStorage();
  };

  const clearPriorityQueue = () => {
    playlist.value = playlist.value.filter(item => item.priority !== 'high');
    
    const removedCount = priorityQueue.value.length;
    if (removedCount > 0 && currentIndex.value >= playlist.value.length) {
      currentIndex.value = playlist.value.length - 1;
    }
    
    saveToStorage();
  };

  const getNextSong = () => {
    if (playlist.value.length === 0) return null;
    
    // 自动降级当前歌曲的优先级（如果它是高优先级）
    if (currentIndex.value >= 0 && currentIndex.value < playlist.value.length) {
      const currentSongItem = playlist.value[currentIndex.value];
      if (currentSongItem.priority === 'high') {
        currentSongItem.priority = 'normal';
        saveToStorage();
      }
    }
    
    const highPrioritySongs = playlist.value.filter(
      (item, index) => item.priority === 'high' && index !== currentIndex.value
    );
    
    if (highPrioritySongs.length > 0) {
      const nextHighPriority = playlist.value.findIndex(
        (item, index) => item.priority === 'high' && index > currentIndex.value
      );
      
      if (nextHighPriority !== -1) {
        return { song: playlist.value[nextHighPriority], index: nextHighPriority };
      }
      
      const firstHighPriority = playlist.value.findIndex(
        (item, index) => item.priority === 'high' && index !== currentIndex.value
      );
      
      if (firstHighPriority !== -1) {
        return { song: playlist.value[firstHighPriority], index: firstHighPriority };
      }
    }
    
    let nextIndex = currentIndex.value + 1;
    if (nextIndex >= playlist.value.length) {
      nextIndex = 0;
    }
    
    return { song: playlist.value[nextIndex], index: nextIndex };
  };

  const getPrevSong = () => {
    if (playlist.value.length === 0) return null;
    
    let prevIndex = currentIndex.value - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.value.length - 1;
    }
    
    return { song: playlist.value[prevIndex], index: prevIndex };
  };

  const setCurrentIndex = (index: number) => {
    if (index >= 0 && index < playlist.value.length) {
      currentIndex.value = index;
      saveToStorage();
    }
  };

  const downgradePriority = (index: number) => {
    if (index >= 0 && index < playlist.value.length) {
      playlist.value[index].priority = 'normal';
      saveToStorage();
    }
  };

  const upgradePriority = (index: number) => {
    if (index >= 0 && index < playlist.value.length) {
      playlist.value[index].priority = 'high';
      saveToStorage();
    }
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    playlist,
    currentIndex,
    currentSong,
    priorityQueue,
    normalQueue,
    totalCount,
    priorityCount,
    playNext,
    addToQueue,
    addToQueueBatch,
    playSong,
    playSongList,
    removeFromQueue,
    clearQueue,
    clearPriorityQueue,
    getNextSong,
    getPrevSong,
    setCurrentIndex,
    downgradePriority,
    upgradePriority,
    init
  };
});