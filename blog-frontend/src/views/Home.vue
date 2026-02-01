<template>
  <div class="home-page">
    <!-- Hero Section - 墨韵开篇 -->
    <section class="hero" :class="{ 'hero--scrolled': isScrolled }">
      <div class="hero-inner">
        <!-- 装饰元素 -->
        <div class="hero-decoration">
          <span class="decoration-line decoration-line--left"></span>
          <span class="decoration-seal">思·录</span>
          <span class="decoration-line decoration-line--right"></span>
        </div>

        <!-- 主标题 - 动态文字效果 -->
        <h1 class="hero-title">
          <span
            v-for="(char, index) in titleChars"
            :key="index"
            class="title-char"
            :style="{ animationDelay: `${index * 50}ms` }"
          >{{ char }}</span>
        </h1>

        <!-- 副标题 -->
        <p class="hero-subtitle">
          <span class="subtitle-line">{{ blogConfig.description }}</span>
        </p>

        <!-- 滚动提示 -->
        <div class="scroll-hint">
          <span class="scroll-text">向下滚动</span>
          <span class="scroll-arrow">↓</span>
        </div>
      </div>

      <!-- 背景装饰 -->
      <div class="hero-bg">
        <div class="bg-circle bg-circle--1"></div>
        <div class="bg-circle bg-circle--2"></div>
        <div class="bg-circle bg-circle--3"></div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="main-layout">
      <!-- Sidebar - 可折叠 -->
      <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
        <button
          @click="toggleSidebar"
          class="sidebar-toggle"
          :title="sidebarCollapsed ? '展开' : '收起'"
        >
          <span class="toggle-icon" :class="{ 'toggle-icon--rotated': sidebarCollapsed }">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>

        <transition name="sidebar-fade">
          <div v-if="!sidebarCollapsed" class="sidebar-inner">
            <!-- 选项卡 -->
            <div class="sidebar-tabs">
              <button
                :class="['tab-btn', { 'tab-btn--active': activeTab === 'date' }]"
                @click="activeTab = 'date'"
              >
                <span class="tab-icon">📅</span>
                <span>日期</span>
              </button>
              <button
                :class="['tab-btn', { 'tab-btn--active': activeTab === 'category' }]"
                @click="activeTab = 'category'"
              >
                <span class="tab-icon">📂</span>
                <span>分类</span>
              </button>
            </div>

            <!-- 内容区 -->
            <div class="sidebar-content">
              <!-- 按日期 -->
              <div v-if="activeTab === 'date'" class="date-list">
                <h3 class="sidebar-heading">按日期</h3>
                <div
                  v-for="group in dateGroups"
                  :key="group.yearMonth"
                  :class="['date-item', { 'date-item--active': selectedYearMonth === group.yearMonth }]"
                  @click="selectYearMonth(group.yearMonth)"
                >
                  <span class="date-year">{{ group.yearMonth }}</span>
                  <span class="date-count">{{ group.count }} 篇</span>
                </div>
              </div>

              <!-- 按分类 -->
              <div v-else class="category-list">
                <h3 class="sidebar-heading">按分类</h3>
                <div
                  v-for="category in categories"
                  :key="category.id"
                  :class="['category-item', { 'category-item--active': selectedCategory === category.id }]"
                  @click="selectCategory(category.id)"
                >
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-count">{{ category.article_count || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </aside>

      <!-- Articles Section -->
      <main class="articles-section">
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
          <button @click="fetchArticles" class="retry-btn">重试</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredArticles.length === 0" class="empty-state">
          <div class="empty-decoration">
            <span class="decoration-dot"></span>
          </div>
          <p class="empty-text">暂无文章</p>
        </div>

        <!-- Articles List -->
        <div v-else class="articles-list">
          <article
            v-for="(article, index) in filteredArticles"
            :key="article.id"
            :class="['article-item', `article-item--${index + 1}`]"
            :style="{ animationDelay: `${index * 80}ms` }"
            @click="goToArticle(article.id)"
          >
            <!-- 文章元信息 -->
            <div class="article-meta">
              <time class="meta-date">{{ formatDate(article.createdAt) }}</time>
              <span v-if="article.category" class="meta-category">{{ article.category }}</span>
              <span class="meta-read-time">{{ article.readTime || 5 }} 分钟</span>
            </div>

            <!-- 文章标题 -->
            <h3 class="article-title">{{ article.title }}</h3>

            <!-- 文章摘要 -->
            <p v-if="article.excerpt" class="article-excerpt">{{ article.excerpt }}</p>

            <!-- 文章标签 -->
            <div v-if="article.tags && article.tags.length" class="article-tags">
              <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">
                #{{ tag }}
              </span>
            </div>

            <!-- 装饰线 -->
            <div class="article-line"></div>
          </article>

          <!-- Load More -->
          <div v-if="hasMore" class="load-more">
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="load-more-btn"
            >
              <span v-if="!loadingMore">加载更多</span>
              <span v-else>加载中...</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi } from '@/api/blog'
