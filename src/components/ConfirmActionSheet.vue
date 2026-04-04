<script setup lang="ts">
interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消'
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleOverlayClick = () => {
  emit('cancel');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="visible" 
        class="confirm-overlay"
        @click="handleOverlayClick"
      />
    </Transition>
    
    <Transition name="slide-up">
      <div v-if="visible" class="confirm-sheet">
        <div class="sheet-header">
          <div class="sheet-title">{{ title }}</div>
          <div v-if="message" class="sheet-message">{{ message }}</div>
        </div>
        
        <div class="sheet-actions">
          <button class="confirm-btn" @click="handleConfirm">
            {{ confirmText }}
          </button>
          <button class="cancel-btn" @click="handleCancel">
            {{ cancelText }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
}

.confirm-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-bg-view-rgb), 0.98);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  z-index: 101;
  padding: 24px 20px 20px;
}

.sheet-header {
  text-align: center;
  margin-bottom: 24px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  line-height: 1.5;
}

.sheet-message {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 8px;
  line-height: 1.4;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.confirm-btn {
  width: 180px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb), 0.3);
}

.cancel-btn {
  width: 180px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: rgba(var(--color-bg-tertiary), 0.8);
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(var(--color-bg-tertiary), 1);
}

.cancel-btn:active {
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .confirm-sheet,
  .confirm-overlay {
    display: none;
  }
}
</style>