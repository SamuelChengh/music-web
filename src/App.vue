<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThemeStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';
import MobileSearch from './components/MobileSearch.vue';
import MobileSidebar from './components/MobileSidebar.vue';
import { Music, Moon, Sunny, Setting } from '@icon-park/vue-next';

const themeStore = useThemeStore();
const showMobileSearch = ref(false);
const showMobileSidebar = ref(false);
const showMobileThemeMenu = ref(false);

const themeColors = [
  { value: 'green', hex: '#34d399' },
  { value: 'blue', hex: '#3b82f6' },
  { value: 'purple', hex: '#8b5cf6' },
  { value: 'red', hex: '#ef4444' },
  { value: 'pink', hex: '#ec4899' },
  { value: 'orange', hex: '#f97316' },
];

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
          @click="showMobileSidebar = true"
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
          class="w-9 h-9 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
          @click="themeStore.toggleMode()"
        >
          <Moon v-if="themeStore.mode === 'dark'" theme="filled" size="18" />
          <Sunny v-else theme="outline" size="18" />
        </button>
        
        <div class="relative">
          <button
            class="w-9 h-9 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
            @click="showMobileThemeMenu = !showMobileThemeMenu"
          >
            <Setting theme="outline" size="18" />
          </button>
          
          <Transition name="dropdown">
            <div v-if="showMobileThemeMenu" class="fixed inset-0 z-40" @click="showMobileThemeMenu = false"></div>
          </Transition>
          <Transition name="dropdown">
            <div
              v-if="showMobileThemeMenu"
              class="absolute right-0 top-full mt-2 w-36 bg-view border border-default rounded-xl shadow-lg p-md z-50"
            >
              <div class="flex flex-wrap gap-sm">
                <button 
                  v-for="c in themeColors" 
                  :key="c.value"
                  class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  :style="{ backgroundColor: c.hex }"
                  :class="themeStore.color === c.value ? 'border-main scale-110' : 'border-transparent'"
                  @click="themeStore.setColor(c.value as any)"
                />
              </div>
            </div>
          </Transition>
        </div>
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
    
    <MobileSidebar v-if="showMobileSidebar" @close="showMobileSidebar = false" class="md:hidden" />
  </div>
</template>
