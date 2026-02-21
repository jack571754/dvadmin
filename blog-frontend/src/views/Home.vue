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
      </div>
    </section>

    <!-- Main Content -->
    <div class="main-layout">
      <!-- Mobile Sidebar Overlay -->
      <div 
        v-if="!sidebarCollapsed"
        class="sidebar-overlay" 
        @click="sidebarCollapsed = true"
      ></div>

      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar--mobile-open': !sidebarCollapsed }">
        <!-- Mobile Close Button -->
        <button
          @click="sidebarCollapsed = true"
          class="sidebar-close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="sidebar-inner">
          <!-- 选项卡 -->
          <div class="sidebar-tabs">
            <button
              :class="['tab-btn', { 'tab-btn--active': activeTab === 'date' }]"
              @click="activeTab = 'date'"
            >
              <span>日期归档</span>
            </button>
            <button
              :class="['tab-btn', { 'tab-btn--active': activeTab === 'category' }]"
              @click="activeTab = 'category'"
            >
              <span>文章分类</span>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="sidebar-content">
            <!-- 按日期 -->
            <div v-if="activeTab === 'date'" class="date-list">
              <div
                v-for="group in dateGroups"
                :key="group.yearMonth"
                :class="['date-item', { 'date-item--active': selectedYearMonth === group.yearMonth }]"
                @click="selectYearMonth(group.yearMonth)"
              >
                <span class="date-year">{{ group.yearMonth }}</span>
                <span class="date-count">{{ group.count }}</span>
              </div>
              <div v-if="dateGroups.length === 0" class="empty-hint">
                暂无文章
              </div>
            </div>

            <!-- 按分类 -->
            <div v-else class="category-list">
              <div
                v-for="category in categories"
                :key="category.id"
                :class="['category-item', { 'category-item--active': selectedCategory === category.id }]"
                @click="selectCategory(category.id)"
              >
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.article_count || 0 }}</span>
              </div>
              <div v-if="categories.length === 0" class="empty-hint">
                暂无分类
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Articles Section -->
      <main class="articles-section">
        <!-- Mobile Filter Button -->
        <button class="mobile-filter-btn" @click="sidebarCollapsed = false">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>筛选</span>
        </button>

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
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="error-title">加载失败</h2>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions">
            <button @click="() => fetchArticles()" class="retry-btn">
              <span>重试</span>
            </button>
            <button v-if="error.includes('网络连接失败')" @click="checkBackend" class="check-btn">
              <span>检查后端服务</span>
            </button>
          </div>
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
            :class="['article-item', `article-item--${index + 1}`, { 'article-item--top': article.isTop }]"
            :style="{ animationDelay: `${index * 80}ms` }"
            @click="goToArticle(article.id)"
          >
            <!-- Top Badge -->
            <div v-if="article.isTop" class="top-badge">
              <span>置顶</span>
            </div>

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

    <!-- Back to Top Button -->
    <transition name="fade">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="back-to-top"
        title="返回顶部"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4L10 16M10 4L5 9M10 4L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </transition>
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
const showBackToTop = ref(false)
const sidebarCollapsed = ref(true)
const activeTab = ref<'date' | 'category'>('date')
const selectedYearMonth = ref<string | null>(null)
const selectedCategory = ref<string | number | null>(null)
const currentPage = ref(1)
const totalCount = ref(0)
const availableYearMonths = ref<string[]>([])

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
const fetchArticles = async (page: number = 1, append: boolean = false, retryCount: number = 0) => {
  // 防止重复请求（仅在追加模式下跳过）
  if (append && loading.value) return

  try {
    loading.value = true
    error.value = ''
    
    const response = await blogApi.getArticles(page, 10)
    
    if (append) {
      articles.value.push(...response.results)
    } else {
      articles.value = response.results
    }
    
    totalCount.value = response.count
    currentPage.value = page
    
    // 提取年月用于筛选
    const yearMonths = new Set<string>()
    articles.value.forEach(article => {
      const date = new Date(article.createdAt)
      const yearMonth = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月`
      yearMonths.add(yearMonth)
    })
    availableYearMonths.value = Array.from(yearMonths).sort().reverse()
    
  } catch (err) {
    console.error('获取文章失败:', err)
    
    // 如果是网络错误且重试次数小于3次，自动重试
    if (err instanceof Error && err.message.includes('网络连接失败') && retryCount < 3) {
      console.log(`第 ${retryCount + 1} 次重试...`)
      setTimeout(() => fetchArticles(page, append, retryCount + 1), 2000)
      return
    }
    
    error.value = err instanceof Error ? err.message : '获取文章失败'
    loading.value = false
    loadingMore.value = false
  } finally {
    // 只有在非重试情况下才更新loading状态
    if (retryCount === 0) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

// 获取分类
const fetchCategories = async (retryCount: number = 0) => {
  try {
    categories.value = await blogApi.getCategories()
  } catch (err) {
    console.error('获取分类失败:', err)
    
    // 如果是网络错误且重试次数小于3次，自动重试
    if (err instanceof Error && err.message.includes('网络连接失败') && retryCount < 3) {
      console.log(`分类获取第 ${retryCount + 1} 次重试...`)
      setTimeout(() => fetchCategories(retryCount + 1), 2000)
    }
  }
}

// 加载更多
const loadMore = async () => {
  if (!loadingMore.value && hasMore.value) {
    loadingMore.value = true
    const nextPage = currentPage.value + 1

    if (selectedCategory.value) {
      // 如果有选中的分类，继续加载该分类的文章
      await fetchArticlesByCategory(selectedCategory.value, nextPage, true)
    } else {
      // 否则加载所有文章
      await fetchArticles(nextPage, true)
    }
  }
}

// 跳转到文章详情
const goToArticle = (id: string) => {
  router.push({ name: 'ArticleDetail', params: { id } })
}

// 检查后端服务
const checkBackend = async () => {
  const { isBackendAvailable } = await import('@/api/blog')
  const available = await isBackendAvailable()
  
  if (available) {
    if ((window as any).addToast) {
      (window as any).addToast('后端服务已连接，正在加载数据...', 'success')
    }
    fetchArticles()
    fetchCategories()
  } else {
    if ((window as any).addToast) {
      (window as any).addToast('后端服务仍未启动，请检查服务是否运行在 localhost:10025', 'error')
    }
  }
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
const selectCategory = async (categoryId: string | number) => {
  if (selectedCategory.value === categoryId) {
    // 取消选择，重新获取所有文章
    selectedCategory.value = null
    currentPage.value = 1
    await fetchArticles(1)
  } else {
    selectedCategory.value = categoryId
    selectedYearMonth.value = null
    // 使用后端分类筛选接口
    await fetchArticlesByCategory(categoryId, 1, false)
  }
}

// 按分类获取文章（使用后端接口）
const fetchArticlesByCategory = async (categoryId: string | number, page: number = 1, append: boolean = false) => {
  if (loading.value && append) return

  try {
    loading.value = true
    error.value = ''

    const response = await blogApi.getArticlesByCategory(String(categoryId), page, 10)

    if (append) {
      articles.value.push(...response.results)
    } else {
      articles.value = response.results
    }
    totalCount.value = response.count
    currentPage.value = page
  } catch (err) {
    console.error('获取分类文章失败:', err)
    error.value = err instanceof Error ? err.message : '获取分类文章失败'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 滚动处理
const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
  showBackToTop.value = window.scrollY > 500
}

// 返回顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
  /* 纸张纹理背景 */
  position: relative;
}

.home-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: var(--paper-texture);
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

/* ========================================
   Hero Section - 卷轴展开
   ======================================== */

.hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) var(--space-6);
  overflow: hidden;
  transition: all var(--duration-slow) var(--ease-out-quart);
  /* 卷轴背景装饰 */
  background:
    linear-gradient(90deg,
      transparent 0%,
      rgba(200, 64, 46, 0.02) 20%,
      rgba(200, 64, 46, 0.03) 50%,
      rgba(200, 64, 46, 0.02) 80%,
      transparent 100%
    );
}

.hero--scrolled {
  min-height: 35vh;
}

/* 卷轴两侧装饰 - 卷轴轴心 */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  top: 20%;
  bottom: 20%;
  width: 4px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--stone-300) 20%,
    var(--stone-400) 50%,
    var(--stone-300) 80%,
    transparent
  );
  border-radius: var(--radius-full);
  opacity: 0;
  animation: scrollRod 1s var(--ease-out-expo) 0.5s forwards;
}

.hero::before {
  left: 5%;
}

.hero::after {
  right: 5%;
}

@keyframes scrollRod {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 0.6;
    transform: scaleY(1);
  }
}

.hero-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: var(--container-2xl);
  /* 卷轴展开动画 */
  animation: scrollUnfurl 1s var(--ease-out-expo) forwards;
  opacity: 0;
}

.hero-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.decoration-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--stone-400), transparent);
  opacity: 0;
  animation: flowIn 0.8s var(--flow-curve) 0.3s forwards;
}

.decoration-line--left {
  animation-delay: 0.2s;
}

.decoration-line--right {
  animation-delay: 0.4s;
}

/* 印章效果 - 核心记忆点 */
.decoration-seal {
  position: relative;
  font-family: var(--font-serif);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--vermilion);
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--vermilion);
  border-radius: var(--radius-base);
  letter-spacing: var(--letter-wider);
  /* 印章纹理 */
  background-image: var(--seal-texture);
  background-color: rgba(200, 64, 46, 0.05);
  box-shadow: var(--seal-shadow);
  /* 印章盖下动画 */
  animation: sealStamp 0.5s var(--ease-spring) 0.6s forwards;
  opacity: 0;
  transform-origin: center center;
}

/* 印章内部装饰边框 */
.decoration-seal::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid var(--vermilion);
  border-radius: 2px;
  opacity: 0.5;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(var(--font-size-3xl), 7vw, var(--font-size-6xl));
  font-weight: var(--font-weight-black);
  color: var(--ink-900);
  margin: 0 0 var(--space-6) 0;
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
    transform: translateY(30px) rotateX(-90deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

.hero-subtitle {
  margin: 0 0 var(--space-8) 0;
}

.subtitle-line {
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-light);
  color: var(--stone-600);
  letter-spacing: var(--letter-wide);
  opacity: 0;
  animation: fadeInUp 0.8s var(--ease-out-quart) 0.8s forwards;
}

/* 滚动提示 - 流觞设计 */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  opacity: 0;
  animation: fadeIn 1s var(--ease-out-quart) 1.5s forwards;
}

.scroll-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wider);
  text-transform: uppercase;
}

.scroll-arrow {
  width: 24px;
  height: 40px;
  border: 2px solid var(--stone-300);
  border-radius: var(--radius-full);
  position: relative;
  /* 流觞曲线动画 */
  animation: scrollBounce 2s var(--ease-spring) infinite;
}

.scroll-arrow::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 8px;
  background: var(--vermilion);
  border-radius: var(--radius-full);
  animation: scrollDot 2s var(--ease-spring) infinite;
}

@keyframes scrollDot {
  0%, 100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateX(-50%) translateY(12px);
  }
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* 背景装饰 - 水墨意境 */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vermilion-dim) 0%, transparent 70%);
  opacity: 0;
  animation: inkBloom 4s var(--ease-out-quart) infinite;
}

.bg-circle--1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.bg-circle--2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -80px;
  animation-delay: 2s;
}

@keyframes inkBloom {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  30% {
    opacity: 0.3;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
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
   Main Layout - 黄金比例非对称
   ======================================== */

.main-layout {
  display: flex;
  max-width: var(--container-7xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
  gap: var(--space-10);
  position: relative;
  z-index: 1;
}

/* ========================================
   Sidebar - 屏风悬浮面板
   ======================================== */

.sidebar {
  position: sticky;
  top: 80px;
  width: 240px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  flex-shrink: 0;
  /* 屏风效果 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: var(--screen-blur);
  -webkit-backdrop-filter: var(--screen-blur);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--screen-shadow);
  /* 入场动画 */
  animation: flowIn 0.6s var(--flow-curve) 0.3s forwards;
  opacity: 0;
}

.sidebar-close {
  display: none;
}

.sidebar-inner {
  padding: var(--space-5);
}

/* 屏风顶部装饰 - 折叠痕迹 */
.sidebar-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    transparent,
    var(--vermilion) 30%,
    var(--vermilion) 70%,
    transparent
  );
  opacity: 0.3;
}

.sidebar-tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  padding: var(--space-1);
  background: var(--stone-100);
  border-radius: var(--radius-lg);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--stone-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.tab-btn:hover {
  color: var(--ink-900);
}

.tab-btn--active {
  color: var(--vermilion);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  /* 印章式激活效果 */
  position: relative;
}

.tab-btn--active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--vermilion);
  border-radius: var(--radius-full);
}

.sidebar-content {
  animation: fadeIn 0.3s var(--ease-out-quart);
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.empty-hint {
  padding: var(--space-8) var(--space-2);
  text-align: center;
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--stone-400);
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
  position: relative;
  /* 左侧指示线 */
}

.date-item::before,
.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--vermilion);
  border-radius: var(--radius-full);
  transition: height var(--duration-fast) var(--ease-out-quart);
}

.date-item:hover::before,
.category-item:hover::before {
  height: 50%;
}

.date-item:hover,
.category-item:hover {
  color: var(--ink-900);
  background: var(--stone-50);
  padding-left: var(--space-4);
}

.date-item--active::before,
.category-item--active::before {
  height: 80%;
}

.date-item--active,
.category-item--active {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  font-weight: var(--font-weight-medium);
  padding-left: var(--space-4);
}

.date-count,
.category-count {
  font-size: var(--font-size-xs);
  color: var(--stone-400);
  font-variant-numeric: tabular-nums;
  background: var(--stone-100);
  padding: var(--space-0_5) var(--space-2);
  border-radius: var(--radius-full);
  min-width: 28px;
  text-align: center;
}

.date-item--active .date-count,
.category-item--active .category-count {
  background: var(--vermilion-light);
  color: var(--vermilion);
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
   Articles Section - 册页布局
   ======================================== */

.articles-section {
  flex: 1;
  min-width: 0;
  padding: var(--space-10) 0 var(--space-16);
  /* 册页纸张效果 */
  position: relative;
}

/* 时间线装饰 - 竖线 */
.articles-section::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 0;
  bottom: 10%;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--stone-200) 10%,
    var(--stone-200) 90%,
    transparent
  );
  border-radius: var(--radius-full);
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
  color: var(--color-accent);
  margin-bottom: var(--space-4);
  opacity: 0.8;
}

.error-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0 0 var(--space-3) 0;
}

.error-message {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-muted);
  margin: 0 0 var(--space-6) 0;
  max-width: 400px;
  line-height: var(--leading-relaxed);
}

.error-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}

.retry-btn,
.check-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.retry-btn:hover {
  background: var(--color-hover);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.check-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
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
   Article List - 册页卡片
   ======================================== */

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* 文章卡片 - 册页效果 */
.article-item {
  position: relative;
  padding: var(--space-6) var(--space-6) var(--space-6) var(--space-8);
  margin-bottom: 0;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  cursor: pointer;
  opacity: 0;
  animation: pageFlip 0.6s var(--ease-out-quart) forwards;
  transition: all var(--duration-normal) var(--ease-out-quart);
  border: 1px solid transparent;
  /* 册页阴影效果 */
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 册页翻角效果 */
.article-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: var(--page-curl);
  border-radius: 0 0 0 var(--radius-xl);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-quart);
}

.article-item:hover::after {
  opacity: 1;
}

/* 左侧墨线装饰 */
.article-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--stone-300) 20%,
    var(--stone-400) 50%,
    var(--stone-300) 80%,
    transparent
  );
  border-radius: var(--radius-full);
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.article-item:hover::before {
  top: 10%;
  bottom: 10%;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--vermilion) 20%,
    var(--vermilion) 80%,
    transparent
  );
}

/* 非对称动画延迟 - 流觞曲线效果 */
.article-item:nth-child(1) { animation-delay: 0.1s; }
.article-item:nth-child(2) { animation-delay: 0.2s; }
.article-item:nth-child(3) { animation-delay: 0.15s; }
.article-item:nth-child(4) { animation-delay: 0.25s; }
.article-item:nth-child(5) { animation-delay: 0.18s; }

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
  transform: translateY(-4px) translateX(4px);
  border-color: var(--color-border);
  box-shadow: var(--shadow-lg), var(--page-shadow);
}

.article-item:hover .article-title {
  color: var(--vermilion);
}

.article-item:hover .article-line {
  width: 80px;
  background: linear-gradient(to right, var(--vermilion), transparent);
}

/* Top Badge - 印章效果 */
.top-badge {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}

.top-badge span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-serif);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--vermilion);
  background: rgba(200, 64, 46, 0.08);
  border: 2px solid var(--vermilion);
  border-radius: var(--radius-sm);
  letter-spacing: var(--letter-wide);
  /* 印章纹理 */
  background-image: var(--seal-texture);
  box-shadow: var(--seal-shadow);
  animation: sealStamp 0.4s var(--ease-spring) 0.3s forwards;
  opacity: 0;
}

.article-item--top {
  border-left: 3px solid var(--vermilion);
}

.article-item--top::before {
  background: linear-gradient(
    to bottom,
    transparent,
    var(--vermilion) 20%,
    var(--vermilion) 80%,
    transparent
  );
  top: 10%;
  bottom: 10%;
}

/* 文章序号装饰 */
.article-item--top .top-badge span::before {
  content: '壹';
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.meta-date,
.meta-category,
.meta-read-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-date::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--stone-300);
  border-radius: 50%;
  margin-right: var(--space-1);
}

.meta-category {
  color: var(--vermilion);
  font-weight: var(--font-weight-medium);
}

.meta-category::before {
  background: var(--vermilion-light);
}

.meta-read-time {
  color: var(--stone-400);
}

.article-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-snug);
  transition: color var(--duration-fast) var(--ease-out-quart);
  /* 墨迹效果 */
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.article-excerpt {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-4) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 纸张文字效果 */
  text-rendering: optimizeLegibility;
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
  padding: var(--space-1) var(--space-3);
  background: var(--stone-100);
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.article-item:hover .tag {
  color: var(--vermilion);
  background: var(--vermilion-dim);
  border-color: var(--vermilion-light);
}

/* 装饰线 - 水墨效果 */
.article-line {
  width: 50px;
  height: 2px;
  background: linear-gradient(to right, var(--stone-300), transparent);
  margin-top: var(--space-4);
  transition: all var(--duration-normal) var(--ease-out-quart);
  border-radius: var(--radius-full);
}

/* Load More - 卷轴展开效果 */
.load-more {
  display: flex;
  justify-content: center;
  padding-top: var(--space-12);
}

.load-more-btn {
  position: relative;
  padding: var(--space-3) var(--space-10);
  background: transparent;
  color: var(--stone-600);
  border: 1px solid var(--stone-300);
  border-radius: var(--radius-full);
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
  overflow: hidden;
}

/* 按钮装饰 */
.load-more-btn::before {
  content: '···';
  position: absolute;
  left: var(--space-3);
  color: var(--stone-400);
  letter-spacing: 2px;
}

.load-more-btn:hover:not(:disabled) {
  color: var(--vermilion);
  border-color: var(--vermilion);
  background: var(--vermilion-dim);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
    margin-bottom: var(--space-4);
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 40vh;
    padding: var(--space-12) var(--space-4);
  }

  .hero-decoration {
    gap: var(--space-2);
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

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: 280px;
    max-height: 100vh;
    z-index: var(--z-modal);
    border-radius: 0;
    border: none;
    box-shadow: var(--shadow-2xl);
    transform: translateX(100%);
    transition: transform var(--duration-normal) var(--ease-out-quart);
  }

  .sidebar--mobile-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: flex;
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    background: var(--stone-100);
    border-radius: var(--radius-full);
    color: var(--stone-600);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .sidebar-close:hover {
    background: var(--stone-200);
    color: var(--ink-900);
  }

  .sidebar-inner {
    padding: var(--space-12) var(--space-4) var(--space-4);
  }

  .sidebar-content {
    max-height: calc(100vh - 160px);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: calc(var(--z-modal) - 1);
  }

  .article-item {
    padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
  }

  .article-title {
    font-size: var(--font-size-lg);
  }

  .bg-circle {
    display: none;
  }

  .mobile-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    margin-bottom: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--stone-600);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .mobile-filter-btn:hover {
    border-color: var(--vermilion);
    color: var(--vermilion);
  }
}

/* Mobile Filter Button - Hidden on desktop */
.mobile-filter-btn {
  display: none;
}

.sidebar-overlay {
  display: none;
}

/* ========================================
   Back to Top Button - 印章式设计
   ======================================== */

.back-to-top {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-6);
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid var(--stone-200);
  border-radius: var(--radius-xl);
  color: var(--stone-600);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-normal) var(--ease-out-quart);
  z-index: var(--z-sticky);
  /* 印章纹理 */
  position: relative;
  overflow: hidden;
}

.back-to-top::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--seal-texture);
  opacity: 0.5;
  pointer-events: none;
}

.back-to-top:hover {
  background: var(--vermilion);
  border-color: var(--vermilion);
  color: white;
  transform: translateY(-4px) scale(1.05);
  box-shadow: var(--shadow-xl), var(--seal-shadow);
}

.back-to-top:hover svg {
  transform: translateY(-2px);
}

.back-to-top svg {
  position: relative;
  z-index: 1;
  transition: transform var(--duration-fast) var(--ease-out-quart);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: var(--space-6);
    right: var(--space-4);
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
  }
}
</style>
