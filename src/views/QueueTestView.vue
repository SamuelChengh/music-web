<script setup lang="ts">
import { computed } from 'vue';
import { useQueueStore, useHistoryStore, usePlayerStore } from '../stores';

const queueStore = useQueueStore();
const historyStore = useHistoryStore();
const playerStore = usePlayerStore();

const testSong1 = {
  rid: 1001,
  name: '测试歌曲1',
  artist: '测试歌手A',
  pic: 'https://example.com/pic1.jpg',
  duration: 180
};

const testSong2 = {
  rid: 1002,
  name: '测试歌曲2',
  artist: '测试歌手B',
  pic: 'https://example.com/pic2.jpg',
  duration: 240
};

const testSong3 = {
  rid: 1003,
  name: '测试歌曲3',
  artist: '测试歌手C',
  pic: 'https://example.com/pic3.jpg',
  duration: 300
};

const testAddToQueue = () => {
  queueStore.addToQueue(testSong1);
  queueStore.addToQueue(testSong2);
};

const testPlayNext = () => {
  queueStore.playNext(testSong3);
};

const testPlaySong = () => {
  queueStore.setCurrentIndex(0);
  playerStore.currentSong = queueStore.playlist[0];
};

const testRecordHistory = () => {
  historyStore.recordHistory(testSong1, 35);
};

const testClearQueue = () => {
  queueStore.clearQueue();
};

const testClearPriorityQueue = () => {
  queueStore.clearPriorityQueue();
};

const testClearHistory = () => {
  historyStore.clearHistory();
};

const playlistInfo = computed(() => {
  return queueStore.playlist.map((item, index) => ({
    index,
    name: item.name,
    priority: item.priority,
    isCurrent: index === queueStore.currentIndex
  }));
});

const historyInfo = computed(() => {
  return historyStore.sortedHistory.slice(0, 10).map(item => ({
    name: item.name,
    playedAt: new Date(item.playedAt).toLocaleString(),
    duration: item.playDuration
  }));
});
</script>

<template>
  <div class="p-8 bg-view min-h-screen">
    <h1 class="text-2xl font-bold mb-6">播放队列测试页面</h1>
    
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">队列操作测试</h2>
      <div class="flex gap-4 mb-4">
        <button @click="testAddToQueue" class="px-4 py-2 bg-blue-500 text-white rounded">
          添加歌曲到队列
        </button>
        <button @click="testPlayNext" class="px-4 py-2 bg-green-500 text-white rounded">
          测试"下一首播放"
        </button>
        <button @click="testPlaySong" class="px-4 py-2 bg-purple-500 text-white rounded">
          播放第一首
        </button>
        <button @click="testClearQueue" class="px-4 py-2 bg-red-500 text-white rounded">
          清空队列
        </button>
        <button @click="testClearPriorityQueue" class="px-4 py-2 bg-orange-500 text-white rounded">
          清空优先级队列
        </button>
      </div>
      
      <div class="mb-4">
        <h3 class="font-semibold mb-2">队列状态：</h3>
        <div class="text-sm mb-2">
          总数: {{ queueStore.totalCount }} | 
          优先级歌曲: {{ queueStore.priorityCount }} | 
          当前索引: {{ queueStore.currentIndex }}
        </div>
        
        <div v-if="playlistInfo.length > 0" class="bg-white rounded p-4">
          <div v-for="item in playlistInfo" :key="item.index" class="mb-2">
            <span :class="item.isCurrent ? 'text-blue-600 font-bold' : ''">
              {{ item.index }}. {{ item.name }}
              <span class="text-xs ml-2" :class="item.priority === 'high' ? 'text-green-600' : 'text-gray-500'">
                [{{ item.priority }}]
              </span>
              {{ item.isCurrent ? '▶️' : '' }}
            </span>
          </div>
        </div>
        <div v-else class="text-gray-500">队列为空</div>
      </div>
    </div>
    
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">播放历史测试</h2>
      <div class="flex gap-4 mb-4">
        <button @click="testRecordHistory" class="px-4 py-2 bg-indigo-500 text-white rounded">
          记录播放历史（35秒）
        </button>
        <button @click="testClearHistory" class="px-4 py-2 bg-red-500 text-white rounded">
          清空历史
        </button>
      </div>
      
      <div class="mb-4">
        <h3 class="font-semibold mb-2">历史记录：</h3>
        <div class="text-sm mb-2">总数: {{ historyStore.totalCount }}</div>
        
        <div v-if="historyInfo.length > 0" class="bg-white rounded p-4">
          <div v-for="(item, index) in historyInfo" :key="index" class="mb-2 text-sm">
            {{ item.name }} - 播放时间: {{ item.playedAt }} - 播放时长: {{ item.duration }}秒
          </div>
        </div>
        <div v-else class="text-gray-500">暂无历史记录</div>
      </div>
    </div>
    
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">持久化测试</h2>
      <div class="text-sm text-gray-600">
        刷新页面后，队列和历史记录应该保持不变
      </div>
    </div>
  </div>
</template>