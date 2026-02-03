<template>
  <article class="article-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="pulse-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">—</div>
      <h2 class="error-title">加载失败</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchArticle" class="btn-primary">重试</button>
        <button @click="goBack" class="btn-secondary">返回</button>
      </div>
    </div>

    <!-- Article Content -->
    <template v-else-if="article">
      <!-- Reading Progress Bar - 墨韵进度条 -->
      <div class="reading-progress">
        <div class="progress-track"></div>
        <div class="progress-fill" :style="{ width: readingProgress + '%' }"></div>
      </div>

      <!-- Back Navigation -->
      <nav class="article-nav">
        <button @click="goBack" class="nav-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>返回</span>
        </button>
        <div class="nav-meta">
          <span class="nav-date">{{ formatDate(article.createdAt) }}</span>
        </div>
      </nav>

      <!-- Article Header -->
      <header class="article-header">
        <!-- Category Badge -->
        <div v-if="article.category" class="category-badge">
          <span class="badge-icon">◇</span>
          <span>{{ article.category }}</span>
        </div>

        <!-- Title -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- Meta Information -->
        <div class="article-meta">
          <div class="meta-left">
            <time class="meta-date">{{ formatFullDate(article.createdAt) }}</time>
            <span v-if="article.author" class="meta-author">{{ article.author }}</span>
          </div>
          <div class="meta-right">
            <span class="meta-read-time">{{ readTime }} 分钟阅读</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="article.tags && article.tags.length" class="article-tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <!-- Divider -->
        <div class="header-divider">
          <span class="divider-dot"></span>
        </div>
      </header>

      <!-- Article Body -->
      <div class="article-body" ref="articleBodyRef">
        <div class="markdown-content" v-html="renderedContent" @click="handleCodeCopy"></div>
      </div>

      <!-- Article Footer -->
      <footer class="article-footer">
        <!-- Share Section -->
        <div class="share-section">
          <span class="share-label">分享</span>
          <div class="share-buttons">
            <a
              :href="twitterUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="share-btn"
              title="分享到 Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.5 4.5c-.4.2-.9.3-1.4.4.5-.3.9-.8 1.1-1.3-.5.3-1 .5-1.5.6-.4-.5-1-.8-1.7-.8-1.3 0-2.3 1-2.3 2.3 0 .2 0 .4.1.5-2-.1-3.7-1-4.9-2.4-.2.4-.3.8-.3 1.2 0 .8.4 1.5 1 2-.4 0-.7-.1-1-.3v.1c0 1.1.8 2 1.8 2.2-.2.1-.4.1-.6.1-.1 0-.3 0-.4-.1.3.9 1.1 1.5 2.1 1.5-.8.6-1.7.9-2.7.9-.2 0-.3 0-.5 0 1 .6 2.1 1 3.3 1 4 0 6.1-3.3 6.1-6.1v-.3c.4-.3.8-.7 1.1-1.1z"/>
              </svg>
            </a>
            <button
              @click="copyLink"
              class="share-btn"
              title="复制链接"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 9H4.5C3.1 9 2 7.9 2 6.5v-1C2 4.1 3.1 3 4.5 3h1M10 7h1.5c1.4 0 2.5 1.1 2.5 2.5v1c0 1.4-1.1 2.5-2.5 2.5h-1M5 8h6" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="article-navigation">
          <button @click="goBack" class="nav-btn">
            <span>← 返回列表</span>
          </button>
        </div>

        <!-- Decorative Element -->
        <div class="footer-decoration">
          <span class="decoration-seal">完</span>
        </div>
      </footer>
    </template>

    <!-- Not Found -->
    <div v-else class="not-found-state">
      <div class="not-found-icon">404</div>
      <h2 class="not-found-title">文章不存在</h2>
      <p class="not-found-message">抱歉，您访问的文章不存在或已被删除。</p>
      <button @click="goBack" class="btn-primary">返回上一页</button>
      <router-link to="/" class="btn-secondary">返回首页</router-link>
    </div>

    <!-- Copy Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <span class="toast-icon">✓</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { blogApi } from '@/api/blog'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'

// Register highlight.js languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)

