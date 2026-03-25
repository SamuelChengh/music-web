<script setup lang="ts">
import { Radio } from '@icon-park/vue-next';
</script>

<template>
  <div class="h-full overflow-y-auto bg-view">
    <div class="px-lg py-lg">
      <div class="flex items-center gap-md mb-lg">
        <div class="w-1 h-6 gradient-bg rounded-full"></div>
        <h1 class="text-2xl font-bold text-main">电台</h1>
      </div>
      
      <div class="text-center py-xl text-secondary">
        <Radio theme="outline" size="48" class="mx-auto mb-4 opacity-50" />
        <div>电台功能开发中...</div>
      </div>
    </div>
  </div>
</template>
