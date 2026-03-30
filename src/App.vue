<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';
import MobileSidebar from './components/MobileSidebar.vue';
import { Music, Moon, Sunny, TShirt, Search, Home } from '@icon-park/vue-next';

const router = useRouter();
const themeStore = useThemeStore();
const showMobileSidebar = ref(false);
const showMobileThemeMenu = ref(false);
const searchKeyword = ref('');

const themeColors = [
  { value: 'green', hex: '#00A878' },
  { value: 'blue', hex: '#00838F' },
  { value: 'purple', hex: '#F5D547' },
  { value: 'red', hex: '#FF6B35' },
  { value: 'pink', hex: '#9B2D6E' },
  { value: 'orange', hex: '#CF3434' },
  { value: 'cyan', hex: '#00BCD4' },
  { value: 'brown', hex: '#795548' },
];

const goToSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value } });
  }
};

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
          class="w-9 h-9 rounded-full hover:bg-tertiary text-primary flex items-center justify-center transition-default"
          @click="router.push('/')"
          title="首页"
        >
          <Home theme="outline" size="20" />
        </button>
        
        <div class="flex-1 flex items-center bg-tertiary rounded-full h-10 px-md">
          <Search class="text-secondary shrink-0" theme="outline" size="16" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索歌曲、歌手..."
            class="flex-1 h-10 bg-transparent text-sm text-main placeholder-secondary focus:outline-none ml-2"
            @keyup.enter="goToSearch"
          />
        </div>
        
        <button
          class="w-9 h-9 rounded-full hover:bg-tertiary text-primary flex items-center justify-center transition-default"
          @click="themeStore.toggleMode()"
        >
          <Moon v-if="themeStore.mode === 'dark'" theme="filled" size="18" />
          <Sunny v-else theme="outline" size="18" />
        </button>
        
        <div class="relative">
          <button
            class="w-9 h-9 rounded-full hover:bg-tertiary text-primary flex items-center justify-center transition-default"
            @click="showMobileThemeMenu = !showMobileThemeMenu"
          >
            <TShirt theme="outline" size="18" />
          </button>
          
          <Transition name="dropdown">
            <div v-if="showMobileThemeMenu" class="fixed inset-0 z-40" @click="showMobileThemeMenu = false"></div>
          </Transition>
          <Transition name="dropdown">
            <div
              v-if="showMobileThemeMenu"
              class="absolute right-0 top-full mt-2 w-36 bg-view border border-default rounded-xl shadow-lg p-md z-50"
            >
              <div class="grid grid-cols-4 gap-2">
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
    
    <MobileSidebar v-if="showMobileSidebar" @close="showMobileSidebar = false" class="md:hidden" />
  </div>
</template>
