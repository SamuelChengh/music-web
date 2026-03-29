<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Home, ChartHistogram, People, Like, Videocamera, Broadcast, Music } from '@icon-park/vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

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
  if (path === '/') return router.currentRoute.value.path === '/';
  return router.currentRoute.value.path.startsWith(path);
};

const handleNavigate = (path: string) => {
  router.push(path);
  emit('close');
};

const touchStartX = ref(0);
const touchDeltaX = ref(0);

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e: TouchEvent) => {
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value;
};

const handleTouchEnd = () => {
  if (touchDeltaX.value > 50) {
    emit('close');
  }
  touchDeltaX.value = 0;
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-0 right-0 bottom-[100px] left-0 z-50 flex">
      <div 
        class="absolute inset-0 bg-black/50"
        @click="emit('close')"
      />
      
      <div 
        class="relative h-full w-[35%] max-w-[280px] bg-sidebar flex flex-col shadow-xl transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(0)` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="flex items-center h-14 px-sm border-b border-default gap-2">
          <Music theme="filled" size="20" class="text-primary mr-2" />
          <span class="text-base text-primary font-semibold px-xs">TheH音乐</span>
        </div>
        
        <nav class="flex-1 overflow-y-auto py-sm">
          <div v-for="group in menuGroups" :key="group.title" class="mb-md">
            <div class="text-xs text-secondary px-md mb-xs">{{ group.title }}</div>
            <div
              v-for="item in group.items"
              :key="item.path"
              class="menu-item"
              :class="{ 'active': isActive(item.path) }"
              @click="handleNavigate(item.path)"
            >
              <component :is="item.icon" theme="outline" size="16" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </nav>
        
        <div class="flex items-center justify-center p-md border-t border-default">
          <div class="text-[10px] text-description text-center flex flex-col gap-1">
            <span>⚠️ 本项目仅供学习使用</span>
            <span>请支持正版音乐</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.menu-item:hover {
  color: var(--color-text-main);
}

.menu-item.active {
  background: linear-gradient(to right, var(--color-active-bg), transparent);
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
