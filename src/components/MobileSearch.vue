<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores';
import { searchSongs, getHotSearch } from '../api';
import { Search, Close, Play } from '@icon-park/vue-next';

const emit = defineEmits<{
  close: []
}>();

const router = useRouter();
const playerStore = usePlayerStore();

const searchKeyword = ref('');
const searchResults = ref<any[]>([]);
const hotSearch = ref<string[]>([]);
const searching = ref(false);

watch(searchKeyword, async (val) => {
  if (!val.trim()) {
    searchResults.value = [];
    return;
  }
  searching.value = true;
  try {
    searchResults.value = await searchSongs(val, 1, 20);
  } catch (e) {
    console.error(e);
  }
  searching.value = false;
});

const playSong = (song: any) => {
  playerStore.setSong(song);
  searchKeyword.value = '';
  emit('close');
};

const searchHot = (word: string) => {
  searchKeyword.value = word;
};

const goToSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value } });
    emit('close');
  }
};

getHotSearch().then(res => {
  hotSearch.value = res;
});
</script>

<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex flex-col" @click.self="emit('close')">
    <div class="bg-view rounded-b-2xl p-md animate-slide-down">
      <div class="flex items-center gap-sm mb-md">
        <button class="p-sm hover:bg-tertiary rounded-full" @click="emit('close')">
          <Close theme="outline" size="20" class="text-secondary" />
        </button>
        <div class="flex-1 flex items-center bg-tertiary rounded-full px-md">
          <Search class="text-secondary shrink-0" theme="outline" size="20" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索歌曲、歌手..."
            class="flex-1 h-11 bg-transparent text-base text-main placeholder-secondary focus:outline-none ml-3"
            @keyup.enter="goToSearch"
            autofocus
          />
        </div>
      </div>
      
      <div v-if="!searchKeyword && hotSearch.length > 0" class="mb-md">
        <div class="text-xs text-secondary mb-2">热门搜索</div>
        <div class="flex flex-wrap gap-sm">
          <span
            v-for="word in hotSearch.slice(0, 8)"
            :key="word"
            class="px-sm py-sm bg-tertiary rounded-full text-sm cursor-pointer hover:bg-active hover:text-active"
            @click="searchHot(word)"
          >
            {{ word }}
          </span>
        </div>
      </div>
      
      <div v-if="searchResults.length > 0" class="max-h-[60vh] overflow-y-auto">
        <div
          v-for="song in searchResults"
          :key="song.rid"
          class="flex items-center gap-md py-sm hover:bg-tertiary cursor-pointer"
          @click="playSong(song)"
        >
          <img :src="song.pic" class="w-12 h-12 rounded-lg object-cover" />
          <div class="flex-1 min-w-0">
            <div class="text-base text-main truncate">{{ song.name }}</div>
            <div class="text-sm text-secondary truncate">{{ song.artist }}</div>
          </div>
          <button class="p-2 gradient-bg text-white rounded-full">
            <Play theme="filled" size="16" />
          </button>
        </div>
      </div>
      
      <div v-else-if="searchKeyword && !searching" class="text-center py-lg text-secondary">
        未找到相关歌曲
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>