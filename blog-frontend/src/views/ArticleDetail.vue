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
        <div class="article-nav-inner">
          <button @click="goBack" class="nav-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>返回</span>
          </button>
          <div class="nav-meta">
            <span class="nav-date">{{ formatDate(article.createdAt) }}</span>
            <!-- Admin Actions -->
            <div v-if="authStore.isAdmin" class="admin-actions">
              <button @click="openEditor" class="admin-btn edit-btn" title="编辑文章">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M11.5 2.5l2 2M2 12v2h2l8.5-8.5-2-2L2 12z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>编辑</span>
              </button>
              <button @click="handleDeleteArticle" class="admin-btn delete-btn" title="删除文章">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>删除</span>
              </button>
            </div>
          </div>
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
            <span class="meta-views">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 4.5 8 4.5s3.5 1.6 3.5 3.5S9.9 11.5 8 11.5z"/>
                <circle cx="8" cy="8" r="1.5"/>
              </svg>
              {{ article.viewsCount || 0 }}
            </span>
            <span class="meta-likes">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 14l-6-6c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0l.5.5.5-.5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5l-6 6z"/>
              </svg>
              {{ article.likesCount || 0 }}
            </span>
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

      <!-- Article Content with TOC -->
      <div class="article-content-wrapper">
        <!-- Article Body -->
        <div class="article-body" ref="articleBodyRef">
          <div class="markdown-content" v-html="renderedContent" @click="handleCodeCopy"></div>
        </div>

        <!-- Table of Contents - 右侧 -->
        <div class="toc-sidebar">
          <TableOfContents :content="renderedContent" />
        </div>
      </div>

      <!-- Article Footer -->
      <footer class="article-footer">
        <!-- Actions Row: Like + Share + Nav -->
        <div class="footer-actions">
          <!-- Like Button -->
          <button
            @click="handleLike"
            :disabled="liking"
            class="like-btn"
            :class="{ 'like-btn--liked': hasLiked }"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 14l-6-6c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0l.5.5.5-.5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5l-6 6z"/>
            </svg>
            <span>{{ hasLiked ? '已赞' : '点赞' }}</span>
            <span class="like-count">{{ article?.likesCount || 0 }}</span>
          </button>

          <!-- Right Side: Share + Nav -->
          <div class="footer-right">
            <div class="share-group">
              <a
                :href="twitterUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn"
                title="分享到 Twitter"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14.5 4.5c-.4.2-.9.3-1.4.4.5-.3.9-.8 1.1-1.3-.5.3-1 .5-1.5.6-.4-.5-1-.8-1.7-.8-1.3 0-2.3 1-2.3 2.3 0 .2 0 .4.1.5-2-.1-3.7-1-4.9-2.4-.2.4-.3.8-.3 1.2 0 .8.4 1.5 1 2-.4 0-.7-.1-1-.3v.1c0 1.1.8 2 1.8 2.2-.2.1-.4.1-.6.1-.1 0-.3 0-.4-.1.3.9 1.1 1.5 2.1 1.5-.8.6-1.7.9-2.7.9-.2 0-.3 0-.5 0 1 .6 2.1 1 3.3 1 4 0 6.1-3.3 6.1-6.1v-.3c.4-.3.8-.7 1.1-1.1z"/>
                </svg>
              </a>
              <button @click="copyLink" class="action-btn" title="复制链接">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M6 9H4.5C3.1 9 2 7.9 2 6.5v-1C2 4.1 3.1 3 4.5 3h1M10 7h1.5c1.4 0 2.5 1.1 2.5 2.5v1c0 1.4-1.1 2.5-2.5 2.5h-1M5 8h6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <button @click="goBack" class="action-btn nav-return">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M10 3L5 8L10 13" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>返回</span>
            </button>
          </div>
        </div>

        <!-- Decorative Seal -->
        <div class="footer-seal">
          <span class="seal-text">完</span>
        </div>
      </footer>

      <!-- Comments Section (Collapsible) -->
      <div class="comments-wrapper">
        <button class="comments-toggle" @click="commentsExpanded = !commentsExpanded">
          <svg class="toggle-icon" :class="{ expanded: commentsExpanded }" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 6L8 10L12 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="toggle-text">{{ commentsExpanded ? '收起评论' : '展开评论' }}</span>
        </button>
        <transition name="collapse">
          <div v-show="commentsExpanded" class="comments-content">
            <CommentSection v-if="article" :article-id="article.id" />
          </div>
        </transition>
      </div>
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

    <!-- Article Editor Modal (Admin Only) -->
    <ArticleEditor
      v-if="authStore.isAdmin"
      v-model:visible="showEditor"
      :article="article"
      :categories="categories"
      :tags="tags"
      @saved="handleArticleSaved"
    />
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { blogApi, type Category, type Tag } from '@/api/blog'
import type { Article } from '@/types/blog'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import CommentSection from '@/components/CommentSection.vue'
import ArticleEditor from '@/components/admin/ArticleEditor.vue'
import TableOfContents from '@/components/TableOfContents.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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

