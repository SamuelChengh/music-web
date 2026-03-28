<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePlayerStore } from '../../stores';
import { Close, Delete } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

const playerStore = usePlayerStore();
const listRef = ref<HTMLDivElement | null>(null);

const playSong = (index: number) => {
  playerStore.playAt(index);
};

const removeSong = (index: number) => {
  playerStore.removeFromList(index);
};

const clearList = () => {
  playerStore.clearPlaylist();
};

watch(() => playerStore.showPlaylist, (show) => {
  if (show && listRef.value) {
    listRef.value.scrollTop = 0;
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div 
        v-if="playerStore.showPlaylist"
        class="fixed right-0 top-0 bottom-[100px] lg:bottom-[80px] w-[50vw] lg:w-80 bg-view border-l border-default flex flex-col z-50 shadow-lg"
      >
        <div class="h-12 flex items-center justify-between px-md border-b border-default">
          <span class="text-sm text-main font-medium">播放列表 ({{ playerStore.playlist.length }})</span>
          <div class="flex items-center gap-sm">
            <el-tooltip v-if="playerStore.playlist.length > 0" content="清空播放列表" placement="top">
              <button 
                class="text-xs text-secondary hover-text"
                @click="clearList"
              >
                清空
              </button>
            </el-tooltip>
            <el-tooltip content="关闭" placement="top">
              <button 
                class="w-6 h-6 rounded flex items-center justify-center hover:bg-tertiary text-primary hover:text-primary-hover"
                @click="playerStore.showPlaylist = false"
              >
                <Close theme="outline" size="16" />
              </button>
            </el-tooltip>
          </div>
        </div>
        
        <div ref="listRef" class="flex-1 overflow-y-auto">
          <div v-if="playerStore.playlist.length === 0" class="flex items-center justify-center h-full text-secondary text-sm">
            播放列表为空
          </div>
          
          <div
            v-for="(song, index) in playerStore.playlist"
            :key="song.rid"
            class="flex items-center px-sm py-sm gap-sm hover:bg-tertiary cursor-pointer group"
            :class="{ 'bg-active': playerStore.currentIndex === index }"
            @click="playSong(index)"
          >
            <div class="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <img :src="song.pic" class="w-full h-full object-cover" />
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <div class="text-sm truncate" :class="playerStore.currentIndex === index ? 'text-active' : 'text-main'">
                {{ song.name }}
              </div>
              <div class="text-xs text-secondary truncate">{{ song.artist }}</div>
            </div>
<el-tooltip content="移除" placement="top">
              <button 
                class="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-tertiary text-primary hover:text-primary-hover"
                @click.stop="removeSong(index)"
              >
                <Delete theme="outline" size="14" />
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </Transition>
    
    <div 
      v-if="playerStore.showPlaylist" 
      class="fixed inset-0 bg-black/20 z-40"
      @click="playerStore.showPlaylist = false"
    />
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
