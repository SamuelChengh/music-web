<script setup lang="ts">
import { ref, computed } from 'vue';
import { Like } from '@icon-park/vue-next';
import { ElTooltip } from 'element-plus';
import { useFavoritesStore } from '../stores/favorites';
import type { Song } from '../stores/player';

interface Props {
  song: Song;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showTooltip: false,
});

const favoritesStore = useFavoritesStore();
const isLiked = computed(() => favoritesStore.isFavorite(props.song.rid));

const iconSize = computed(() => {
  const sizes = {
    small: 16,
    medium: 20,
    large: 24,
  };
  return sizes[props.size];
});

const isAnimating = ref(false);
const particles = ref<Array<{ id: number; angle: number; visible: boolean }>>([]);

const handleClick = (e: MouseEvent) => {
  e.stopPropagation();
  
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  
  if (isLiked.value) {
    favoritesStore.removeFromFavorites(props.song.rid);
  } else {
    favoritesStore.addToFavorites(props.song);
    createParticles();
  }
  
  setTimeout(() => {
    isAnimating.value = false;
    particles.value = [];
  }, 600);
};

const createParticles = () => {
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      id: Date.now() + i,
      angle: i * (360 / particleCount),
      visible: true,
    });
  }
};

const tooltipContent = computed(() => {
  return isLiked.value ? '取消收藏' : '添加收藏';
});
</script>

<template>
  <ElTooltip
    v-if="showTooltip"
    :content="tooltipContent"
    placement="top"
    :show-after="300"
  >
    <button
      class="like-button"
      :class="{ 'is-liked': isLiked, 'is-animating': isAnimating }"
      @click="handleClick"
    >
      <Like
        :theme="isLiked ? 'filled' : 'outline'"
        :size="iconSize"
        class="like-icon"
        :style="{ color: isLiked ? '#ff4757' : '#999' }"
      />
      <div class="particles-container">
        <span
          v-for="particle in particles"
          :key="particle.id"
          class="particle"
          :style="{ '--angle': particle.angle + 'deg' }"
        >
          <Like theme="filled" size="8" style="color: #ff4757" />
        </span>
      </div>
    </button>
  </ElTooltip>
  
  <button
    v-else
    class="like-button"
    :class="{ 'is-liked': isLiked, 'is-animating': isAnimating }"
    @click="handleClick"
  >
    <Like
      :theme="isLiked ? 'filled' : 'outline'"
      :size="iconSize"
      class="like-icon"
      :style="{ color: isLiked ? '#ff4757' : '#999' }"
    />
    <div class="particles-container">
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{ '--angle': particle.angle + 'deg' }"
      >
        <Like theme="filled" size="8" style="color: #ff4757" />
      </span>
    </div>
  </button>
</template>

<style scoped>
.like-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  outline: none;
}

.like-button:hover {
  transform: scale(1.1);
}

.like-button.is-animating .like-icon {
  animation: heartbeat 0.6s ease;
}

.like-icon {
  transition: color 0.2s ease;
}

.like-button.is-liked .like-icon {
  color: #ff4757;
}

.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  animation: particle-explode 0.6s ease-out forwards;
}

.particle :deep(svg) {
  animation: particle-fade 0.6s ease-out forwards;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.3);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.2);
  }
  60% {
    transform: scale(1);
  }
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-20px);
  }
}

@keyframes particle-fade {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>