const LIKED_ARTICLES_KEY = 'blog_liked_articles'

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
const liking = ref(false)
const hasLiked = ref(false)
const commentsExpanded = ref(false)

// Editor state
const showEditor = ref(false)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// Check if article was liked before
const checkLikedStatus = (articleId: string) => {
  try {
    const liked = JSON.parse(localStorage.getItem(LIKED_ARTICLES_KEY) || '[]')
    hasLiked.value = liked.includes(articleId)
  } catch {
    hasLiked.value = false
  }
}

// Save liked status
const saveLikedStatus = (articleId: string) => {
  try {
    const liked = JSON.parse(localStorage.getItem(LIKED_ARTICLES_KEY) || '[]')
    if (!liked.includes(articleId)) {
      liked.push(articleId)
      localStorage.setItem(LIKED_ARTICLES_KEY, JSON.stringify(liked))
    }
  } catch {
    // ignore
  }
}

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    // Detect language
    let detectedLang = lang
    if (!detectedLang) {
      // Simple auto-detection based on content
      if (str.includes('def ') || str.includes('import ')) detectedLang = 'python'
      else if (str.includes('function ') || str.includes('const ') || str.includes('let ')) detectedLang = 'javascript'
      else if (str.includes('interface ') || str.includes(': string') || str.includes(': number')) detectedLang = 'typescript'
      else detectedLang = 'code'
    }

    // Highlight code
    let highlighted: string = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    if (detectedLang && hljs.getLanguage(detectedLang)) {
      try {
        highlighted = hljs.highlight(str, { language: detectedLang }).value
      } catch {
        // ignore
      }
    }

    // Generate line numbers
    const lines = str.split('\n')
    const lineNumbers = lines.slice(0, -1).map((_, i) => `<span class="line-number">${i + 1}</span>`).join('\n')

    // Build Mac-style code block HTML
    return `
      <div class="code-block mac-style">
        <div class="code-header">
          <span class="window-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </span>
          <span class="code-lang">${detectedLang}</span>
          <button class="copy-btn" data-code="${encodeURIComponent(str)}" aria-label="复制代码">复制</button>
        </div>
        <div class="code-body">
          <pre class="line-numbers">${lineNumbers}</pre>
          <pre class="code-content"><code class="hljs">${highlighted}</code></pre>
        </div>
      </div>
    `
  },
})

// Add heading IDs for TOC
const originalHeadingOpen = md.renderer.rules.heading_open || function(tokens: any[], idx: number, options: any, _env: any, self: any): string {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.heading_open = function(tokens: any[], idx: number, options: any, _env: any, self: any): string {
  const token = tokens[idx]
  const contentToken = tokens[idx + 1]
  if (contentToken && contentToken.type === 'inline') {
    const text = contentToken.content || ''
    const slug = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
    token.attrSet('id', slug)
  }
  return originalHeadingOpen(tokens, idx, options, _env, self)
}

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
    checkLikedStatus(articleId)
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

const fetchCategoriesAndTags = async () => {
  try {
    const [cats, tagsList] = await Promise.all([
      blogApi.getCategories(),
      blogApi.getTags(),
    ])
    categories.value = cats
    tags.value = tagsList
  } catch (err) {
    console.error('Failed to fetch categories/tags:', err)
  }
}

const openEditor = () => {
  showEditor.value = true
}

const handleArticleSaved = (updatedArticle: Article) => {
  article.value = updatedArticle
  showToastNotification('文章保存成功')
}

const handleDeleteArticle = async () => {
  if (!article.value?.id) return
  
  if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
    return
  }

  try {
    await blogApi.deleteArticle(article.value.id)
    showToastNotification('文章已删除')
    router.push('/')
  } catch (err) {
    console.error('Failed to delete article:', err)
    showToastNotification('删除失败，请重试')
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

const handleLike = async () => {
  if (!article.value || liking.value || hasLiked.value) return
  
  liking.value = true
  try {
    const result = await blogApi.likeArticle(article.value.id)
    article.value.likesCount = result.likes_count
    hasLiked.value = true
    saveLikedStatus(article.value.id)
    showToastNotification('点赞成功，感谢支持！')
  } catch (err) {
    console.error('Failed to like article:', err)
    showToastNotification('点赞失败，请重试')
  } finally {
    liking.value = false
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
  
  // Fetch categories and tags if user is admin
  if (authStore.isAdmin) {
    fetchCategoriesAndTags()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  background: var(--color-background);
  padding-top: 64px;
}

/* ========================================
   Reading Progress
   ======================================== */

.reading-progress {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  height: 2px;
  z-index: calc(var(--z-sticky) + 1);
  background: transparent;
}

.progress-track {
  display: none;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--vermilion);
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
   Article Navigation - 悬浮上层
   ======================================== */

.article-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 56px;
  background: var(--paper-50);
  z-index: 10;
}

.article-nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
}

.nav-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  background: transparent;
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
  gap: var(--space-4);
}

.nav-date {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.edit-btn {
  color: var(--stone-600);
  background: transparent;
  border: 1px solid var(--stone-300);
}

.edit-btn:hover {
  color: var(--indigo);
  background: rgba(79, 70, 229, 0.1);
  border-color: var(--indigo);
}

.delete-btn {
  color: var(--stone-600);
  background: transparent;
  border: 1px solid var(--stone-300);
}

.delete-btn:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion);
}

