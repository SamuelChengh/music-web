import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FavoriteSong } from '../types/favorites';
import type { Song } from './player';

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteSong[]>([]);

  const init = () => {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        favorites.value = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
      favorites.value = [];
    }
  };

  const addToFavorites = (song: Song) => {
    if (!isFavorite(song.rid)) {
      favorites.value.push({
        rid: song.rid,
        name: song.name,
        artist: song.artist,
        pic: song.pic,
        addedAt: Date.now()
      });
      saveToStorage();
    }
  };

  const removeFromFavorites = (rid: number) => {
    favorites.value = favorites.value.filter(s => s.rid !== rid);
    saveToStorage();
  };

  const isFavorite = (rid: number): boolean => {
    return favorites.value.some(s => s.rid === rid);
  };

  const saveToStorage = () => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  };

  const clearFavorites = () => {
    favorites.value = [];
    saveToStorage();
  };

  const importFavorites = (songs: FavoriteSong[]) => {
    favorites.value = songs;
    saveToStorage();
  };

  const exportFavorites = (): FavoriteSong[] => {
    return [...favorites.value];
  };

  const sortedFavorites = computed(() => {
    return [...favorites.value].sort((a, b) => b.addedAt - a.addedAt);
  });

  const totalCount = computed(() => favorites.value.length);

  return {
    favorites,
    sortedFavorites,
    totalCount,
    init,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    importFavorites,
    exportFavorites,
  };
});