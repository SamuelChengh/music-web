<script setup lang="ts">
import { computed } from 'vue';
import { useHistoryStore, usePlayerStore, useQueueStore } from '../stores';
import { Play, Delete, Close } from '@icon-park/vue-next';
import SongRowMobile from '../components/SongRowMobile.vue';
import LikeButton from '../components/LikeButton.vue';

interface Song {
  rid: number;
  name: string;
  artist: string;
  pic: string;
}

const historyStore = useHistoryStore();
const playerStore = usePlayerStore();
const queueStore = useQueueStore();

const recentHistory = computed(() => historyStore.recentHistory);
const totalCount = computed(() => historyStore.totalCount);

const playSong = (song: Song) => {
  if (!queueStore.playlist.find(s => s.rid === song.rid)) {
    queueStore.addToQueue(song);
  }
  const queueIndex = queueStore.playlist.findIndex(s => s.rid === song.rid);
  playerStore.playAt(queueIndex);
};

const clearAllHistory = () => {
  if (confirm('确定要清空所有播放历史吗？')) {
    historyStore.clearHistory();
  }
};

const removeSong = (rid: number) => {
  historyStore.removeFromHistory(rid);
};

const formatPlayTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `今天 ${hours}:${minutes}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `昨天 ${hours}:${minutes}`;
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-md py-sm md:px-lg md:py-md">
      <div class="section-divider">
        <h1 class="text-xl md:text-2xl font-bold text-main">播放历史</h1>
      </div>
      
      <div v-if="totalCount > 0" class="flex items-center justify-between mb-md md:mb-lg">
        <div class="text-sm md:text-secondary">共 {{ totalCount }} 首歌曲</div>
        <button 
          class="px-sm py-xs md:px-md md:py-sm bg-tertiary text-secondary rounded-full text-xs md:text-sm font-medium hover:bg-opacity-80 transition-all flex items-center gap-sm"
          @click="clearAllHistory"
        >
          <Delete theme="outline" size="14" />
          清空历史
        </button>
      </div>
      
      <!-- 今天 -->
      <div v-if="recentHistory.today.length > 0" class="mb-lg">
        <h2 class="text-sm md:text-base font-semibold text-secondary mb-sm md:mb-md flex items-center gap-sm">
          <span class="w-8 h-0.5 bg-primary rounded"></span>
          今天
          <span class="text-xs text-tertiary">({{ recentHistory.today.length }}首)</span>
        </h2>
        
        <!-- 移动端 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="item in recentHistory.today"
            :key="item.rid"
            :song="item"
            show-delete
            @play="playSong"
            @delete="removeSong"
          />
        </div>
        
<!-- PC端 -->
          <div class="hidden md:flex flex-col">
            <div
              v-for="item in recentHistory.today"
              :key="item.rid"
              class="song-row-simple group"
              @click="playSong(item)"
            >
              <img 
                :src="item.pic" 
                class="song-cover-simple"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="flex-1 min-w-0">
                <div class="text-base md:text-lg font-medium text-main truncate">
                  {{ item.name }}
                </div>
                <div class="text-sm md:text-base text-secondary truncate mt-0.5">
                  {{ item.artist }}
                </div>
                <div class="text-xs text-tertiary mt-1">
                  {{ formatPlayTime(item.playedAt) }} · 播放 {{ formatDuration(item.playDuration) }}
                </div>
              </div>
              <LikeButton
                :song="item"
                size="small"
                :show-tooltip="false"
              />
              <button
                class="delete-btn-pc"
                @click.stop="removeSong(item.rid)"
                aria-label="从历史中删除"
              >
                <Delete theme="outline" size="18" />
              </button>
            </div>
          </div>
      </div>
      
      <!-- 本周 -->
      <div v-if="recentHistory.thisWeek.length > 0" class="mb-lg">
        <h2 class="text-sm md:text-base font-semibold text-secondary mb-sm md:mb-md flex items-center gap-sm">
          <span class="w-8 h-0.5 bg-primary rounded"></span>
          本周
          <span class="text-xs text-tertiary">({{ recentHistory.thisWeek.length }}首)</span>
        </h2>
        
        <!-- 移动端 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="item in recentHistory.thisWeek"
            :key="item.rid"
            :song="item"
            show-delete
            @play="playSong"
            @delete="removeSong"
          />
        </div>
        
<!-- PC端 -->
          <div class="hidden md:flex flex-col">
            <div
              v-for="item in recentHistory.thisWeek"
              :key="item.rid"
              class="song-row-simple group"
              @click="playSong(item)"
            >
              <img 
                :src="item.pic" 
                class="song-cover-simple"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="flex-1 min-w-0">
                <div class="text-base md:text-lg font-medium text-main truncate">
                  {{ item.name }}
                </div>
                <div class="text-sm md:text-base text-secondary truncate mt-0.5">
                  {{ item.artist }}
                </div>
                <div class="text-xs text-tertiary mt-1">
                  {{ formatPlayTime(item.playedAt) }} · 播放 {{ formatDuration(item.playDuration) }}
                </div>
              </div>
              <LikeButton
                :song="item"
                size="small"
                :show-tooltip="false"
              />
              <button
                class="delete-btn-pc"
                @click.stop="removeSong(item.rid)"
                aria-label="从历史中删除"
              >
                <Delete theme="outline" size="18" />
              </button>
            </div>
          </div>
      </div>
      
      <!-- 更早 -->
      <div v-if="recentHistory.older.length > 0" class="mb-lg">
        <h2 class="text-sm md:text-base font-semibold text-secondary mb-sm md:mb-md flex items-center gap-sm">
          <span class="w-8 h-0.5 bg-primary rounded"></span>
          更早
          <span class="text-xs text-tertiary">({{ recentHistory.older.length }}首)</span>
        </h2>
        
        <!-- 移动端 -->
        <div class="md:hidden">
          <SongRowMobile
            v-for="item in recentHistory.older"
            :key="item.rid"
            :song="item"
            show-delete
            @play="playSong"
            @delete="removeSong"
          />
        </div>
        
<!-- PC端 -->
          <div class="hidden md:flex flex-col">
            <div
              v-for="item in recentHistory.older"
              :key="item.rid"
              class="song-row-simple group"
              @click="playSong(item)"
            >
              <img 
                :src="item.pic" 
                class="song-cover-simple"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="flex-1 min-w-0">
                <div class="text-base md:text-lg font-medium text-main truncate">
                  {{ item.name }}
                </div>
                <div class="text-sm md:text-base text-secondary truncate mt-0.5">
                  {{ item.artist }}
                </div>
                <div class="text-xs text-tertiary mt-1">
                  {{ formatPlayTime(item.playedAt) }} · 播放 {{ formatDuration(item.playDuration) }}
                </div>
              </div>
              <LikeButton
                :song="item"
                size="small"
                :show-tooltip="false"
              />
              <button
                class="delete-btn-pc"
                @click.stop="removeSong(item.rid)"
                aria-label="从历史中删除"
              >
                <Delete theme="outline" size="18" />
              </button>
            </div>
          </div>
      </div>
      
      <div v-if="totalCount === 0" class="empty-state-simple">
        <div class="text-sm">暂无播放历史</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-btn-pc {
  width: 32px;
  height: 32px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: #e74c3c;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.song-row-simple:hover .delete-btn-pc {
  opacity: 1;
}

.delete-btn-pc:hover {
  background: rgba(231, 76, 60, 0.1);
}

.delete-btn-pc:active {
  transform: scale(0.92);
}
</style>