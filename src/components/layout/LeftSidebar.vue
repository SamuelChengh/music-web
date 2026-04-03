<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Home, ChartHistogram, People, Like, Videocamera, Broadcast, Music, Mail, Copy, Send, History } from '@icon-park/vue-next';

const route = useRoute();

// 响应式屏幕检测
const isDesktop = ref(false);
const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024; // lg breakpoint
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

// 联系我功能
const showContactCard = ref(false);
const showToastMessage = ref('');
const emailAddress = 'lgchengh@163.com';

const toggleContactCard = () => {
  showContactCard.value = !showContactCard.value;
};

const copyEmail = async () => {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(emailAddress);
      showToast('邮箱已复制到剪贴板');
      return;
    }
    
    // Fallback：使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = emailAddress;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      showToast('邮箱已复制到剪贴板');
    } else {
      showToast('复制失败,请手动复制');
    }
  } catch (err) {
    console.error('复制失败:', err);
    showToast('复制失败,请手动复制');
  }
};

const sendEmail = () => {
  window.location.href = `mailto:${emailAddress}`;
};

const showToast = (message: string) => {
  showToastMessage.value = message;
  setTimeout(() => {
    showToastMessage.value = '';
  }, 2500);
};

const menuGroups = [
  {
    title: '推荐',
    items: [
      { name: '发现音乐', path: '/', icon: Home },
      { name: '排行榜', path: '/rank', icon: ChartHistogram },
      { name: '歌手', path: '/artist', icon: People },
    ]
  },
  {
    title: '音乐馆',
    items: [
      { name: 'MV', path: '/mv', icon: Videocamera },
      { name: '电台', path: '/dj', icon: Broadcast },
    ]
  },
{
  title: '我的音乐',
  items: [
    { name: '我喜欢', path: '/favorites', icon: Like },
    { name: '播放历史', path: '/history', icon: History },
  ]
}
];

const isActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>

<template>
  <aside class="w-(--width-sidebar) h-full bg-sidebar flex flex-col">
    <div class="flex items-center h-14 px-sm">
      <Music theme="filled" size="22" class="text-primary mr-2" />
      <span class="logo-text">TheH音乐</span>
    </div>
    
    <nav class="flex-1 overflow-y-auto py-md">
      <div v-for="group in menuGroups" :key="group.title" class="mb-lg">
        <div class="text-xs text-secondary px-md mb-sm">{{ group.title }}</div>
        <div
          v-for="item in group.items"
          :key="item.path"
          class="menu-item"
          :class="{ 'active': isActive(item.path) }"
          @click="$router.push(item.path)"
        >
          <component :is="item.icon" theme="outline" size="18" :class="{ 'text-active': isActive(item.path) }" />
          <span :class="{ 'text-active': isActive(item.path) }">{{ item.name }}</span>
        </div>
      </div>
    </nav>
    
    <div class="drawer-footer">
      <div class="footer-content">
        <!-- 左侧：邮箱图标 -->
        <div class="footer-contact" @click.stop="toggleContactCard">
          <div class="contact-icon-wrapper">
            <Mail theme="filled" size="20" class="contact-icon-footer" />
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="footer-divider-vertical"></div>
        
        <!-- 右侧：免责声明 -->
        <div class="footer-info">
          <div class="footer-text">
            <span class="text-icon">⚠️</span>
            <span>本项目仅供学习使用</span>
          </div>
          <div class="footer-subtext">请支持正版音乐</div>
        </div>
      </div>
    </div>
  </aside>
  
  <!-- 使用 Teleport 将弹出层传送到 body，避免 backdrop-filter 影响 fixed 定位 -->
  <!-- 只在 PC 端（≥1024px）时渲染 -->
  <Teleport to="body">
    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="showToastMessage && isDesktop" class="toast-message">
        {{ showToastMessage }}
      </div>
    </Transition>
    
    <!-- 联系卡片 -->
    <Transition name="contact-card">
      <div v-if="showContactCard && isDesktop" class="contact-card" @click.stop>
        <div class="contact-header">
          <Mail theme="filled" size="20" class="contact-icon" />
          <span class="contact-title">联系我</span>
        </div>
        <div class="email-display">{{ emailAddress }}</div>
        <div class="contact-actions">
          <button class="action-btn copy-btn" @click="copyEmail">
            <Copy theme="outline" size="16" />
            <span>复制邮箱</span>
          </button>
          <button class="action-btn send-btn" @click="sendEmail">
            <Send theme="outline" size="16" />
            <span>发送邮件</span>
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- 点击外部关闭 -->
    <Transition name="fade">
      <div v-if="showContactCard && isDesktop" class="contact-overlay" @click="showContactCard = false"></div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.menu-item:hover {
  color: var(--color-text-main);
}

