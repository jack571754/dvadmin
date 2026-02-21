<template>
  <div class="hot-articles">
    <h3 class="hot-title">
      <span class="title-icon">☆</span>
      <span>热门文章</span>
    </h3>

    <div v-if="loading" class="hot-loading">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </div>

    <nav v-else-if="articles.length > 0" class="hot-list">
      <router-link
        v-for="(article, index) in articles"
        :key="article.id"
        :to="`/article/${article.id}`"
        class="hot-item"
      >
        <span class="hot-rank" :class="`hot-rank--${index + 1}`">{{ index + 1 }}</span>
        <div class="hot-content">
          <span class="hot-article-title">{{ article.title }}</span>
          <span class="hot-meta">
            <span class="hot-views">{{ article.viewsCount || 0 }} 阅读</span>
          </span>
        </div>
      </router-link>
    </nav>

    <div v-else class="hot-empty">
      暂无热门文章
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { blogApi } from '@/api/blog'
import type { Article } from '@/types/blog'

const loading = ref(true)
const articles = ref<Article[]>([])

const fetchHotArticles = async () => {
  loading.value = true
  try {
    articles.value = await blogApi.getHotArticles()
  } catch (err) {
    console.error('Failed to fetch hot articles:', err)
    articles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHotArticles()
})
</script>

<style scoped>
.hot-articles {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.hot-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-serif);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-4) 0;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.title-icon {
  color: var(--vermilion);
}

.hot-loading {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) 0;
}

.loading-dot {
  width: 6px;
  height: 6px;
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

.hot-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hot-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2);
  text-decoration: none;
  border-radius: var(--radius-base);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.hot-item:hover {
  background: var(--color-hover);
}

.hot-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--stone-500);
  background: var(--stone-100);
  border-radius: var(--radius-sm);
}

.hot-rank--1 {
  color: white;
  background: var(--vermilion);
}

.hot-rank--2 {
  color: white;
  background: #e67e22;
}

.hot-rank--3 {
  color: white;
  background: #f1c40f;
}

.hot-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.hot-article-title {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--ink-800);
  line-height: var(--leading-snug);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.hot-item:hover .hot-article-title {
  color: var(--vermilion);
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.hot-views {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
}

.hot-empty {
  padding: var(--space-4) 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-muted);
  font-style: italic;
}
</style>
