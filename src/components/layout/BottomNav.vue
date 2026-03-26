<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, Search, Like } from '@icon-park/vue-next';

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  if (route.path === '/') return 'home';
  if (route.path === '/search') return 'search';
  if (route.path === '/favorites') return 'favorites';
  return 'home';
});

const navItems = [
  { id: 'home', name: '首页', icon: Home, path: '/' },
  { id: 'search', name: '搜索', icon: Search, path: '/search' },
  { id: 'favorites', name: '收藏', icon: Like, path: '/favorites' },
];

const navigate = (item: typeof navItems[0]) => {
  router.push(item.path);
};
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 h-bottom-nav bg-view border-t border-default flex items-center justify-around z-40 safe-area-bottom">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="flex flex-col items-center gap-1 py-sm px-lg transition-colors"
      :class="activeTab === item.id ? 'text-primary' : 'text-secondary'"
      @click="navigate(item)"
    >
      <component :is="item.icon" :theme="activeTab === item.id ? 'filled' : 'outline'" size="22" />
      <span class="text-xs">{{ item.name }}</span>
    </button>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>