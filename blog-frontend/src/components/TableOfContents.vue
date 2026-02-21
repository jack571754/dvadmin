<template>
  <div class="toc-container" :class="{ 'toc-container--visible': headings.length > 0 }">
    <!-- 标题 -->
    <div class="toc-header">
      <div class="toc-header-inner">
        <span class="toc-icon">≡</span>
        <span class="toc-title">目录</span>
      </div>
      <span class="toc-count">{{ headings.length }}</span>
    </div>

    <!-- 目录导航 -->
    <nav class="toc-nav">
      <ul class="toc-list">
        <li
          v-for="heading in headings"
          :key="heading.id"
          :class="[
            'toc-item',
            `toc-item--level-${heading.level}`,
            { 'toc-item--active': activeId === heading.id }
          ]"
        >
          <a
            :href="`#${heading.id}`"
            @click.prevent="scrollToHeading(heading.id)"
            class="toc-link"
            :title="heading.text"
          >
            <span class="toc-indicator"></span>
            <span class="toc-text">{{ heading.text }}</span>
          </a>
        </li>
      </ul>

      <!-- 空状态 -->
      <div v-if="headings.length === 0" class="toc-empty">
        <span class="empty-text">暂无目录</span>
      </div>
    </nav>

    <!-- 阅读进度 -->
    <div class="toc-progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  content?: string
}

const props = defineProps<Props>()

const headings = ref<Heading[]>([])
const activeId = ref('')
const progress = ref(0)

const extractHeadings = (content: string) => {
  if (!content) return

  const headingRegex = /<h([1-4])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi
  const extracted: Heading[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    // 清理 HTML 标签，只保留纯文本
    const text = match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()

    if (text) {
      extracted.push({ id, text, level })
    }
  }

  headings.value = extracted
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    // 更新激活状态
    activeId.value = id
  }
}

const updateActiveHeading = () => {
  const headingElements = headings.value.map(h => ({
    id: h.id,
    element: document.getElementById(h.id)
  })).filter(h => h.element)

  if (headingElements.length === 0) return

  const scrollPosition = window.scrollY + 100

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const { id, element } = headingElements[i]
    if (element && element.offsetTop <= scrollPosition) {
      activeId.value = id

      // 更新阅读进度
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      progress.value = Math.min(100, (window.scrollY / docHeight) * 100)

      return
    }
  }

  activeId.value = headingElements[0]?.id || ''
}

watch(() => props.content, (newContent) => {
  if (newContent) {
    extractHeadings(newContent)
  }
}, { immediate: true })

onMounted(() => {
  if (props.content) {
    extractHeadings(props.content)
  }
  window.addEventListener('scroll', updateActiveHeading, { passive: true })
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})
</script>

<style scoped>
.toc-container {
  position: sticky;
  top: 80px;
  width: 220px;
  max-height: calc(100vh - 100px);
  background: var(--color-surface);
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: opacity var(--duration-normal) var(--ease-out-quart);
}

.toc-container--visible {
  opacity: 1;
}

/* 标题区 */
.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--stone-200);
}

.toc-header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toc-icon {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  color: var(--vermilion);
}

.toc-title {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--ink-900);
}

.toc-count {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  background: var(--stone-100);
  padding: var(--space-0_5) var(--space-2);
  border-radius: var(--radius-full);
}

/* 目录导航 */
.toc-nav {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: var(--space-2);
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  margin: 0;
  padding: 0;
}

.toc-link {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  text-decoration: none;
  line-height: 1.4;
  border-radius: var(--radius-base);
  transition: all var(--duration-fast) var(--ease-out-quart);
  cursor: pointer;
}

/* 文字截断 */
.toc-text {
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 指示点 */
.toc-indicator {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--stone-300);
  transition: background var(--duration-fast) var(--ease-out-quart);
}

/* 层级缩进 */
.toc-item--level-2 .toc-link {
  padding-left: var(--space-4);
}

.toc-item--level-3 .toc-link {
  padding-left: var(--space-6);
  font-size: var(--font-size-xs);
}

.toc-item--level-4 .toc-link {
  padding-left: var(--space-8);
  font-size: var(--font-size-xs);
}

/* 悬浮效果 */
.toc-link:hover {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

.toc-link:hover .toc-indicator {
  background: var(--vermilion);
}

/* 激活状态 */
.toc-item--active .toc-link {
  color: var(--vermilion);
  font-weight: var(--font-weight-medium);
  background: var(--vermilion-dim);
}

.toc-item--active .toc-indicator {
  background: var(--vermilion);
}

/* 空状态 */
.toc-empty {
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.empty-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-400);
}

/* 阅读进度条 */
.toc-progress {
  height: 2px;
  background: var(--stone-100);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--vermilion);
  transition: width 0.1s ease-out;
}

/* 滚动条 */
.toc-nav::-webkit-scrollbar {
  width: 4px;
}

.toc-nav::-webkit-scrollbar-track {
  background: transparent;
}

.toc-nav::-webkit-scrollbar-thumb {
  background: var(--stone-300);
  border-radius: var(--radius-full);
}

/* 响应式 */
@media (max-width: 1024px) {
  .toc-container {
    display: none;
  }
}
</style>
