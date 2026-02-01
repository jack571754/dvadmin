<template>
  <div class="about-page">
    <!-- Page Header -->
    <header class="about-header">
      <div class="header-inner">
        <h1 class="about-title">关于本站</h1>
        <p class="about-subtitle">{{ blogConfig.description }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <div class="about-layout">
      <!-- Sidebar -->
      <aside class="about-sidebar">
        <nav class="sidebar-nav">
          <a
            v-for="(section, index) in sections"
            :key="index"
            :href="`#${section.id}`"
            :class="['nav-link', { 'nav-link--active': activeSection === section.id }]"
            @click="scrollToSection(section.id)"
          >
            <span class="nav-icon">{{ section.icon }}</span>
            <span>{{ section.label }}</span>
          </a>
        </nav>
      </aside>

      <!-- Content -->
      <main class="about-content">
        <section id="intro" class="content-section">
          <h2 class="section-title">欢迎来到我的博客</h2>
          <p class="section-text">
            这是一个基于 Vue 3、TypeScript 和 Vite 构建的现代化博客系统。后端使用 Django REST Framework 提供 API 支持，
            致力于为读者提供优质的阅读体验。
          </p>
        </section>

        <section id="tech" class="content-section">
          <h2 class="section-title">技术栈</h2>
          <div class="tech-grid">
            <div class="tech-card">
              <h3 class="tech-card-title">前端技术</h3>
              <ul class="tech-list">
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Vue 3.4.38
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  TypeScript 4.9.4
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Vite 5.4.1
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Vue Router 4
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Pinia
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Markdown-it
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--green">✓</span>
                  Highlight.js
                </li>
              </ul>
            </div>

            <div class="tech-card">
              <h3 class="tech-card-title">后端技术</h3>
              <ul class="tech-list">
                <li class="tech-item">
                  <span class="tech-icon tech-icon--blue">✓</span>
                  Django 4.2
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--blue">✓</span>
                  Django REST Framework
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--blue">✓</span>
                  SQLite / MySQL
                </li>
                <li class="tech-item">
                  <span class="tech-icon tech-icon--blue">✓</span>
                  JWT 认证
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" class="content-section">
          <h2 class="section-title">功能特性</h2>
          <ul class="features-list">
            <li class="feature-item">
              <span class="feature-icon">●</span>
              <span>响应式设计，完美适配各种设备</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">●</span>
              <span>Markdown 文章渲染，支持代码高亮</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">●</span>
              <span>文章归档，按年份浏览</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">●</span>
              <span>阅读统计，追踪文章热度</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">●</span>
              <span>优雅的页面过渡动画</span>
            </li>
          </ul>
        </section>

        <section id="contact" class="content-section">
          <h2 class="section-title">联系方式</h2>
          <div class="contact-links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-link"
            >
              <span class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </span>
              GitHub
            </a>
            <a
              href="mailto:contact@example.com"
              class="contact-link"
            >
              <span class="contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              Email
            </a>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const blogConfig = ref({
  description: '关于技术、设计与思考的记录'
})

const sections = [
  { id: 'intro', label: '简介', icon: '' },
  { id: 'tech', label: '技术栈', icon: '' },
  { id: 'features', label: '功能', icon: '' },
  { id: 'contact', label: '联系', icon: '' },
]

const activeSection = ref('intro')

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleScroll = () => {
  const sections = document.querySelectorAll('.content-section')
  const scrollPosition = window.scrollY + 200

  sections.forEach((section) => {
    const element = section as HTMLElement
    const top = element.offsetTop
    const bottom = top + element.offsetHeight

    if (scrollPosition >= top && scrollPosition < bottom) {
      activeSection.value = element.id
    }
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* ========================================
   Header
   ======================================== */

.about-header {
  padding: var(--space-16) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--stone-100);
  border-bottom: 1px solid var(--stone-200);
}

.header-inner {
  max-width: var(--container-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--ink-900);
  margin: 0 0 var(--space-4) 0;
  letter-spacing: var(--letter-snug);
}

.about-subtitle {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-light);
  color: var(--stone-600);
  margin: 0;
}

/* ========================================
   Layout
   ======================================== */

.about-layout {
  display: flex;
  max-width: var(--container-6xl);
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-20);
  gap: var(--space-12);
}

/* ========================================
   Sidebar
   ======================================== */

.about-sidebar {
  position: sticky;
  top: var(--space-8);
  width: 180px;
  height: fit-content;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.nav-link:hover {
  color: var(--ink-900);
  background: var(--stone-100);
}

.nav-link--active {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.nav-icon {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.nav-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.nav-link--active .nav-icon::before {
  background: var(--vermilion);
}

/* ========================================
   Content
   ======================================== */

.about-content {
  flex: 1;
  min-width: 0;
}

.content-section {
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--stone-200);
}

.content-section:last-child {
  border-bottom: none;
}

.section-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
  margin: 0 0 var(--space-6) 0;
}

.section-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
}

/* Tech Stack */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.tech-card {
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.tech-card-title {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
  margin: 0 0 var(--space-4) 0;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
}

.tech-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.tech-icon--green {
  color: #22c55e;
}

.tech-icon--blue {
  color: #3b82f6;
}

/* Features */
.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.feature-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
}

.feature-icon {
  color: var(--vermilion);
  flex-shrink: 0;
  margin-top: -2px;
}

/* Contact */
.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.contact-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.contact-link:hover {
  color: var(--vermilion);
}

.contact-icon {
  display: flex;
  color: var(--stone-500);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.contact-link:hover .contact-icon {
  color: var(--vermilion);
}

/* ========================================
   Responsive
   ======================================== */

@media (max-width: 768px) {
  .about-header {
    padding: var(--space-16) var(--space-4);
  }

  .about-layout {
    flex-direction: column;
    padding: 0 var(--space-4) var(--space-16);
  }

  .about-sidebar {
    position: static;
    width: 100%;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }

  .nav-link {
    flex-shrink: 0;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: var(--space-6) 0;
  }
}
</style>