interface Article {
  id: string
  title: string
  content: string
  createdAt: string
  category?: string
  author?: string
  tags?: string[]
  excerpt?: string
}

const route = useRoute()
const router = useRouter()
const articleBodyRef = ref<HTMLElement | null>(null)

// State
const article = ref<Article | null>(null)
const loading = ref(true)
const error = ref('')
const readingProgress = ref(0)
const showToast = ref(false)
const toastMessage = ref('')

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value
        return `<pre class="hljs"><code class="hljs">${highlighted}</code><button class="copy-btn" data-code="${encodeURIComponent(str)}" aria-label="复制代码">复制</button></pre>`
      } catch {
        // ignore
      }
    }
    return `<pre class="hljs"><code class="hljs">${md.utils.escapeHtml(str)}</code><button class="copy-btn" data-code="${encodeURIComponent(str)}" aria-label="复制代码">复制</button></pre>`
  },
})

// Computed
const renderedContent = computed(() => {
  if (!article.value) return ''
  return md.render(article.value.content)
})

const readTime = computed(() => {
  if (!article.value?.content) return 1
  const words = article.value.content.length / 5
  return Math.max(1, Math.ceil(words / 400))
})

const twitterUrl = computed(() => {
  if (!article.value) return ''
  const text = `${article.value.title} - ${window.location.href}`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
})

// Methods
const fetchArticle = async () => {
  loading.value = true
  error.value = ''

  try {
    const articleId = route.params.id as string
    article.value = await blogApi.getArticle(articleId)
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      article.value = null
    } else {
      error.value = err instanceof Error ? err.message : '发生未知错误'
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  router.back()
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToastNotification('链接已复制')
  } catch {
    showToastNotification('复制失败，请手动复制')
  }
}

const showToastNotification = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const handleCodeCopy = async (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('copy-btn')) {
    const code = decodeURIComponent(target.dataset.code || '')
    try {
      await navigator.clipboard.writeText(code)
      target.textContent = '已复制!'
      setTimeout(() => {
        target.textContent = '复制'
      }, 2000)
    } catch {
      showToastNotification('复制失败')
    }
  }
}

const handleScroll = () => {
  if (!articleBodyRef.value) return

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrolled = window.scrollY
  const progress = (scrolled / (documentHeight - windowHeight)) * 100

  readingProgress.value = Math.min(100, Math.max(0, progress))
}

// Lifecycle
onMounted(() => {
  fetchArticle()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  background: var(--color-background);
}

/* ========================================
   Reading Progress - 墨韵进度条
   ======================================== */

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: var(--z-fixed);
}

.progress-track {
  position: absolute;
  inset: 0;
  background: var(--stone-200);
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, var(--vermilion), #e85544);
  transition: width 0.1s ease-out;
}

/* ========================================
   Loading & Error States
   ======================================== */

.loading-state,
.error-state,
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--space-12);
  text-align: center;
}

.pulse-dots {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.pulse-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vermilion);
  animation: pulse 1.4s ease-in-out infinite;
}

.pulse-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.pulse-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-text,
.error-message,
.not-found-message {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
}

.error-icon,
.not-found-icon {
  font-family: var(--font-serif);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-black);
  color: var(--vermilion);
  margin-bottom: var(--space-4);
}

.error-title,
.not-found-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0 0 var(--space-3) 0;
}

.error-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.btn-primary,
.btn-secondary {
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.btn-primary {
  background: var(--vermilion);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #b33827;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--stone-700);
  border: 1px solid var(--stone-300);
}

.btn-secondary:hover {
  border-color: var(--stone-400);
  color: var(--ink-900);
}

/* ========================================
   Article Navigation
   ======================================== */

.article-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-4);
}

.nav-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  border-radius: var(--radius-base);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.nav-back:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.nav-meta {
  display: flex;
  align-items: center;
}

.nav-date {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

/* ========================================
   Article Header
   ======================================== */

.article-header {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-12);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  margin-bottom: var(--space-6);
  background: var(--vermilion-dim);
  border: 1px solid var(--vermilion-light);
  border-radius: var(--radius-full);
}

.badge-icon {
  font-size: var(--font-size-xs);
  color: var(--vermilion);
}