import type { Article, Category } from '@/types/blog'

const router = useRouter()

// 状态
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const isScrolled = ref(false)
const sidebarCollapsed = ref(false)
const activeTab = ref<'date' | 'category'>('date')
const selectedYearMonth = ref<string | null>(null)
const selectedCategory = ref<string | number | null>(null)
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)

// 博客配置
const blogConfig = ref({
  title: '思·录',
  description: '关于技术、设计与思考的记录'
})

// 标题字符分割（用于动画）
const titleChars = computed(() => {
  return blogConfig.value.title.split('')
})

// 日期分组 - 按年月分组
const dateGroups = computed(() => {
  const groups: Record<string, number> = {}

  articles.value.forEach(article => {
    const date = new Date(article.createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const yearMonth = `${year}-${month}`
    groups[yearMonth] = (groups[yearMonth] || 0) + 1
  })

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([yearMonth, count]) => ({ yearMonth, count }))
})

// 过滤后的文章
const filteredArticles = computed(() => {
  let result = articles.value

  if (selectedYearMonth.value) {
    result = result.filter(article => {
      const date = new Date(article.createdAt)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const yearMonth = `${year}-${month}`
      return yearMonth === selectedYearMonth.value
    })
  }

  if (selectedCategory.value) {
    result = result.filter(article => {
      // 使用 categoryId 字段进行筛选
      return article.categoryId === selectedCategory.value
    })
  }

  return result
})

// 是否还有更多
const hasMore = computed(() => {
  return articles.value.length < totalCount.value
})

// 获取文章
const fetchArticles = async (page: number = 1) => {
  if (page === 1) {
    loading.value = true
  }
  error.value = ''

  try {
    const response = await blogApi.getArticles(page, pageSize)

    if (page === 1) {
      articles.value = response.results || []
    } else {
      articles.value = [...articles.value, ...(response.results || [])]
    }

    totalCount.value = response.count || 0
    currentPage.value = page
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取文章失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 获取分类
const fetchCategories = async () => {
  try {
    categories.value = await blogApi.getCategories()
  } catch (err) {
    console.error('获取分类失败:', err)
  }
}

// 加载更多
const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadingMore.value = true
    fetchArticles(currentPage.value + 1)
  }
}

// 跳转到文章详情
const goToArticle = (id: string) => {
  router.push({ name: 'ArticleDetail', params: { id } })
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 选择年月
const selectYearMonth = (yearMonth: string) => {
  selectedYearMonth.value = selectedYearMonth.value === yearMonth ? null : yearMonth
  selectedCategory.value = null
}

// 选择分类
const selectCategory = (categoryId: string | number) => {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
  selectedYearMonth.value = null
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 滚动处理
const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

onMounted(() => {
  fetchArticles()
  fetchCategories()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* ========================================
   Hero Section - 墨韵开篇
   ======================================== */

.hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-32) var(--space-6);
  overflow: hidden;
  transition: all var(--duration-slow) var(--ease-out-quart);
}

.hero--scrolled {
  min-height: 50vh;
}

.hero-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: var(--container-2xl);
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.decoration-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--stone-400), transparent);
}

.decoration-seal {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--vermilion);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--vermilion);
  border-radius: var(--radius-sm);
  letter-spacing: var(--letter-wider);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(var(--font-size-4xl), 8vw, var(--font-size-6xl));
  font-weight: var(--font-weight-black);
  color: var(--ink-900);
  margin: 0 0 var(--space-8) 0;
  letter-spacing: var(--letter-snug);
  line-height: var(--leading-tight);
}

.title-char {
  display: inline-block;
  opacity: 0;
  animation: charReveal 0.6s var(--ease-out-expo) forwards;
  white-space: pre;
}

@keyframes charReveal {
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(-90deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.hero-subtitle {
  margin: 0 0 var(--space-12) 0;
}

.subtitle-line {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-light);
  color: var(--stone-600);
  letter-spacing: var(--letter-wide);
  opacity: 0;
  animation: fadeInUp 0.8s var(--ease-out-quart) 0.5s forwards;
}

.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  opacity: 0;
  animation: fadeIn 1s var(--ease-out-quart) 1s forwards;
}

.scroll-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wider);
  text-transform: uppercase;
}

.scroll-arrow {
  font-size: var(--font-size-lg);
  color: var(--vermilion);
  animation: scrollBounce 2s var(--ease-spring) infinite;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vermilion-dim) 0%, transparent 70%);
  opacity: 0.6;
}

.bg-circle--1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.bg-circle--2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.bg-circle--3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: breathe 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* ========================================
   Main Layout
   ======================================== */

