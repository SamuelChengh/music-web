<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '../../stores/theme';
import { usePlayerStore } from '../../stores';
import { searchSongs, getHotSearch } from '../../api';
import { Left, Right, Search, User, Setting, Moon, Sunny, Play } from '@icon-park/vue-next';

const router = useRouter();
const themeStore = useThemeStore();
const playerStore = usePlayerStore();

const searchKeyword = ref('');
const searchResults = ref<any[]>([]);
const hotSearch = ref<string[]>([]);
const showDropdown = ref(false);
const searching = ref(false);

const goBack = () => router.back();
const goForward = () => router.forward();

watch(searchKeyword, async (val) => {
  if (!val.trim()) {
    searchResults.value = [];
    return;
  }
  searching.value = true;
  try {
    searchResults.value = await searchSongs(val, 1, 8);
  } catch (e) {
    console.error(e);
  }
  searching.value = false;
});

const playSong = (song: any) => {
  playerStore.setSong(song);
  searchKeyword.value = '';
  showDropdown.value = false;
};

const searchHot = (word: string) => {
  searchKeyword.value = word;
};

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const goToSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value } });
  }
};

getHotSearch().then(res => {
  hotSearch.value = res;
});
</script>

<template>
  <header class="h-14 flex items-center px-md gap-md drag">
    <div class="flex items-center gap-1 no-drag">
      <button 
        class="w-8 h-8 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
        @click="goBack"
        title="后退"
      >
        <Left theme="outline" size="18" />
      </button>
      <button 
        class="w-8 h-8 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
        @click="goForward"
        title="前进"
      >
        <Right theme="outline" size="18" />
      </button>
    </div>
    
    <div class="flex-1 flex items-center justify-center no-drag">
      <div class="relative w-full max-w-2xl flex items-center bg-tertiary rounded-full px-md">
        <Search class="text-secondary shrink-0" theme="outline" size="20" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索音乐、歌手、歌词..."
          class="flex-1 h-11 bg-transparent text-base text-main placeholder-secondary focus:outline-none transition-default ml-3"
          @focus="showDropdown = true"
          @blur="hideDropdown"
          @keyup.enter="goToSearch"
        />
        
        <Transition name="dropdown">
          <div 
            v-if="showDropdown && (searchResults.length > 0 || (hotSearch.length > 0 && !searchKeyword))"
            class="absolute top-full left-0 right-0 mt-2 bg-view border border-default rounded-xl shadow-lg z-50 overflow-hidden min-w-96"
          >
            <div v-if="!searchKeyword && hotSearch.length > 0" class="p-md">
              <div class="text-xs text-secondary mb-3">热门搜索</div>
              <div class="flex flex-wrap gap-sm">
                <span
                  v-for="word in hotSearch.slice(0, 8)"
                  :key="word"
                  class="px-sm py-sm bg-tertiary rounded-full text-xs cursor-pointer hover:bg-active hover:text-active transition-all"
                  @click="searchHot(word)"
                >
                  {{ word }}
                </span>
              </div>
            </div>
            
            <div v-if="searchResults.length > 0" class="border-t border-default">
              <div class="text-xs text-secondary px-md py-sm bg-tertiary/50">搜索结果</div>
              <div
                v-for="song in searchResults"
                :key="song.rid"
                class="flex items-center gap-md px-md py-md hover:bg-tertiary cursor-pointer transition-colors group"
                @click="playSong(song)"
              >
                <img :src="song.pic" class="w-10 h-10 rounded-lg object-cover" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-main truncate">{{ song.name }}</div>
                  <div class="text-xs text-secondary truncate">{{ song.artist }}</div>
                </div>
                <button class="opacity-0 group-hover:opacity-100 p-1.5 gradient-bg text-white rounded-full transition-all">
                  <Play theme="filled" size="14" />
                </button>
              </div>
              <div 
                v-if="searchResults.length >= 8"
                class="text-center py-sm text-xs text-primary hover:bg-tertiary cursor-pointer transition-colors"
                @click="goToSearch"
              >
                查看更多结果 →
              </div>
            </div>
            
            <div v-else-if="searchKeyword && !searching" class="p-md text-center text-sm text-secondary">
              未找到相关歌曲
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <div class="flex items-center gap-sm no-drag">
      <button
        class="w-9 h-9 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
        :title="themeStore.mode === 'dark' ? '浅色模式' : '深色模式'"
        @click="themeStore.toggleMode()"
      >
        <Moon v-if="themeStore.mode === 'dark'" theme="filled" size="18" />
        <Sunny v-else theme="outline" size="18" />
      </button>
      
      <button
        class="w-9 h-9 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
        title="用户"
      >
        <User theme="outline" size="18" />
      </button>
      
      <button
        class="w-9 h-9 rounded-full hover:bg-tertiary text-secondary hover-text flex items-center justify-center transition-default"
        title="设置"
      >
        <Setting theme="outline" size="18" />
      </button>
    </div>
  </header>
</template>

<style scoped>
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
