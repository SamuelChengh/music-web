<script setup lang="ts">
import { Play } from '@icon-park/vue-next';

interface Props {
  picUrl: string;
  playCount?: number;
  showPlayCount?: boolean;
  ratio?: string;
}

const props = withDefaults(defineProps<Props>(), {
  playCount: 0,
  showPlayCount: false,
  ratio: '1/1',
});

const emit = defineEmits<{
  click: [];
}>();

const formatNumber = (num: number) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const isDarkImage = (url: string) => {
  return !url || url.includes('kuwo.cn/star/albumcover/300/') || url.endsWith('/');
};
</script>

<template>
  <div 
    class="cover-play-image cursor-pointer relative group overflow-hidden"
    :style="{ aspectRatio: ratio }"
    @click="emit('click')"
  >
    <div 
      v-if="isDarkImage(picUrl)"
      class="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
    >
      <span class="text-4xl opacity-30">🎵</span>
    </div>
    <img 
      v-else 
      :src="picUrl" 
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      loading="lazy" 
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    
    <div class="cover-mask">
      <div class="cover-play-icon">
        <Play theme="filled" size="18" />
      </div>
    </div>
    
    <div 
      v-if="showPlayCount && playCount > 0"
      class="play-count absolute top-2 right-2 text-white text-xs bg-black/50 pl-2 pr-2 py-0.5 rounded-full flex items-center gap-1"
    >
      <span>{{ formatNumber(playCount) }}</span>
    </div>
  </div>
</template>
