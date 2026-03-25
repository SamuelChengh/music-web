<script setup lang="ts">
import { onMounted } from 'vue';
import { useThemeStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.init();
});
</script>

<template>
  <div class="flex h-screen bg-view">
    <LeftSidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader />
      
      <main class="flex-1 overflow-hidden">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
      
      <PlayerBar />
    </div>
    
    <PlayListDrawer />
  </div>
</template>