.category-badge span:last-child {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--vermilion);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.article-title {
  font-family: var(--font-serif);
  font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
  font-weight: var(--font-weight-black);
  color: var(--ink-900);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-6) 0;
  letter-spacing: var(--letter-snug);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.meta-left,
.meta-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.meta-date,
.meta-author,
.meta-read-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
}

.meta-date {
  font-variant-numeric: tabular-nums;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.tag {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-600);
  padding: var(--space-1) var(--space-2);
  background: var(--stone-100);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.tag:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vermilion);
}

/* ========================================
   Article Body
   ======================================== */

.article-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-20);
}

.markdown-content {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
  color: var(--ink-800);
}

/* Markdown Styles */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  font-family: var(--font-serif);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-snug);
  color: var(--ink-900);
  margin-top: var(--space-12);
  margin-bottom: var(--space-4);
}

.markdown-content :deep(h1) {
  font-size: var(--font-size-3xl);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--stone-200);
}

.markdown-content :deep(h2) {
  font-size: var(--font-size-2xl);
}

.markdown-content :deep(h3) {
  font-size: var(--font-size-xl);
}

.markdown-content :deep(h4) {
  font-size: var(--font-size-lg);
}

.markdown-content :deep(p) {
  margin-bottom: var(--space-5);
}

.markdown-content :deep(a) {
  color: var(--vermilion);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--duration-fast) var(--ease-out-quart);
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--vermilion);
}

.markdown-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: var(--stone-100);
  border-radius: var(--radius-sm);
  color: var(--indigo);
}

.markdown-content :deep(pre) {
  position: relative;
  margin: var(--space-8) 0;
  padding: var(--space-5);
  background: var(--ink-900);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--paper-50);
  font-size: var(--font-size-sm);
}

.markdown-content :deep(.copy-btn) {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  padding: var(--space-1) var(--space-3);
  background: rgba(255, 255, 255, 0.1);
  color: var(--stone-400);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.markdown-content :deep(.copy-btn:hover) {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  margin: var(--space-8) 0;
  box-shadow: var(--shadow-ink);
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--vermilion);
  padding: var(--space-4) var(--space-6);
  margin: var(--space-8) 0;
  background: var(--stone-50);
  color: var(--stone-700);
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: var(--space-5);
  padding-left: var(--space-8);
}

.markdown-content :deep(li) {
  margin-bottom: var(--space-2);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--space-8) 0;
  font-size: var(--font-size-base);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--stone-200);
}

.markdown-content :deep(th) {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  color: var(--stone-700);
  background: var(--stone-50);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--stone-200);
  margin: var(--space-12) 0;
}

/* ========================================
   Article Footer
   ======================================== */

.article-footer {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
  border-top: 1px solid var(--stone-200);
}

.share-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
}

.share-label {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wider);
  text-transform: uppercase;
}

.share-buttons {
  display: flex;
  gap: var(--space-3);
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--stone-600);
  background: var(--stone-100);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-full);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.share-btn:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion);
  transform: translateY(-2px);
}

.article-navigation {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-12);
}

.nav-btn {
  padding: var(--space-3) var(--space-8);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--stone-700);
  background: var(--stone-100);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.nav-btn:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion);
}

.footer-decoration {
  display: flex;
  justify-content: center;
}

.decoration-seal {
  font-family: var(--font-serif);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--stone-400);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--stone-300);
  border-radius: var(--radius-sm);
}

/* ========================================
   Toast Notification
   ======================================== */

.toast-notification {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--ink-900);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ink-lg);
  z-index: var(--z-modal);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--vermilion);
  border-radius: 50%;
  font-size: var(--font-size-xs);
}

.toast-message {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* ========================================
   Responsive Design
   ======================================== */

@media (max-width: 768px) {
  .article-nav,
  .article-header,
  .article-body,
  .article-footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .article-title {
    font-size: var(--font-size-3xl);
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .markdown-content {
    font-size: var(--font-size-base);
  }

  .markdown-content :deep(h1) {
    font-size: var(--font-size-2xl);
  }

  .markdown-content :deep(h2) {
    font-size: var(--font-size-xl);
  }
}
</style>