/* ========================================
   Article Header
   ======================================== */

.article-header {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-10);
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
.meta-read-time,
.meta-views,
.meta-likes {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  display: flex;
  align-items: center;
  gap: var(--space-1);
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
   Article Content with TOC
   ======================================== */

.article-content-wrapper {
  display: flex;
  max-width: 1100px;
  margin: 0 auto;
  gap: var(--space-8);
  padding: 0 var(--space-6);
}

/* 文章主体 */
.article-body {
  flex: 1;
  min-width: 0;
  max-width: 720px;
  padding: 0 0 var(--space-16);
}

/* 目录侧边栏 - 右侧 */
.toc-sidebar {
  flex-shrink: 0;
  width: 220px;
  padding-top: var(--space-4);
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

/* Mac-style Code Block */
.markdown-content :deep(.code-block.mac-style) {
  margin: var(--space-6) 0;
  background: #1e1e1e;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.markdown-content :deep(.code-header) {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.markdown-content :deep(.window-dots) {
  display: flex;
  gap: var(--space-2);
}

.markdown-content :deep(.dot) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.markdown-content :deep(.dot.red) {
  background: #ff5f56;
}

.markdown-content :deep(.dot.yellow) {
  background: #ffbd2e;
}

.markdown-content :deep(.dot.green) {
  background: #27c93f;
}

.markdown-content :deep(.code-lang) {
  flex: 1;
  text-align: center;
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: #888;
  text-transform: uppercase;
  letter-spacing: var(--letter-wide);
}

.markdown-content :deep(.copy-btn) {
  padding: var(--space-1) var(--space-2);
  background: transparent;
  color: #888;
  border: 1px solid #444;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.markdown-content :deep(.copy-btn:hover) {
  background: #3d3d3d;
  color: #fff;
  border-color: #555;
}

.markdown-content :deep(.code-body) {
  display: flex;
  overflow-x: auto;
}

.markdown-content :deep(.line-numbers) {
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-3);
  margin: 0;
  background: #252525;
  border-right: 1px solid #3d3d3d;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: #555;
  text-align: right;
  user-select: none;
  min-width: 50px;
}

.markdown-content :deep(.line-number) {
  display: block;
}

.markdown-content :deep(.code-content) {
  flex: 1;
  padding: var(--space-4);
  margin: 0;
  background: #1e1e1e;
  overflow-x: auto;
}

.markdown-content :deep(.code-content code) {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: #d4d4d4;
  background: transparent;
  padding: 0;
  white-space: pre;
}

/* Inline code (not in code-block) */
.markdown-content :deep(p code),
.markdown-content :deep(li code),
.markdown-content :deep(td code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: var(--stone-100);
  border-radius: var(--radius-sm);
  color: var(--indigo);
}

/* Legacy pre/code support */
.markdown-content :deep(pre:not(.line-numbers):not(.code-content)) {
  position: relative;
  margin: var(--space-8) 0;
  padding: var(--space-5);
  background: var(--ink-900);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.markdown-content :deep(pre:not(.line-numbers):not(.code-content)) code {
  background: transparent;
  padding: 0;
  color: var(--paper-50);
  font-size: var(--font-size-sm);
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
   Article Footer - Horizontal Layout
   ======================================== */

.article-footer {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-6);
  border-top: 1px solid var(--stone-200);
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.like-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--stone-600);
  background: var(--stone-100);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.like-btn:hover:not(:disabled) {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: var(--vermilion-dim);
}

.like-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.like-btn--liked {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: var(--vermilion-dim);
}

.like-count {
  font-variant-numeric: tabular-nums;
  padding: var(--space-1) var(--space-2);
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.share-group {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--stone-600);
  background: transparent;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
  text-decoration: none;
}

.action-btn:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion);
}

.nav-return {
  background: var(--stone-50);
}

.footer-seal {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

.seal-text {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--stone-400);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-sm);
  letter-spacing: var(--letter-wide);
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
   Comments Wrapper - Collapsible
   ======================================== */

.comments-wrapper {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-12);
}

.comments-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--stone-600);
  background: var(--stone-50);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.comments-toggle:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion);
}

.toggle-icon {
  transition: transform var(--duration-fast) var(--ease-out-quart);
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.toggle-text {
  letter-spacing: var(--letter-wide);
}

.comments-content {
  margin-top: var(--space-4);
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
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
