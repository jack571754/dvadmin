<template>
  <Teleport to="body">
    <transition name="search">
      <div v-if="visible" class="search-overlay" @click.self="handleClose">
        <div class="search-container">
          <!-- Search Input -->
          <div class="search-header">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="搜索文章..."
                @input="handleSearch"
                @keydown.escape="handleClose"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <button @click="handleClose" class="close-btn">
              <span>ESC</span>
            </button>
          </div>

          <!-- Search Results -->
          <div class="search-body">
            <!-- Loading -->
            <div v-if="loading" class="search-loading">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <!-- Results -->
            <div v-else-if="results.length > 0" class="search-results">
              <div class="results-header">
                <span>找到 {{ totalCount }} 篇文章</span>
              </div>
              <div class="results-list">
                <article
                  v-for="article in results"
                  :key="article.id"
                  class="result-item"
                  @click="goToArticle(article.id)"
                >
                  <div class="result-meta">
                    <span v-if="article.category" class="result-category">{{ article.category }}</span>
                    <span class="result-date">{{ formatDate(article.createdAt) }}</span>
                  </div>
                  <h3 class="result-title" v-html="highlightText(article.title)"></h3>
                  <p v-if="article.excerpt" class="result-excerpt" v-html="highlightText(article.excerpt)"></p>
                  <div v-if="article.tags?.length" class="result-tags">
                    <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">#{{ tag }}</span>
                  </div>
                </article>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="searchQuery && !loading" class="search-empty">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1"/>
                <path d="M10 10L14 14" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
              </svg>
              <p>未找到相关文章</p>
              <span>试试其他关键词</span>
            </div>

            <!-- Initial State -->
            <div v-else class="search-initial">
              <div class="initial-hint">
                <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <p>输入关键词搜索文章</p>
              </div>
              <div v-if="hotArticles.length > 0" class="hot-articles">
                <h4 class="hot-title">热门文章</h4>
                <div class="hot-list">
                  <button
                    v-for="(article, index) in hotArticles.slice(0, 5)"
                    :key="article.id"
                    class="hot-item"
                    @click="goToArticle(article.id)"
                  >
                    <span class="hot-index">{{ index + 1 }}</span>
                    <span class="hot-name">{{ article.title }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { blogApi } from '@/api/blog'
import type { Article } from '@/types/blog'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()

const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const results = ref<Article[]>([])
const hotArticles = ref<Article[]>([])
const loading = ref(false)
const totalCount = ref(0)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    results.value = []
    totalCount.value = 0
    return
  }

  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  try {
    const response = await blogApi.searchArticles(searchQuery.value.trim(), 1, 20)
    results.value = response.results
    totalCount.value = response.count
  } catch (err) {
    console.error('Search failed:', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

const highlightText = (text: string): string => {
  if (!searchQuery.value.trim()) return text
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

const clearSearch = () => {
  searchQuery.value = ''
  results.value = []
  totalCount.value = 0
  searchInputRef.value?.focus()
}

const goToArticle = (id: string) => {
  handleClose()
  router.push({ name: 'ArticleDetail', params: { id } })
}

const handleClose = () => {
  emit('update:visible', false)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchHotArticles = async () => {
  try {
    hotArticles.value = await blogApi.getHotArticles()
  } catch (err) {
    console.error('Failed to fetch hot articles:', err)
  }
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    searchInputRef.value?.focus()
    if (hotArticles.value.length === 0) {
      fetchHotArticles()
    }
  } else {
    searchQuery.value = ''
    results.value = []
  }
})

onMounted(() => {
  if (props.visible) {
    fetchHotArticles()
  }
})
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-container {
  width: 100%;
  max-width: 680px;
  max-height: 70vh;
  background: var(--color-background, #fff);
  border-radius: var(--radius-xl, 16px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-bottom: 1px solid var(--stone-200, #e7e5e4);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  background: var(--stone-100, #f5f5f4);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
}

.search-icon {
  color: var(--stone-400, #a8a29e);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-lg, 18px);
  color: var(--ink-900, #1c1917);
  outline: none;
}

.search-input::placeholder {
  color: var(--stone-400, #a8a29e);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--stone-400, #a8a29e);
  background: transparent;
  border: none;
  border-radius: var(--radius-full, 9999px);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: var(--stone-600, #57534e);
  background: var(--stone-200, #e7e5e4);
}

.close-btn {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--stone-500, #78716c);
  background: var(--stone-100, #f5f5f4);
  border: none;
  border-radius: var(--radius-base, 6px);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--ink-900, #1c1917);
  background: var(--stone-200, #e7e5e4);
}

.search-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4, 16px);
}

.search-loading {
  display: flex;
  justify-content: center;
  padding: var(--space-12, 48px);
}

.loading-dots {
  display: flex;
  gap: var(--space-2, 8px);
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vermilion, #c53d43);
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
}

.results-header {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  color: var(--stone-500, #78716c);
  padding: 0 var(--space-2, 8px);
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  padding: var(--space-4, 16px);
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: var(--stone-100, #f5f5f4);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-2, 8px);
}

.result-category {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--vermilion, #c53d43);
  background: var(--vermilion-dim, rgba(197, 61, 67, 0.1));
  padding: 2px 8px;
  border-radius: var(--radius-sm, 4px);
}

.result-date {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xs, 12px);
  color: var(--stone-400, #a8a29e);
}

.result-title {
  font-family: var(--font-serif, serif);
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--ink-900, #1c1917);
  margin: 0 0 var(--space-2, 8px) 0;
  line-height: 1.4;
}

.result-title :deep(.highlight) {
  background: rgba(197, 61, 67, 0.2);
  color: var(--vermilion, #c53d43);
  padding: 0 2px;
  border-radius: 2px;
}

.result-excerpt {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  color: var(--stone-600, #57534e);
  line-height: 1.6;
  margin: 0 0 var(--space-2, 8px) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-excerpt :deep(.highlight) {
  background: rgba(197, 61, 67, 0.2);
  color: var(--vermilion, #c53d43);
  padding: 0 2px;
  border-radius: 2px;
}

.result-tags {
  display: flex;
  gap: var(--space-2, 8px);
}

.result-tags .tag {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xs, 12px);
  color: var(--stone-500, #78716c);
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12, 48px);
  text-align: center;
  color: var(--stone-400, #a8a29e);
}

.search-empty p {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-base, 16px);
  color: var(--stone-600, #57534e);
  margin: var(--space-4, 16px) 0 var(--space-2, 8px);
}

.search-empty span {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
}

.search-initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8, 32px);
}

.initial-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--stone-400, #a8a29e);
}

.initial-hint p {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  margin-top: var(--space-3, 12px);
}

.hot-articles {
  width: 100%;
  margin-top: var(--space-6, 24px);
  padding-top: var(--space-6, 24px);
  border-top: 1px solid var(--stone-200, #e7e5e4);
}

.hot-title {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--stone-500, #78716c);
  margin: 0 0 var(--space-3, 12px) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.hot-item {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  width: 100%;
  padding: var(--space-3, 12px);
  background: transparent;
  border: none;
  border-radius: var(--radius-base, 6px);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-item:hover {
  background: var(--stone-100, #f5f5f4);
}

.hot-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--vermilion, #c53d43);
  background: var(--vermilion-dim, rgba(197, 61, 67, 0.1));
  border-radius: var(--radius-sm, 4px);
}

.hot-name {
  flex: 1;
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  color: var(--stone-700, #44403c);
}

/* Transition */
.search-enter-active,
.search-leave-active {
  transition: all 0.3s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
}

.search-enter-from .search-container,
.search-leave-to .search-container {
  transform: translateY(-20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-overlay {
    padding-top: 10vh;
  }

  .search-container {
    max-width: 100%;
    max-height: 80vh;
    margin: 0 var(--space-4, 16px);
    border-radius: var(--radius-lg, 12px);
  }

  .search-header {
    padding: var(--space-3, 12px) var(--space-4, 16px);
  }

  .search-input {
    font-size: var(--font-size-base, 16px);
  }
}
</style>
