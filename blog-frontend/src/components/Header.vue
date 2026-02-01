<template>
  <header class="site-header" :class="{ 'site-header--scrolled': isScrolled }">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="header-logo" @click="handleLogoClick">
        <span class="logo-text">思·录</span>
        <span class="logo-decoration"></span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="header-nav desktop-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'nav-link--active': isActive(item.path) }"
        >
          <span class="nav-text">{{ item.label }}</span>
          <span class="nav-indicator"></span>
        </router-link>

        <!-- Auth Items -->
        <template v-if="!authStore.isLoggedIn">
          <router-link to="/login" class="nav-link nav-link--subtle">
            <span class="nav-text">登录</span>
          </router-link>
          <router-link to="/register" class="nav-link nav-link--accent">
            <span class="nav-text">注册</span>
          </router-link>
        </template>
        <template v-else>
          <span class="nav-link nav-link--user">
            <span class="nav-text">{{ authStore.user?.username || '用户' }}</span>
          </span>
          <button @click="handleLogout" class="nav-link nav-link--button">
            <span class="nav-text">退出</span>
          </button>
        </template>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-toggle"
        :class="{ 'mobile-toggle--active': mobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <span class="hamburger">
          <span class="hamburger-line hamburger-line--1"></span>
          <span class="hamburger-line hamburger-line--2"></span>
          <span class="hamburger-line hamburger-line--3"></span>
        </span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="mobile-nav-link"
            :class="{ 'mobile-nav-link--active': isActive(item.path) }"
            @click="closeMobileMenu"
          >
            <span class="mobile-nav-text">{{ item.label }}</span>
            <span class="mobile-nav-indicator"></span>
          </router-link>

          <div class="mobile-nav-divider"></div>

          <template v-if="!authStore.isLoggedIn">
            <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">
              <span class="mobile-nav-text">登录</span>
            </router-link>
            <router-link to="/register" class="mobile-nav-link mobile-nav-link--accent" @click="closeMobileMenu">
              <span class="mobile-nav-text">注册</span>
            </router-link>
          </template>
          <template v-else>
            <span class="mobile-nav-link mobile-nav-link--user">
              <span class="mobile-nav-text">{{ authStore.user?.username || '用户' }}</span>
            </span>
            <button @click="handleLogout" class="mobile-nav-link">
              <span class="mobile-nav-text">退出</span>
            </button>
          </template>
        </nav>
      </div>
    </transition>

    <!-- Menu Overlay -->
    <transition name="overlay">
      <div
        v-if="mobileMenuOpen"
        class="menu-overlay"
        @click="closeMobileMenu"
      ></div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  label: string
  path: string
}

const route = useRoute()
const authStore = useAuthStore()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)

const navItems: NavItem[] = [
  { label: '首页', path: '/' },
  { label: '归档', path: '/archive' },
  { label: '关于', path: '/about' },
]

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const toggleMobileMenu = (): void => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = (): void => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleLogoClick = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
}

const handleScroll = (): void => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: transparent;
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.site-header--scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: var(--container-7xl);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ========================================
   Logo
   ======================================== */

.header-logo {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
}

.logo-text {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  color: var(--ink-900);
  letter-spacing: var(--letter-snug);
  line-height: 1;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.header-logo:hover .logo-text {
  color: var(--vermilion);
}

.logo-decoration {
  width: 20px;
  height: 2px;
  background: var(--vermilion);
  margin-top: var(--space-1);
  border-radius: var(--radius-full);
}

/* ========================================
   Desktop Navigation
   ======================================== */

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  color: var(--stone-600);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.nav-link:hover {
  color: var(--ink-900);
}

.nav-link--active {
  color: var(--ink-900);
}

.nav-link--active .nav-indicator {
  transform: scaleX(1);
}

.nav-link--accent {
  color: var(--vermilion);
}

.nav-link--subtle {
  color: var(--stone-500);
}

.nav-link--user {
  cursor: default;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--stone-500);
}

.nav-link--button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--stone-600);
}

.nav-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-wide);
}

.nav-indicator {
  position: absolute;
  bottom: var(--space-1);
  left: 50%;
  width: 20px;
  height: 2px;
  background: var(--vermilion);
  border-radius: var(--radius-full);
  transform: translateX(-50%) scaleX(0);
  transition: transform var(--duration-normal) var(--ease-out-quart);
}

/* ========================================
   Mobile Toggle
   ======================================== */

.mobile-toggle {
  display: none;
  width: 32px;
  height: 32px;
  padding: var(--space-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.hamburger {
  position: relative;
  width: 100%;
  height: 100%;
}

.hamburger-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--ink-900);
  border-radius: var(--radius-full);
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.hamburger-line--1 {
  top: 6px;
}

.hamburger-line--2 {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-line--3 {
  bottom: 6px;
}

.mobile-toggle--active .hamburger-line--1 {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.mobile-toggle--active .hamburger-line--2 {
  opacity: 0;
}

.mobile-toggle--active .hamburger-line--3 {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

/* ========================================
   Mobile Menu
   ======================================== */

.mobile-menu {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-surface);
  overflow-y: auto;
  z-index: var(--z-modal);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
}

.mobile-nav-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-3);
  text-decoration: none;
  color: var(--stone-700);
  border-bottom: 1px solid var(--stone-100);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.mobile-nav-link:first-child {
  border-top: 1px solid var(--stone-100);
}

.mobile-nav-link:hover,
.mobile-nav-link--active {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.mobile-nav-link--accent {
  color: var(--vermilion);
}

.mobile-nav-link--user {
  cursor: default;
  color: var(--stone-500);
  font-size: var(--font-size-sm);
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-nav-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.mobile-nav-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vermilion);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-quart);
}

.mobile-nav-link--active .mobile-nav-indicator {
  opacity: 1;
}

.mobile-nav-divider {
  height: 1px;
  background: var(--stone-200);
  margin: var(--space-4) 0;
}

/* ========================================
   Menu Overlay
   ======================================== */

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: calc(var(--z-modal) - 1);
}

/* ========================================
   Transitions
   ======================================== */

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: transform var(--duration-normal) var(--ease-out-quart);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  transform: translateY(-100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out-quart);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ========================================
   Responsive
   ======================================== */

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }

  .header-container {
    padding: var(--space-3) var(--space-4);
  }

  .logo-text {
    font-size: var(--font-size-lg);
  }
}
</style>
