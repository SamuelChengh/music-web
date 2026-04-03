<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollLock } from '@vueuse/core';
import { Home, ChartHistogram, People, Like, Videocamera, Broadcast, Music, Mail, Copy, Send, History } from '@icon-park/vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

// 锁定 body 滚动，防止滚动穿透
const bodyRef = ref(document.body);
const isLocked = useScrollLock(bodyRef);

// 组件挂载时锁定滚动
onMounted(() => {
  isLocked.value = true;
});

// 组件卸载时解锁滚动
onUnmounted(() => {
  isLocked.value = false;
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
      { name: '发现音乐', path: '/discover', icon: Home },
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
  if (path === '/discover') return router.currentRoute.value.path === '/discover';
  return router.currentRoute.value.path.startsWith(path);
};

const handleNavigate = (path: string) => {
  router.push(path);
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div class="sidebar-container">
      <Transition name="fade">
        <div 
          class="sidebar-overlay"
          @click="emit('close')"
        />
      </Transition>
      
      <Transition name="slide-right">
        <div class="sidebar-drawer">
          <div class="drawer-header">
            <div class="logo-container">
              <div class="logo-icon">
                <Music theme="filled" size="22" class="logo-music" />
              </div>
              <span class="logo-text">TheH音乐</span>
            </div>
          </div>
          
          <nav class="drawer-nav">
            <div v-for="group in menuGroups" :key="group.title" class="menu-group">
              <div class="group-title">
                <span class="title-star">✦</span>
                <span>{{ group.title }}</span>
                <span class="title-star">✦</span>
              </div>
              <div class="menu-items">
                <div
                  v-for="item in group.items"
                  :key="item.path"
                  class="menu-card"
                  :class="{ 'active': isActive(item.path) }"
                  @click="handleNavigate(item.path)"
                >
                  <div class="card-icon">
                    <component :is="item.icon" theme="outline" size="18" />
                  </div>
                  <span class="card-label">{{ item.name }}</span>
                  <div v-if="isActive(item.path)" class="active-indicator"></div>
                </div>
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
        </div>
      </Transition>
      
      <!-- Toast 提示（移到 sidebar-drawer 外部） -->
      <Transition name="toast">
        <div v-if="showToastMessage" class="toast-message">
          {{ showToastMessage }}
        </div>
      </Transition>
      
      <!-- 联系卡片（移到 sidebar-drawer 外部，不受 backdrop-filter 影响） -->
      <Transition name="contact-card">
        <div v-if="showContactCard" class="contact-card" @click.stop>
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
      
      <!-- 点击外部关闭（全屏遮罩，移到 sidebar-drawer 外部） -->
      <Transition name="fade">
        <div v-if="showContactCard" class="contact-overlay" @click="showContactCard = false"></div>
      </Transition>
      
      </div>
  </Teleport>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  display: flex;
}

.sidebar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.sidebar-drawer {
  position: relative;
  height: 100%;
  width: 220px;
  max-width: 75%;
  background: rgba(var(--color-bg-view-rgb), 0.88);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-right: 1px solid rgba(var(--color-primary-rgb), 0.15);
  box-shadow: 10px 0 40px rgba(0, 0, 0, 0.2),
              0 0 30px rgba(var(--color-primary-rgb), 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--color-border), 0.4);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.15);
  border-radius: 10px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
}

.logo-music {
  color: var(--color-primary);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  
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

.header-decoration {
  display: flex;
  gap: 6px;
}

.glow-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

.glow-dot:nth-child(2) {
  animation-delay: 0.3s;
  opacity: 0.7;
}

.glow-dot:nth-child(3) {
  animation-delay: 0.6s;
  opacity: 0.4;
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.menu-group {
  margin-bottom: 24px;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
}

.title-star {
  color: rgba(var(--color-primary-rgb), 0.5);
  font-size: 8px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  border-radius: 14px;
  background: rgba(var(--color-bg-view-rgb), 0.6);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.menu-card:hover {
  background: rgba(var(--color-bg-tertiary), 0.4);
  transform: translateX(4px);
  border-color: rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08),
              0 0 12px rgba(var(--color-primary-rgb), 0.1);
}

.menu-card.active {
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.15),
              inset 0 0 30px rgba(var(--color-primary-rgb), 0.05);
}

.card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 10px;
  color: var(--color-text-secondary);
  transition: all 0.25s ease;
}

.menu-card:hover .card-icon {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.15);
}

.menu-card.active .card-icon {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.2);
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
}

.card-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: color 0.25s ease;
}

.menu-card:hover .card-label,
.menu-card.active .card-label {
  color: var(--color-text-main);
}

.menu-card.active .card-label {
  color: var(--color-primary);
  font-weight: 500;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px var(--color-primary);
}

.drawer-footer {
  padding: 16px 20px;
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
  font-size: 11px;
  color: var(--color-text-secondary);
}

.text-icon {
  font-size: 12px;
}

.footer-subtext {
  font-size: 10px;
  color: var(--color-text-description);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active {
  animation: slide-in-right 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-right-leave-active {
  animation: slide-out-right 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slide-in-right {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 8px var(--color-primary);
  }
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary-rgb), 0.5);
}

/* ========== 联系卡片容器 ========== */
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

/* ========== 联系卡片头部 ========== */
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

/* ========== 邮箱显示 ========== */
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

/* ========== 操作按钮组 ========== */
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

/* ========== 联系卡片展开动画 ========== */
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

/* ========== 遮罩层 ========== */
.contact-overlay {
  position: fixed;
  inset: 0;
  z-index: 105;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  cursor: pointer;
}

/* ========== Toast 提示 ========== */
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