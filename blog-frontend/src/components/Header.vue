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
          {{ item.label }}
        </router-link>

        <!-- Auth Items -->
        <template v-if="!authStore.isLoggedIn">
          <router-link to="/login" class="nav-link nav-link--subtle">
            登录
          </router-link>
          <router-link to="/register" class="nav-link nav-link--accent">
            注册
          </router-link>
        </template>
        <template v-else>
          <div class="user-dropdown">
            <button @click="toggleUserMenu" class="user-info-btn">
              <span class="user-name">用户 {{ authStore.user?.username || '' }}</span>
              <svg class="dropdown-arrow" :class="{ 'dropdown-arrow--open': userMenuOpen }" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <transition name="dropdown">
              <div v-if="userMenuOpen" class="user-menu">
                <div class="user-menu-header">
                  <div class="user-avatar">👤</div>
                  <div class="user-details">
                    <span class="user-display-name">用户 {{ authStore.user?.username || '' }}</span>
                  </div>
                </div>
                <div class="user-menu-divider"></div>
                <button @click="handlePasswordChange" class="user-menu-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" fill="none" stroke-width="1.5"/>
                  </svg>
                  <span>修改密码</span>
                </button>
                <button @click="handleLogout" class="user-menu-item user-menu-item--danger">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>退出登录</span>
                </button>
              </div>
            </transition>
          </div>
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
            <div class="mobile-user-info">
              <div class="mobile-user-avatar">👤</div>
              <span class="mobile-user-name">{{ authStore.user?.username || '用户' }}</span>
            </div>
            <button @click="handleLogoutAndClose" class="mobile-nav-link mobile-nav-link--logout">
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
const userMenuOpen = ref(false)

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

const toggleUserMenu = (): void => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = (): void => {
  userMenuOpen.value = false
}

const handleLogoClick = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = () => {
  authStore.logout()
  closeUserMenu()
}

const handleLogoutAndClose = () => {
  authStore.logout()
  closeMobileMenu()
}

const handlePasswordChange = () => {
  // TODO: 实现修改密码功能
  alert('修改密码功能开发中...')
  closeUserMenu()
}

const handleScroll = (): void => {
  isScrolled.value = window.scrollY > 20
}

// 点击外部关闭下拉菜单
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const userMenu = document.querySelector('.user-menu')
  const userBtn = document.querySelector('.user-info-btn')

  if (userMenuOpen.value && userMenu && userBtn) {
    if (!userMenu.contains(target) && !userBtn.contains(target)) {
      closeUserMenu()
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleDocumentClick)
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
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  color: var(--stone-600);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-wide);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.nav-link:hover {
  color: var(--ink-900);
}

.nav-link--active {
  color: var(--ink-900);
}

.nav-link--active::after {
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

.nav-link--button:hover {
  color: var(--vermilion);
}

/* User Dropdown */
.user-dropdown {
  position: relative;
}

.user-info-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--stone-100);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.user-info-btn:hover {
  background: var(--stone-200);
}

.user-name {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--ink-900);
}

.dropdown-arrow {
  color: var(--stone-600);
  transition: transform var(--duration-fast) var(--ease-out-quart);
}

.dropdown-arrow--open {
  transform: rotate(180deg);
}

/* User Menu Dropdown */
.user-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 220px;
  background: var(--color-surface);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--stone-50);
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vermilion-dim);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xl);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.user-display-name {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
}

.user-role {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-600);
}

.user-menu-divider {
  height: 1px;
  background: var(--stone-200);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  text-align: left;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-700);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.user-menu-item:hover {
  background: var(--stone-100);
  color: var(--ink-900);
}

.user-menu-item--danger {
  color: var(--vermilion);
}

.user-menu-item--danger:hover {
  background: var(--vermilion-dim);
  color: var(--vermilion);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--vermilion);
  border-radius: var(--radius-full);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
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

/* Mobile User Info */
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
  width: 100%;
}

.mobile-user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vermilion-dim);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xl);
}

.mobile-user-name {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
}

.mobile-nav-link--logout {
  border-top: 1px solid var(--stone-100);
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
