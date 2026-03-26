<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';
import MobileSearch from './components/MobileSearch.vue';
import { Music, Moon, Sunny } from '@icon-park/vue-next';

const router = useRouter();
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
      
      <div class="md:hidden h-14 flex items-center px-md bg-view border-b border-default gap-sm">
        <div 
          class="flex items-center cursor-pointer"
          @click="router.push('/')"
        >
          <Music theme="filled" size="22" class="text-primary" />
        </div>
        
        <button 
          class="flex-1 flex items-center justify-center bg-tertiary rounded-full h-10 text-secondary px-md"
          @click="showMobileSearch = true"
        >
          <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span class="text-sm">搜索歌曲、歌手...</span>
        </button>
        
        <button
          class="w-10 h-10 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
          @click="themeStore.toggleMode()"
        >
          <Moon v-if="themeStore.mode === 'dark'" theme="filled" size="20" />
          <Sunny v-else theme="outline" size="20" />
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
    
    <MobileSearch v-if="showMobileSearch" @close="showMobileSearch = false" class="md:hidden" />
  </div>
</template>
