<template>
  <div id="app" class="app" :class="{ 'app--dark': isDarkMode }">
    <Header />

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>

    <Footer
      :blog-name="blogConfig.name"
      :description="blogConfig.description"
      :nav-links="blogConfig.navLinks"
      :social-links="blogConfig.socialLinks"
    />

    <!-- Global Toast Container -->
    <div class="toast-container">
      <transition-group name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
        >
          <span class="toast-icon">{{ getToastIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="toast-close">×</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface NavLink {
  label: string
  path: string
}

interface SocialLink {
  name: string
  url: string
}

// State
const isDarkMode = ref(false)
const toasts = ref<Toast[]>([])
let toastId = 0

// Blog Configuration
const blogConfig = ref({
  name: '思·录',
  description: '关于技术、设计与思考的记录',
  navLinks: [
    { label: '首页', path: '/' },
    { label: '归档', path: '/archive' },
    { label: '关于', path: '/about' },
  ] as NavLink[],
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Email', url: 'mailto:hello@example.com' },
  ] as SocialLink[],
})

// Methods
const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = toastId++
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const getToastIcon = (type: string): string => {
  const icons = {
    success: '✓',
    error: '×',
    info: '○',
  }
  return icons[type] || icons.info
}

const checkDarkMode = () => {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  checkDarkMode()
  // Make toast available globally
  ;(window as any).addToast = addToast
})
</script>

<style>
/* Import Design System */
@import '@/assets/styles/variables.css';

/* ========================================
   App Base Styles
   ======================================== */

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  color: var(--color-primary);
  transition: background var(--duration-normal) var(--ease-out-quart),
              color var(--duration-normal) var(--ease-out-quart);
}

.app-main {
  flex: 1;
  position: relative;
}

/* ========================================
   Page Transition Animation
   ======================================== */

.page-enter-active,
.page-leave-active {
  transition: all var(--duration-slower) var(--ease-out-expo);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.98);
}

/* ========================================
   Base Element Styles
   ======================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-variant-ligatures: common-ligatures;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
  color: var(--color-primary);
  background-color: var(--color-background);
  overflow-x: hidden;
}

/* Links */
a {
  color: inherit;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

/* Buttons */
button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  color: inherit;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Focus Visible */
:focus-visible {
  outline: 2px solid var(--vermilion);
  outline-offset: 2px;
}

/* Selection */
::selection {
  background: var(--vermilion);
  color: white;
}

::-moz-selection {
  background: var(--vermilion);
  color: white;
}

/* ========================================
   Toast Container
   ======================================== */

.toast-container {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-tooltip);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--ink-900);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ink-lg);
  pointer-events: auto;
  min-width: 300px;
  max-width: 500px;
}

.toast--success {
  background: var(--ink-900);
}

.toast--error {
  background: #dc2626;
}

.toast--info {
  background: var(--ink-700);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast--success .toast-icon {
  color: #22c55e;
}

.toast--error .toast-icon {
  color: white;
}

.toast--info .toast-icon {
  color: var(--vermilion);
}

.toast-message {
  flex: 1;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: var(--font-size-lg);
  color: var(--stone-400);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.toast-close:hover {
  color: white;
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.toast-move {
  transition: transform var(--duration-normal) var(--ease-out-quart);
}

/* ========================================
   Scrollbar Styling
   ======================================== */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--stone-300);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--stone-400);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--stone-300) transparent;
}

/* ========================================
   Utility Classes
   ======================================== */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-serif { font-family: var(--font-serif); }
.font-sans { font-family: var(--font-sans); }
.font-mono { font-family: var(--font-mono); }

/* Spacing Utilities */
.mt-0 { margin-top: var(--space-0); }
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-5 { margin-top: var(--space-5); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }
.mt-10 { margin-top: var(--space-10); }
.mt-12 { margin-top: var(--space-12); }

.mb-0 { margin-bottom: var(--space-0); }
.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-5 { margin-bottom: var(--space-5); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }
.mb-10 { margin-bottom: var(--space-10); }
.mb-12 { margin-bottom: var(--space-12); }

.p-0 { padding: var(--space-0); }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-5 { padding: var(--space-5); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

/* ========================================
   Responsive Typography
   ======================================== */

@media (max-width: 768px) {
  html {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 14px;
  }

  .toast {
    min-width: auto;
    max-width: calc(100vw - var(--space-8));
  }
}

/* ========================================
   Print Styles
   ======================================== */

@media print {
  .site-header,
  .site-footer,
  .toast-container {
    display: none;
  }

  .app-main {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: underline;
  }
}
</style>
