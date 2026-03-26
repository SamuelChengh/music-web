<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThemeStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';
import BottomNav from './components/layout/BottomNav.vue';
import MobileSearch from './components/MobileSearch.vue';

const themeStore = useThemeStore();
const showMobileSearch = ref(false);

onMounted(() => {
  themeStore.init();
});
</script>

<template>
  <div class="flex h-screen bg-view">
    <LeftSidebar class="hidden lg:flex" />
    
    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader class="hidden md:flex" />
      
      <div class="md:hidden h-14 flex items-center px-md bg-view border-b border-default">
        <button 
          class="flex-1 flex items-center justify-center bg-tertiary rounded-full h-10 text-secondary"
          @click="showMobileSearch = true"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>搜索歌曲、歌手...</span>
        </button>
      </div>
      
      <main class="flex-1 overflow-y-auto pb-player lg:pb-0">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
      
      <PlayerBar />
    </div>
    
    <PlayListDrawer class="hidden lg:block" />
    
    <BottomNav class="lg:hidden" />
    <MobileSearch v-if="showMobileSearch" @close="showMobileSearch = false" class="md:hidden" />
  </div>
</template>