.menu-item.active {
  background: linear-gradient(to right, var(--color-active-bg), transparent);
  color: var(--color-active-text);
  font-weight: 500;
  position: relative;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 0.25rem;
  height: 1.25rem;
  background: var(--color-primary);
  border-radius: 0 0.125rem 0.125rem 0;
}

/* Logo 文字渐变效果 */
.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0 0.5rem;
  
  /* 渐变文字效果 */
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    rgba(var(--color-primary-rgb), 0.7) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  /* 增大字间距提升呼吸感 */
  letter-spacing: 1px;
  
  /* 为渐变文字添加阴影效果 */
  position: relative;
}

/* 伪元素实现阴影效果（兼容方案） */
.logo-text::before {
  content: 'TheH音乐';
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    rgba(var(--color-primary-rgb), 0.7) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: blur(1px);
  opacity: 0.2;
}

/* Footer 样式 */
.drawer-footer {
  position: relative;
  padding: 1rem;
  border-top: 1px solid rgba(var(--color-border), 0.4);
  background: rgba(var(--color-bg-view-rgb), 0.5);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 左侧：邮箱图标 */
.footer-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
}

.contact-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.15);
  border-radius: 8px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  transition: all 0.25s ease;
}

.footer-contact:hover .contact-icon-wrapper {
  background: rgba(var(--color-primary-rgb), 0.25);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
}

.contact-icon-footer {
  color: var(--color-primary);
}

/* 分隔线 */
.footer-divider-vertical {
  width: 1px;
  height: 32px;
  background: rgba(var(--color-primary-rgb), 0.2);
  flex-shrink: 0;
}

/* 右侧：免责声明 */
.footer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.footer-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.625rem;
  color: var(--color-text-secondary);
}

.text-icon {
  font-size: 0.75rem;
}

.footer-subtext {
  font-size: 0.625rem;
  color: var(--color-text-description);
}

/* 联系卡片容器 */
.contact-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 110;
  width: 260px;
  max-width: 85%;
  padding: 20px 16px;
  background: rgba(var(--color-bg-view-rgb), 0.92);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 20px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2),
              0 0 40px rgba(var(--color-primary-rgb), 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

/* 联系卡片头部 */
.contact-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.contact-icon {
  color: var(--color-primary);
  opacity: 0.9;
}

.contact-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-main);
  letter-spacing: 0.5px;
}

/* 邮箱显示 */
.email-display {
  font-size: 14px;
  color: var(--color-text-main);
  margin-bottom: 16px;
  padding: 12px 14px;
  background: rgba(var(--color-bg-tertiary), 0.5);
  border-radius: 10px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  word-break: keep-all;
  line-height: 1.8;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  text-align: center;
  font-weight: 500;
}

/* 操作按钮组 */
.contact-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(var(--color-bg-tertiary), 0.3);
  border-radius: 10px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.15);
}

.copy-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
}

.send-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.18);
  border-color: rgba(var(--color-primary-rgb), 0.5);
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.2);
}

/* 遮罩层 */
.contact-overlay {
  position: fixed;
  inset: 0;
  z-index: 105;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  cursor: pointer;
}

/* Toast 提示 */
.toast-message {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(var(--color-primary-rgb), 0.85);
  color: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 200;
  max-width: 80%;
  text-align: center;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.contact-card-enter-active {
  animation: contact-expand 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.contact-card-leave-active {
  animation: contact-collapse 0.25s ease-in;
}

@keyframes contact-expand {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes contact-collapse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.2s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
