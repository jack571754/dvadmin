<template>
  <div class="archive-page">
    <!-- Page Header -->
    <header class="page-header">
      <h1 class="page-title">文章归档</h1>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-indicator">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
      <p class="state-text">加载中</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <div class="error-mark">—</div>
      <p class="state-title">加载失败</p>
      <p class="state-message">{{ error }}</p>
      <button @click="fetchArticles" class="text-button">重试</button>
    </div>

    <!-- Archive List -->
    <main v-else-if="groupedArticles.length > 0" class="archive-container">
      <section
        v-for="group in groupedArticles"
        :key="group.year"
        class="year-section"
      >
        <h2 class="year-title">{{ group.year }}</h2>
        <div class="year-articles">
          <article
            v-for="article in group.articles"
            :key="article.id"
            class="archive-article"
            @click="goToArticle(article.id)"
          >
            <div class="article-date">{{ formatDate(article.createdAt) }}</div>
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="article-meta">
              <span v-if="article.category" class="meta-category">{{ article.category }}</span>
              <span class="meta-read-time">{{ article.readTime }} 分钟</span>
            </div>
          </article>
        </div>
      </section>

      <!-- Statistics -->
      <div class="statistics">
        <div class="stat-item">
          <span class="stat-value">{{ articles.length }}</span>
          <span class="stat-label">篇文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ groupedArticles.length }}</span>
          <span class="stat-label">个年份</span>
        </div>
      </div>
    </main>

    <!-- Empty State -->
    <div v-else class="state-container state-container--empty">
      <div class="empty-decoration">
        <span class="decorative-dot"></span>
      </div>
      <p class="state-message">暂无文章归档</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi } from '@/api/blog'
import type { Article } from '@/types/blog'

interface ArticleGroup {
  year: string
  articles: Article[]
}

const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(true)
const error = ref('')

const groupedArticles = computed((): ArticleGroup[] => {
  const groups: { [key: string]: Article[] } = {}

  articles.value.forEach(article => {
    const date = new Date(article.createdAt)
    const year = date.getFullYear().toString()

    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(article)
  })

  return Object.keys(groups)
    .sort()
    .reverse()
    .map(year => ({
      year,
      articles: groups[year].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }))
})

const fetchArticles = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await blogApi.getArticles(1, 100)
    articles.value = response.results
  } catch (err) {
    error.value = err instanceof Error ? err.message : '发生未知错误'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToArticle = (id: string) => {
  router.push({ name: 'ArticleDetail', params: { id } })
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.archive-page {
  min-height: 100vh;
  background: var(--color-background);
  padding-top: var(--space-3xl);
}

/* Page Header */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-16) var(--space-lg);
  border-bottom: 1px solid var(--stone-200);
}

.page-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0;
  letter-spacing: var(--letter-tight);
}

/* State Container */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-lg);
  text-align: center;
}

.loading-indicator {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
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

.state-text {
  font-size: var(--font-size-meta);
  color: var(--color-secondary);
  letter-spacing: var(--letter-wide);
}

.error-mark {
  font-size: 48px;
  color: var(--color-accent);
  margin-bottom: var(--space-md);
  line-height: 1;
}

.state-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-heading);
  color: var(--color-primary);
  margin: 0 0 var(--space-sm) 0;
}

.state-message {
  font-size: var(--font-size-body);
  color: var(--color-secondary);
  margin: 0 0 var(--space-lg) 0;
}

.text-button {
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: var(--letter-wide);
}

.text-button:hover {
  background: var(--color-accent);
  color: white;
}

.empty-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
}

.empty-decoration::before,
.empty-decoration::after {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--color-border);
}

.state-container--empty .state-message {
  font-size: var(--font-size-subheading);
  color: var(--color-secondary);
  font-style: italic;
}

/* Archive Container */
.archive-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg) var(--space-3xl);
}

/* Year Section */
.year-section {
  margin-bottom: var(--space-3xl);
}

.year-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-lg) 0;
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--color-accent);
}

/* Articles */
.year-articles {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding-top: var(--space-lg);
}

.archive-article {
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.archive-article:last-child {
  border-bottom: none;
}

.archive-article:hover {
  padding-left: var(--space-md);
}

.archive-article:hover .article-title {
  color: var(--color-accent);
}

.article-date {
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-muted);
  margin-bottom: var(--space-xs);
  font-variant-numeric: tabular-nums;
}

.article-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-subheading);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: var(--line-height-snug);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.meta-category {
  font-family: var(--font-sans);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  background: var(--color-accent-light);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-xs);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.meta-read-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-muted);
}

/* Statistics */
.statistics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-top: var(--space-3xl);
  padding: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.stat-value {
  font-family: var(--font-serif);
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.stat-label {
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-muted);
  letter-spacing: var(--letter-wide);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: var(--space-2xl) var(--space-md) var(--space-xl);
  }

  .page-title {
    font-size: 36px;
  }

  .archive-container {
    padding: 0 var(--space-md) var(--space-2xl);
  }

  .year-title {
    font-size: var(--font-size-heading);
  }

  .statistics {
    flex-direction: column;
    gap: var(--space-md);
  }

  .stat-divider {
    width: 40px;
    height: 1px;
  }
}
</style>
