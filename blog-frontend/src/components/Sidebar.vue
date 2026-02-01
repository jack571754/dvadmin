<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <!-- Toggle Button -->
    <button @click="toggleCollapse" class="sidebar-toggle" :title="isCollapsed ? '展开目录' : '收起目录'">
      <span class="toggle-icon">{{ isCollapsed ? '→' : '←' }}</span>
    </button>

    <div v-if="!isCollapsed" class="sidebar-inner">
      <!-- Tab Switcher -->
      <div class="sidebar-tabs">
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'date' }]"
          @click="setTab('date')"
        >
          日期
        </button>
        <button
          :class="['tab-button', { 'tab-button--active': activeTab === 'category' }]"
          @click="setTab('category')"
        >
          分类
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="sidebar-loading">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>

      <!-- Date Archive -->
      <div v-else-if="activeTab === 'date'" class="sidebar-content">
        <h3 class="sidebar-title">按日期</h3>
        <nav class="archive-list">
          <router-link
            v-for="group in dateGroups"
            :key="group.year"
            :to="`/archive?year=${group.year}`"
            class="archive-item"
            :class="{ 'archive-item--active': isActiveYear(group.year) }"
          >
            <span class="archive-year">{{ group.year }}</span>
            <span class="archive-count">{{ group.count }}</span>
          </router-link>
          <div v-if="dateGroups.length === 0" class="sidebar-empty">
            暂无归档
          </div>
        </nav>
      </div>

      <!-- Categories -->
      <div v-else-if="activeTab === 'category'" class="sidebar-content">
        <h3 class="sidebar-title">按分类</h3>
        <nav class="category-list">
          <router-link
            v-for="category in categories"
            :key="category.id"
            :to="`/?category=${category.id}`"
            class="category-item"
            :class="{ 'category-item--active': isActiveCategory(category.id) }"
          >
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.article_count || 0 }}</span>
          </router-link>
          <div v-if="categories.length === 0" class="sidebar-empty">
            暂无分类
          </div>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { blogApi, type Category, type Article } from '@/api/blog'

interface DateGroup {
  year: string
  count: number
}

const route = useRoute()
const activeTab = ref<'date' | 'category'>('date')
const isCollapsed = ref(false)
const loading = ref(true)
const categories = ref<Category[]>([])
const allArticles = ref<Article[]>([])

// Check if year is active
const isActiveYear = (year: string) => {
  const yearParam = route.query.year
  return yearParam === year
}

// Check if category is active
const isActiveCategory = (categoryId: string | number) => {
  const categoryParam = route.query.category
  return categoryParam === String(categoryId)
}

// Calculate date groups from articles
const dateGroups = computed((): DateGroup[] => {
  const groups: { [key: string]: number } = {}

  allArticles.value.forEach(article => {
    const date = new Date(article.createdAt)
    const year = date.getFullYear().toString()
    groups[year] = (groups[year] || 0) + 1
  })

  return Object.keys(groups)
    .sort()
    .reverse()
    .map(year => ({ year, count: groups[year] }))
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const setTab = (tab: 'date' | 'category') => {
  activeTab.value = tab
}

const fetchCategories = async () => {
  loading.value = true
  try {
    categories.value = await blogApi.getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    categories.value = []
  } finally {
    loading.value = false
  }
}

const fetchArticlesForDateGroups = async () => {
  try {
    // Fetch all articles to calculate date groups
    // Get page 1 with a large page size, or fetch multiple pages
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      const response = await blogApi.getArticles(page, pageSize)
      allArticles.value.push(...response.results)
      hasMore = response.next !== null
      page++
    }
  } catch (err) {
    console.error('Failed to fetch articles for date groups:', err)
  }
}

// Initialize data
const init = async () => {
  loading.value = true
  await Promise.all([
    fetchCategories(),
    fetchArticlesForDateGroups()
  ])
  loading.value = false
}

// Watch route changes to update active tab
watch(() => route.query, (query) => {
  if (query.year) {
    activeTab.value = 'date'
  } else if (query.category) {
    activeTab.value = 'category'
  }
}, { immediate: true })

// Also watch route to fetch data when needed
watch(() => route.path, (newPath) => {
  if (newPath === '/' && allArticles.value.length === 0) {
    init()
  }
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 64px;
  width: 220px;
  height: calc(100vh - 64px);
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: width var(--transition-normal);
  z-index: 50;
  overflow-y: auto;
}

.sidebar--collapsed {
  width: 48px;
}

.sidebar-toggle {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
  border-color: var(--color-accent);
}

.toggle-icon {
  font-size: var(--font-size-body);
  color: var(--color-secondary);
  line-height: 1;
}

.sidebar--collapsed .toggle-icon {
  transform: rotate(180deg);
}

.sidebar-inner {
  padding: var(--space-lg);
  padding-top: var(--space-3xl);
}

/* Tabs */
.sidebar-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  flex: 1;
  font-family: var(--font-sans);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: var(--letter-wide);
}

.tab-button:hover {
  color: var(--color-primary);
}

.tab-button--active {
  color: var(--color-accent);
  border-color: var(--color-accent-light);
  background: var(--color-accent-light);
}

/* Loading State */
.sidebar-loading {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-lg) 0;
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

/* Content */
.sidebar-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-md) 0;
  letter-spacing: var(--letter-tight);
}

/* Archive List */
.archive-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.archive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.archive-item:hover {
  color: var(--color-primary);
  background: var(--color-hover);
}

.archive-item--active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.archive-year {
  font-weight: var(--font-weight-medium);
}

.archive-count {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.archive-item--active .archive-count {
  color: var(--color-accent);
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.category-item:hover {
  color: var(--color-primary);
  background: var(--color-hover);
}

.category-item--active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.category-name {
  font-weight: var(--font-weight-medium);
}

.category-count {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.category-item--active .category-count {
  color: var(--color-accent);
}

/* Empty State */
.sidebar-empty {
  padding: var(--space-lg) 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: var(--font-size-meta);
  color: var(--color-muted);
  font-style: italic;
}

/* Scrollbar for sidebar */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }

  .sidebar--collapsed {
    width: 48px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    z-index: 90;
    width: 100%;
    height: auto;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
    background: var(--color-surface);
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
    transform: translateY(-100%);
    transition: transform var(--transition-normal);
  }

  .sidebar.sidebar--collapsed {
    transform: translateY(-100%);
  }

  .sidebar:not(.sidebar--collapsed) {
    transform: translateY(0);
  }

  .sidebar-toggle {
    top: var(--space-sm);
    right: var(--space-sm);
  }

  .sidebar-inner {
    padding: var(--space-md);
    padding-top: var(--space-lg);
  }
}
</style>
