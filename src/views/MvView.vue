<script setup lang="ts">
import { ref } from 'vue';
import { Video } from '@icon-park/vue-next';

const categories = ['全部', '推荐', '最新', 'MV'];
const currentCategory = ref('全部');
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-md py-md md:px-lg md:py-lg">
      <div class="flex items-center gap-md mb-md md:mb-lg">
        <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
        <h1 class="text-xl md:text-2xl font-bold text-main">MV</h1>
      </div>
      
      <div class="flex gap-sm mb-md md:mb-lg overflow-x-auto pb-2 md:pb-3 scrollbar-hide">
        <div
          v-for="cat in categories"
          :key="cat"
          class="flex-shrink-0 px-sm py-xs md:px-md md:py-sm rounded-full cursor-pointer transition-all duration-200 text-sm md:text-sm whitespace-nowrap"
          :class="currentCategory === cat 
            ? 'bg-primary text-white' 
            : 'bg-tertiary text-secondary hover:bg-active hover:text-active'"
          @click="currentCategory = cat"
        >
          {{ cat }}
        </div>
      </div>
      
      <div class="text-center py-12 md:py-16 text-secondary">
        <Video theme="outline" size="36 md:48" class="mx-auto mb-3 md:mb-4 opacity-50" />
        <div class="text-base md:text-base">MV 功能开发中...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
