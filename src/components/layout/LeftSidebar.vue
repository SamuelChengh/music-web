<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Home, ChartHistogram, People, Like, Videocamera, Broadcast, Music } from '@icon-park/vue-next';

const route = useRoute();

const menuGroups = [
  {
    title: '推荐',
    items: [
      { name: '发现音乐', path: '/', icon: Home },
      { name: '排行榜', path: '/rank', icon: ChartHistogram },
      { name: '歌手', path: '/artist', icon: People },
    ]
  },
  {
    title: '音乐馆',
    items: [
      { name: 'MV', path: '/mv', icon: Videocamera },
      { name: '电台', path: '/dj', icon: Broadcast },
    ]
  },
  {
    title: '我的音乐',
    items: [
      { name: '我喜欢', path: '/favorites', icon: Like },
    ]
  }
];

const isActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>

<template>
  <aside class="w-(--width-sidebar) h-full bg-sidebar flex flex-col">
    <div class="flex items-center h-14 px-sm">
      <Music theme="filled" size="22" class="text-primary mr-2" />
      <span class="text-xl text-main font-semibold px-sm">TheH音乐</span>
    </div>
    
    <nav class="flex-1 overflow-y-auto py-md">
      <div v-for="group in menuGroups" :key="group.title" class="mb-lg">
        <div class="text-xs text-secondary px-md mb-sm">{{ group.title }}</div>
        <div
          v-for="item in group.items"
          :key="item.path"
          class="menu-item"
          :class="{ 'active': isActive(item.path) }"
          @click="$router.push(item.path)"
        >
          <component :is="item.icon" theme="outline" size="18" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </nav>
    
    <div class="flex items-center justify-center p-md h-24">
      <div class="text-xs text-description text-center flex flex-col gap-1">
        <span>⚠️ 本项目仅供学习使用</span>
        <span>请支持正版音乐</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.menu-item:hover {
  color: var(--color-text-main);
}

.menu-item.active {
  background: linear-gradient(to right, rgba(52, 211, 153, 0.15), transparent);
  color: var(--color-active-text);
  font-weight: 500;
  position: relative;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 0.25rem;
  height: 1.25rem;
  background: var(--color-primary);
  border-radius: 0 0.125rem 0.125rem 0;
}
</style>
