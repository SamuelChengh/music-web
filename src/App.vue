<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore, useFavoritesStore, usePlayerStore } from './stores';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import AppHeader from './components/layout/Header.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import PlayListDrawer from './components/layout/PlayListDrawer.vue';
import MobileSidebar from './components/MobileSidebar.vue';
import { Music, Moon, Sunny, TShirt, Search, Home, Left } from '@icon-park/vue-next';

const router = useRouter();
const themeStore = useThemeStore();
const favoritesStore = useFavoritesStore();
const playerStore = usePlayerStore();
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

const canGoBack = computed(() => window.history.length > 1);

const goBack = () => router.back();

const goToSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value } });
  }
};

onMounted(() => {
  themeStore.init();
  favoritesStore.init();
  playerStore.init();
});
</script>

<template>
  <div class="flex h-screen bg-view">
    <LeftSidebar class="hidden lg:flex" />
    
    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader class="hidden md:flex" />
      
      <div class="md:hidden mobile-header">
        <div class="header-left">
          <div 
            class="logo-icon-glow"
            @click="showMobileSidebar = true"
          >
            <Music theme="filled" size="20" />
          </div>
          
          <Transition name="fade-scale">
            <button
              v-if="canGoBack"
              class="back-btn-glass"
              @click="goBack"
              title="返回"
            >
              <Left theme="outline" size="16" />
            </button>
          </Transition>
        </div>
        
        <div class="search-glass">
          <Search class="search-icon" theme="outline" size="16" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索歌曲、歌手..."
            class="search-input"
            @keyup.enter="goToSearch"
          />
        </div>
        
        <div class="header-right">
          <button
            class="btn-glass"
            @click="themeStore.toggleMode()"
          >
            <Moon v-if="themeStore.mode === 'dark'" theme="filled" size="16" />
            <Sunny v-else theme="outline" size="16" />
          </button>
          
          <div class="relative">
            <button
              class="btn-glass"
              @click="showMobileThemeMenu = !showMobileThemeMenu"
            >
              <TShirt theme="outline" size="16" />
            </button>
            
            <Transition name="dropdown">
              <div v-if="showMobileThemeMenu" class="fixed inset-0 z-40" @click="showMobileThemeMenu = false"></div>
            </Transition>
            <Transition name="dropdown">
              <div
                v-if="showMobileThemeMenu"
                class="theme-menu-glass fixed right-2 top-[76px] z-50"
              >
                <div class="grid grid-cols-4 gap-3">
                  <button 
                    v-for="c in themeColors" 
                    :key="c.value"
                    class="theme-color-btn"
                    :style="{ backgroundColor: c.hex }"
                    :class="themeStore.color === c.value ? 'active' : ''"
                    @click="themeStore.setColor(c.value as any); showMobileThemeMenu = false"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </div>
        
        <div class="glow-divider"></div>
      </div>
      
      <main class="flex-1 overflow-y-auto pb-safe">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
      
      <PlayerBar />
    </div>
    
    <PlayListDrawer />
    
    <MobileSidebar v-if="showMobileSidebar" @close="showMobileSidebar = false" />
  </div>
</template>

<style scoped>
.mobile-header {
  position: relative;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  background: rgba(var(--color-bg-view-rgb), 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
              0 0 40px rgba(var(--color-primary-rgb), 0.04);
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

@media (max-width: 400px) {
  .mobile-header {
    padding: 0 10px;
    gap: 8px;
  }
  
  .logo-icon-glow {
    width: 32px;
    height: 32px;
  }
  
  .back-btn-glass {
    width: 26px;
    height: 26px;
  }
  
  .btn-glass {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }
  
  .header-left {
    gap: 6px;
  }
  
  .header-right {
    gap: 6px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon-glow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.15);
  border-radius: 50%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  color: var(--color-primary);
  cursor: pointer;
  animation: pulse-glow 2.5s ease-in-out infinite;
  transition: all 0.3s ease;
}

.logo-icon-glow:hover {
  background: rgba(var(--color-primary-rgb), 0.25);
  transform: scale(1.05);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3),
                0 0 16px rgba(var(--color-primary-rgb), 0.15);
  }
  50% {
    box-shadow: 0 0 16px rgba(var(--color-primary-rgb), 0.5),
                0 0 32px rgba(var(--color-primary-rgb), 0.25);
  }
}

.back-btn-glass {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-bg-view-rgb), 0.6);
  border-radius: 8px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.back-btn-glass:hover {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  color: var(--color-primary);
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.2);
}

.search-glass {
  flex: 1;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  background: rgba(var(--color-bg-view-rgb), 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.12),
              inset 0 1px 2px rgba(var(--color-primary-rgb), 0.05);
  transition: all 0.3s ease;
}

.search-glass:focus-within {
  border-color: rgba(var(--color-primary-rgb), 0.5);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.2),
              0 0 40px rgba(var(--color-primary-rgb), 0.08),
              inset 0 1px 2px rgba(var(--color-primary-rgb), 0.08);
}

.search-icon {
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.search-glass:focus-within .search-icon {
  color: var(--color-primary);
}

.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  font-size: 14px;
  color: var(--color-text-main);
  padding-left: 8px;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-glass {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-bg-view-rgb), 0.5);
  border-radius: 12px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-glass:hover {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.35);
  box-shadow: 0 0 16px rgba(var(--color-primary-rgb), 0.18);
  transform: translateY(-1px);
}

.theme-menu-glass {
  width: 160px;
  padding: 12px;
  background: rgba(var(--color-bg-view-rgb), 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 0 24px rgba(var(--color-primary-rgb), 0.08);
}

.theme-color-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-color-btn:hover {
  transform: scale(1.15);
}

.theme-color-btn.active {
  border-color: var(--color-text-main);
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
}

.glow-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--color-primary-rgb), 0.3) 10%,
    rgba(var(--color-primary-rgb), 0.6) 30%,
    rgba(var(--color-primary-rgb), 0.8) 50%,
    rgba(var(--color-primary-rgb), 0.6) 70%,
    rgba(var(--color-primary-rgb), 0.3) 90%,
    transparent 100%
  );
}

.fade-scale-enter-active {
  transition: all 0.25s ease-out;
}

.fade-scale-leave-active {
  transition: all 0.2s ease-in;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
