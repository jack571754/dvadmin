# DVAdmin 博客前端开发技能

> Vue 3.4.38 + TypeScript 5.6.2 + Vite 5.4.1
> 纸间墨语 - 东方美学设计系统

---

## 设计理念

博客前端采用"纸间墨语"设计系统：
- **纸**：纯净、素雅的背景
- **墨**：深邃、内敛的文字
- **留白**：呼吸感、禅意空间

---

## 设计系统变量

### 颜色

```css
:root {
  --color-primary: #0d0d0d;
  --color-accent: #b8860b;
  --color-text: #0d0d0d;
  --color-text-secondary: #4a4a4a;
  --color-background: #fafaf9;
  --color-surface: #ffffff;
  --color-border: #e5e5e5;
}
```

### 间距

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

### 字体

```css
:root {
  --font-sans: 'Inter', 'Noto Sans SC', sans-serif;
  --font-serif: 'Noto Serif SC', serif;
  --font-mono: 'Fira Code', monospace;
}
```

---

## 组件规范

```vue
<template>
  <article class="article-card">
    <h3 class="article-card__title">
      <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
    </h3>
    <p class="article-card__excerpt">{{ article.excerpt }}</p>
  </article>
</template>

<script setup lang="ts">
import type { Article } from '@/types/blog'

interface Props {
  article: Article
}
const props = defineProps<Props>()
</script>

<style scoped>
.article-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.article-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}
</style>
```

---

## API 请求

```typescript
// src/api/blog.ts
import request from './request'

export const blogApi = {
  getArticles: (params?) => request.get('/blog/article/', { params }),
  getArticle: (id: number) => request.get(`/blog/article/${id}/`),
  getCategories: () => request.get('/blog/category/'),
}
```

---

## 状态管理

```typescript
// stores/blog.ts
import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  state: () => ({ articles: [], categories: [] }),
  actions: {
    async fetchArticles(params?) {
      const res = await blogApi.getArticles(params)
      this.articles = res.data.data
    },
  },
})
```

---

## 开发命令

```bash
cd blog-frontend
yarn install
yarn run dev      # http://localhost:5173
yarn run build
```

---

## 代理配置

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:9000',
      changeOrigin: true,
    },
  },
}
```

---

## 注意事项

- 严格使用 CSS 变量
- 保持简洁、留白
- 标题用衬线体，正文用无衬线体
- 动画用 `var(--duration-normal)`
