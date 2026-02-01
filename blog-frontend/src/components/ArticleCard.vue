<template>
  <article
    class="article-card"
    :class="{ 'article-card--featured': featured, 'article-card--loading': loading }"
    @click="handleClick"
  >
    <!-- Card Decoration -->
    <div class="card-decoration">
      <span class="decoration-number">{{ String(index).padStart(2, '0') }}</span>
      <span class="decoration-line"></span>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Meta Row -->
      <div class="card-meta">
        <time v-if="article.createdAt" class="meta-date">{{ formattedDate }}</time>
        <span v-if="article.category" class="meta-category">
          <span class="category-dot"></span>
          {{ article.category }}
        </span>
        <span class="meta-read-time">{{ article.readTime || 5 }} min</span>
      </div>

      <!-- Title -->
      <h3 class="card-title">{{ article.title }}</h3>

      <!-- Excerpt -->
      <p v-if="article.excerpt" class="card-excerpt">{{ article.excerpt }}</p>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length" class="card-tags">
        <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>

      <!-- Footer Row -->
      <div class="card-footer">
        <span class="footer-date">{{ formatDate(article.createdAt) }}</span>
        <span class="footer-arrow">→</span>
      </div>
    </div>

    <!-- Hover Effect Overlay -->
    <div class="card-overlay"></div>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '@/types/blog'
import { formatDate } from '@/utils/date'

interface Props {
  article: Article
  index?: number
  featured?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'click', article: Article): void
}

const props = withDefaults(defineProps<Props>(), {
  index: 1,
  featured: false,
  loading: false,
})

const emit = defineEmits<Emits>()

const formattedDate = formatDate(props.article.createdAt)

function handleClick(): void {
  if (!props.loading) {
    emit('click', props.article)
  }
}
</script>

<style scoped>
.article-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out-quart);
  overflow: hidden;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--vermilion), #e85544);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-quart);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-ink);
}

.article-card:hover::before {
  opacity: 1;
}

.article-card:hover .card-overlay {
  opacity: 1;
}

.article-card:hover .footer-arrow {
  transform: translateX(4px);
  color: var(--vermilion);
}

.article-card:hover .decoration-number {
  color: var(--vermilion);
}

.article-card--loading {
  opacity: 0.5;
  pointer-events: none;
}

.article-card--featured {
  grid-template-columns: 1fr;
  gap: var(--space-6);
  padding: var(--space-10);
}

.article-card--featured .card-decoration {
  display: none;
}

/* ========================================
   Card Decoration
   ======================================== */

.card-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.decoration-number {
  font-family: var(--font-serif);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  color: var(--stone-300);
  line-height: 1;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.decoration-line {
  width: 1px;
  flex: 1;
  min-height: 40px;
  background: linear-gradient(to bottom, var(--stone-200), transparent);
}

/* ========================================
   Card Content
   ======================================== */

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

/* Meta Row */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.meta-date,
.meta-read-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--stone-500);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.meta-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1_5);
  padding: var(--space-1) var(--space-2);
  background: var(--vermilion-dim);
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--vermilion);
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.category-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

/* Title */
.card-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  line-height: var(--leading-snug);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.article-card:hover .card-title {
  color: var(--vermilion);
}

.article-card--featured .card-title {
  font-size: var(--font-size-3xl);
  -webkit-line-clamp: 3;
}

/* Excerpt */
.card-excerpt {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-card--featured .card-excerpt {
  font-size: var(--font-size-lg);
  -webkit-line-clamp: 3;
}

/* Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--stone-500);
  padding: var(--space-1) var(--space-2);
  background: var(--stone-100);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.article-card:hover .tag {
  color: var(--vermilion);
  background: var(--vermilion-dim);
}

/* Footer Row */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--stone-100);
}

.footer-date {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-400);
  font-variant-numeric: tabular-nums;
}

.footer-arrow {
  font-size: var(--font-size-lg);
  color: var(--stone-300);
  line-height: 1;
  transition: all var(--duration-normal) var(--ease-out-quart);
}

/* ========================================
   Card Overlay
   ======================================== */

.card-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(200, 64, 46, 0.03) 0%,
    transparent 60%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-normal) var(--ease-out-quart);
}

/* ========================================
   Featured Card Variant
   ======================================== */

.article-card--featured {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--stone-50) 100%);
}

.article-card--featured .card-excerpt {
  max-width: 600px;
}

/* ========================================
   Responsive Design
   ======================================== */

@media (max-width: 640px) {
  .article-card {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .card-decoration {
    display: none;
  }

  .card-title {
    font-size: var(--font-size-lg);
  }

  .card-excerpt {
    font-size: var(--font-size-sm);
  }

  .article-card--featured {
    padding: var(--space-6);
  }

  .article-card--featured .card-title {
    font-size: var(--font-size-xl);
  }

  .article-card--featured .card-excerpt {
    font-size: var(--font-size-base);
  }
}
</style>
