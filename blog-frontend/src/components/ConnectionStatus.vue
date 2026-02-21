<template>
  <div v-if="!isBackendReady" class="connection-status">
    <div class="connection-status__content">
      <div class="connection-status__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
            <animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" from="32" to="0"/>
          </circle>
        </svg>
      </div>
      <div class="connection-status__text">
        <p class="connection-status__title">正在连接后端服务...</p>
        <p class="connection-status__subtitle">请确保后端服务 (localhost:10025) 已启动</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isBackendAvailable } from '@/api/blog'

const isBackendReady = ref(false)
let checkInterval: NodeJS.Timeout | null = null

const checkBackendConnection = async () => {
  const available = await isBackendAvailable()
  if (available) {
    isBackendReady.value = true
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }
}

onMounted(() => {
  // 立即检查一次
  checkBackendConnection()
  
  // 如果未连接，每3秒检查一次
  checkInterval = setInterval(checkBackendConnection, 3000)
})
</script>

<style scoped>
.connection-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.connection-status__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  padding: var(--space-8);
}

.connection-status__icon {
  color: var(--color-accent);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.connection-status__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.connection-status__title {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0;
}

.connection-status__subtitle {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-muted);
  margin: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>