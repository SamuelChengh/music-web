<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArtistInfo } from '../api';
import { Play } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';

interface Artist {
  id: number;
  name: string;
  pic: string;
}

const router = useRouter();
const artists = ref<Artist[]>([]);
const loading = ref(false);
const category = ref('华语男');
const page = ref(1);

const categories = ['全部', '华语男', '华语女', '华语组合', '日韩男', '日韩女', '日韩组合', '欧美男', '欧美女', '欧美组合'];

const loadArtists = async () => {
  loading.value = true;
  artists.value = await getArtistInfo(category.value, page.value, 60);
  loading.value = false;
};

onMounted(loadArtists);

const changeCategory = async (cat: string) => {
  category.value = cat;
  page.value = 1;
  await loadArtists();
};

const goToArtistDetail = (id: number) => {
  router.push(`/artist/${id}`);
};
</script>

<template>
  <div class="h-full overflow-y-auto overflow-x-hidden bg-view">
    <div class="px-md py-md md:px-lg md:py-lg">
      <div class="flex items-center gap-md mb-md md:mb-lg">
        <div class="w-1 h-5 md:h-6 gradient-bg rounded-full"></div>
        <h1 class="text-xl md:text-2xl font-bold text-main">歌手</h1>
      </div>
      
      <div class="flex gap-sm mb-md md:mb-lg overflow-x-auto pb-2 md:pb-3 scrollbar-hide">
        <div
          v-for="cat in categories"
          :key="cat"
          class="flex-shrink-0 px-sm py-xs md:px-md md:py-sm rounded-full cursor-pointer transition-all duration-200 text-sm md:text-sm whitespace-nowrap"
          :class="category === cat 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-tertiary hover:bg-active text-secondary hover:text-active'"
          @click="changeCategory(cat)"
        >
          {{ cat }}
        </div>
      </div>

      <div v-if="loading" class="text-center py-xl text-secondary">
        加载中...
      </div>

      <div v-else class="artist-grid">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="artist-card"
          @click="goToArtistDetail(artist.id)"
        >
          <div class="artist-avatar-wrapper">
            <img 
              :src="artist.pic" 
              class="artist-avatar"
              alt=""
            />
            <div class="play-overlay">
              <Play theme="filled" size="20" class="play-icon" />
            </div>
          </div>
          <div class="artist-info">
            <div class="artist-name">{{ artist.name }}</div>
          </div>
        </div>
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

/* 移动端歌手列表优化 - 3列毛玻璃卡片 */
@media (max-width: 767px) {
  .artist-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 0 2px;
    min-width: 0;
    width: 100%;
  }

  .artist-card {
    background: rgba(var(--color-bg-view-rgb), 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 14px;
    padding: 6px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08),
                0 0 20px rgba(var(--color-primary-rgb), 0.04);
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
    overflow: hidden;
  }

  .artist-card:active {
    transform: scale(0.96);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .artist-avatar-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 6px;
  }

  .artist-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.25s ease;
  }

  .artist-card:active .artist-avatar {
    transform: scale(1.05);
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    opacity: 0;
  }

  .artist-card:active .play-overlay {
    background: rgba(0, 0, 0, 0.3);
    opacity: 1;
  }

  .play-icon {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .artist-info {
    text-align: center;
    width: 100%;
    min-width: 0;
  }

  .artist-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s ease;
    max-width: 100%;
  }

  .artist-card:active .artist-name {
    color: var(--color-primary);
  }
}

/* PC端保持原样式 */
@media (min-width: 768px) {
  .artist-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
  }

  .artist-card {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .artist-avatar-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 12px;
  }

  .artist-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .artist-card:hover .artist-avatar {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0;
  }

  .artist-card:hover .play-overlay {
    background: rgba(0, 0, 0, 0.2);
    opacity: 1;
  }

  .play-icon {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .artist-info {
    text-align: center;
  }

  .artist-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s ease;
  }

  .artist-card:hover .artist-name {
    color: var(--color-primary);
  }
}
</style>
