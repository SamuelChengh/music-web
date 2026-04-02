<script setup lang="ts">
import { Radio } from '@icon-park/vue-next';
</script>

<template>
  <div class="h-full overflow-y-auto bg-view flex flex-col">
    <div class="px-md py-md md:px-lg md:py-lg flex-1 flex flex-col">
      <div class="flex items-center gap-md mb-md md:mb-lg">
        <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
        <h1 class="text-xl md:text-2xl font-bold text-main">电台</h1>
      </div>
      
      <div class="flex-1 flex items-center justify-center gap-3 text-secondary">
        <Radio theme="outline" size="20" class="opacity-50" />
        <div class="text-base">电台功能开发中...</div>
      </div>
    </div>
  </div>
</template>