.main-layout {
  display: flex;
  max-width: var(--container-7xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
  gap: var(--space-12);
}

/* ========================================
   Sidebar
   ======================================== */

.sidebar {
  position: sticky;
  top: var(--space-8);
  width: 240px;
  height: fit-content;
  max-height: calc(100vh - var(--space-16));
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.sidebar--collapsed {
  width: 48px;
}

.sidebar-toggle {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
  z-index: 10;
}

.sidebar-toggle:hover {
  border-color: var(--vermilion);
  color: var(--vermilion);
}

.toggle-icon {
  display: flex;
  transition: transform var(--duration-normal) var(--ease-out-quart);
}

.toggle-icon--rotated {
  transform: rotate(180deg);
}

.sidebar-inner {
  padding-top: var(--space-10);
}

.sidebar-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.tab-btn:hover {
  color: var(--ink-900);
  background: var(--stone-100);
}

.tab-btn--active {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion-light);
}

.tab-icon {
  font-size: var(--font-size-lg);
}

.sidebar-content {
  animation: fadeIn 0.3s var(--ease-out-quart);
}

.sidebar-heading {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-700);
  margin: 0 0 var(--space-4) 0;
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.date-list,
.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.date-item,
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-700);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.date-item:hover,
.category-item:hover {
  color: var(--ink-900);
  background: var(--stone-100);
}

.date-item--active,
.category-item--active {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.date-count,
.category-count {
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  font-variant-numeric: tabular-nums;
}

/* 侧边栏淡入动画 */
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ========================================
   Articles Section
   ======================================== */

.articles-section {
  flex: 1;
  min-width: 0;
  padding: var(--space-12) 0 var(--space-20);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
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

.loading-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  text-align: center;
}

.error-icon {
  font-size: var(--font-size-4xl);
  color: var(--vermilion);
  margin-bottom: var(--space-4);
}

.error-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0 0 var(--space-2) 0;
}

.error-message {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  margin: 0 0 var(--space-6) 0;
}

.retry-btn {
  padding: var(--space-2) var(--space-6);
  background: var(--vermilion);
  color: white;
  border: none;
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.retry-btn:hover {
  background: #b33827;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  text-align: center;
}

.empty-decoration {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.empty-decoration::before,
.empty-decoration::after {
  content: '';
  width: 40px;
  height: 1px;
  background: var(--stone-300);
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--stone-400);
}

.empty-text {
  font-family: var(--font-serif);
  font-size: var(--font-size-lg);
  font-style: italic;
  color: var(--stone-500);
}

/* ========================================
   Article List
   ======================================== */

.articles-list {
  display: flex;
  flex-direction: column;
}

.article-item {
  position: relative;
  padding: var(--space-8) 0;
  cursor: pointer;
  opacity: 0;
  animation: articleReveal 0.6s var(--ease-out-expo) forwards;
  transition: all var(--duration-normal) var(--ease-out-quart);
}

@keyframes articleReveal {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-item:hover {
  transform: translateX(8px);
}

.article-item:hover .article-title {
  color: var(--vermilion);
}

.article-item:hover .article-line {
  width: 60px;
  background: var(--vermilion);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.meta-date,
.meta-category,
.meta-read-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.meta-category {
  color: var(--vermilion);
}

.article-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-snug);
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.article-excerpt {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-4) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  padding: var(--space-1) var(--space-2);
  background: var(--stone-100);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.article-item:hover .tag {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.article-line {
  width: 40px;
  height: 1px;
  background: var(--stone-300);
  margin-top: var(--space-4);
  transition: all var(--duration-normal) var(--ease-out-quart);
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  padding-top: var(--space-12);
}

.load-more-btn {
  padding: var(--space-3) var(--space-8);
  background: transparent;
  color: var(--stone-600);
  border: 1px solid var(--stone-300);
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.load-more-btn:hover:not(:disabled) {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: var(--vermilion-dim);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* ========================================
   Responsive Design
   ======================================== */

@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    position: relative;
    top: 0;
    width: 100%;
    max-height: none;
  }

  .sidebar--collapsed {
    width: 100%;
  }

  .sidebar-inner {
    padding-top: var(--space-6);
  }

  .sidebar-toggle {
    top: var(--space-4);
    right: var(--space-4);
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 60vh;
    padding: var(--space-20) var(--space-4);
  }

  .hero-decoration {
    gap: var(--space-3);
  }

  .decoration-line {
    width: 30px;
  }

  .decoration-seal {
    font-size: var(--font-size-xs);
  }

  .main-layout {
    padding: 0 var(--space-4);
  }

  .article-item {
    padding: var(--space-6) 0;
  }

  .article-title {
    font-size: var(--font-size-xl);
  }

  .bg-circle {
    display: none;
  }
}
</style>
