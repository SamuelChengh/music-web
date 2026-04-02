<script setup lang="ts">
import { ref, computed } from 'vue';
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
const isDragging = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
  isDragging.value = true;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value;
};

const handleTouchEnd = () => {
  if (touchDeltaX.value > 60) {
    emit('close');
  }
  touchDeltaX.value = 0;
  isDragging.value = false;
};

const drawerStyle = computed(() => ({
  transform: `translateX(${Math.max(0, -touchDeltaX.value * 0.3)}px)`
}));
</script>

<template>
  <Teleport to="body">
    <div class="sidebar-container">
      <Transition name="fade">
        <div 
          class="sidebar-overlay"
          @click="emit('close')"
        />
      </Transition>
      
      <Transition name="slide-right">
        <div 
          class="sidebar-drawer"
          :style="drawerStyle"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div class="drawer-header">
            <div class="logo-container">
              <div class="logo-icon">
                <Music theme="filled" size="22" class="logo-music" />
              </div>
              <span class="logo-text">TheH音乐</span>
            </div>
            <div class="header-decoration">
              <div class="glow-dot"></div>
              <div class="glow-dot"></div>
              <div class="glow-dot"></div>
            </div>
          </div>
          
          <nav class="drawer-nav">
            <div v-for="group in menuGroups" :key="group.title" class="menu-group">
              <div class="group-title">
                <span class="title-star">✦</span>
                <span>{{ group.title }}</span>
                <span class="title-star">✦</span>
              </div>
              <div class="menu-items">
                <div
                  v-for="item in group.items"
                  :key="item.path"
                  class="menu-card"
                  :class="{ 'active': isActive(item.path) }"
                  @click="handleNavigate(item.path)"
                >
                  <div class="card-icon">
                    <component :is="item.icon" theme="outline" size="18" />
                  </div>
                  <span class="card-label">{{ item.name }}</span>
                  <div v-if="isActive(item.path)" class="active-indicator"></div>
                </div>
              </div>
            </div>
          </nav>
          
          <div class="drawer-footer">
            <div class="footer-divider">
              <div class="divider-line"></div>
              <div class="divider-dot"></div>
              <div class="divider-line"></div>
            </div>
            <div class="footer-text">
              <span class="text-icon">⚠️</span>
              <span>本项目仅供学习使用</span>
            </div>
            <div class="footer-subtext">请支持正版音乐</div>
          </div>
        </div>
      </Transition>
      
      </div>
  </Teleport>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  display: flex;
}

.sidebar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.sidebar-drawer {
  position: relative;
  height: calc(100% - 100px);
  width: 280px;
  max-width: 75%;
  background: rgba(var(--color-bg-view-rgb), 0.88);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-right: 1px solid rgba(var(--color-primary-rgb), 0.15);
  box-shadow: 10px 0 40px rgba(0, 0, 0, 0.2),
              0 0 30px rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--color-border), 0.4);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.15);
  border-radius: 10px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
}

.logo-music {
  color: var(--color-primary);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  letter-spacing: 0.5px;
}

.header-decoration {
  display: flex;
  gap: 6px;
}

.glow-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

.glow-dot:nth-child(2) {
  animation-delay: 0.3s;
  opacity: 0.7;
}

.glow-dot:nth-child(3) {
  animation-delay: 0.6s;
  opacity: 0.4;
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

.menu-group {
  margin-bottom: 24px;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

.title-star {
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: 8px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--color-bg-view-rgb), 0.6);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.menu-card:hover {
  background: rgba(var(--color-bg-tertiary), 0.4);
  transform: translateX(4px);
  border-color: rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08),
              0 0 12px rgba(var(--color-primary-rgb), 0.1);
}

.menu-card.active {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.15),
              inset 0 0 30px rgba(var(--color-primary-rgb), 0.05);
}

.card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 10px;
  color: var(--color-text-secondary);
  transition: all 0.25s ease;
}

.menu-card:hover .card-icon {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.15);
}

.menu-card.active .card-icon {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
}

.card-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: color 0.25s ease;
}

.menu-card:hover .card-label,
.menu-card.active .card-label {
  color: var(--color-text-main);
}

.menu-card.active .card-label {
  color: var(--color-primary);
  font-weight: 500;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px var(--color-primary);
}

.drawer-footer {
  padding: 20px;
  border-top: 1px solid rgba(var(--color-border), 0.4);
  background: rgba(var(--color-bg-view-rgb), 0.5);
}

.footer-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.divider-line {
  width: 40px;
  height: 1px;
  background: rgba(var(--color-primary-rgb), 0.3);
}

.divider-dot {
  width: 6px;
  height: 6px;
  background: rgba(var(--color-primary-rgb), 0.5);
  border-radius: 50%;
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.text-icon {
  font-size: 12px;
}

.footer-subtext {
  text-align: center;
  font-size: 10px;
  color: var(--color-text-description);
  margin-top: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active {
  animation: slide-in-right 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-right-leave-active {
  animation: slide-out-right 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slide-in-right {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 8px var(--color-primary);
  }
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary-rgb), 0.5);
}
</style>