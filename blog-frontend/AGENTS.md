# AI Agent 开发指南

> Blog Frontend 项目 AI 代理开发指南
> 
> 本文件为 agentic coding agents 提供项目开发、构建、测试和代码规范的完整指南。

---

## 构建和测试命令

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 类型检查

```bash
# TypeScript 类型检查
vue-tsc

# 或通过 npm scripts
npm run build  # 包含类型检查
```

### 注意事项

- 项目使用 Vite 5.4.1 作为构建工具
- 开发服务器默认运行在 http://localhost:5173
- 后端 API 代理到 http://localhost:9000/api
- 无独立的测试命令，构建过程包含类型检查

---

## 代码风格指南

### 1. 导入规范

#### Vue 组件导入顺序

```vue
<script setup lang="ts">
// 1. Vue 核心模块
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 2. Pinia stores
import { useAuthStore } from '@/stores/auth'

// 3. 类型定义
import type { Article, Category } from '@/types/blog'

// 4. API 服务
import { blogApi } from '@/api/blog'

// 5. 工具函数
import { formatDate } from '@/utils/date'
</script>
```

#### CSS 样式导入顺序

```typescript
// 1. 设计系统变量
import './assets/styles/variables.css'
import './assets/styles/animations.css'
import './assets/styles/global.css'

// 2. 第三方样式
import 'highlight.js/styles/github-dark.css'
```

### 2. 组件编写规范

#### Vue 单文件组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed, onMounted } from 'vue'

// 类型定义
interface Props {
  article: Article
  loading?: boolean
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 响应式状态
const isActive = ref(false)

// 计算属性
const displayTitle = computed(() => props.title.toUpperCase())

// 方法
const handleClick = (): void => {
  isActive.value = !isActive.value
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

#### Composition API 使用

```typescript
// ✅ 推荐：使用 <script setup>
<script setup lang="ts">
const count = ref(0)
const doubleCount = computed(() => count.value * 2)
const increment = () => count.value++
</script>

// ❌ 避免：使用 Options API
<script lang="ts">
export default {
  data() {
    return { count: 0 }
  }
}
</script>
```

### 3. TypeScript 规范

#### 类型定义

```typescript
// 接口定义使用 PascalCase
interface Article {
  id: string
  title: string
  createdAt: string
}

// 使用 type 定义联合类型
type Theme = 'light' | 'dark'
type Status = 'loading' | 'success' | 'error'

// 函数类型
type EventHandler<T = Event> = (event: T) => void

// 泛型接口
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

#### 函数声明

```typescript
// ✅ 推荐：明确的返回类型
const fetchArticles = async (): Promise<Article[]> => {
  const response = await blogApi.getArticles()
  return response.data
}

// ✅ 推荐：箭头函数 with 类型注解
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

// ❌ 避免：省略返回类型
const fetchArticles = async () => {
  // 缺少返回类型
}
```

### 4. 命名约定

#### 文件命名

```
组件文件：PascalCase.vue          # Header.vue, ArticleCard.vue
工具文件：camelCase.ts            # formatDate.ts, errorHandler.ts
类型文件：camelCase.ts            # blog.ts, user.ts
样式文件：kebab-case.css          # variables.css, animations.css
```

#### 变量命名

```typescript
// ✅ 推荐：语义化命名
const isLoggedIn = ref(false)
const articleList = ref<Article[]>([])
const handleUserLogin = async () => {}

// ✅ 推荐：布尔值使用 is/has/can 前缀
const isVisible = computed(() => show.value)
const hasPermission = ref(false)
const canEdit = computed(() => user.value?.role === 'admin')

// ❌ 避免：无意义命名
const data = ref([])
const flag = ref(false)
const fn = () => {}
```

#### 组件命名

```vue
<!-- ✅ 推荐：PascalCase -->
<template>
  <ArticleCard />
  <HeaderComponent />
  <UserProfile />
</template>

<!-- ❌ 避免：kebab-case 在模板中 -->
<template>
  <article-card />
  <header-component />
</template>
```

### 5. 错误处理

#### API 错误处理

```typescript
// ✅ 推荐：统一的错误处理
const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await blogApi.getArticles()
    return response.data
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    // 显示用户友好的错误信息
    showErrorToast('加载文章失败，请稍后重试')
    return []
  }
}

// ✅ 推荐：使用自定义错误类型
class ApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

#### 用户反馈

```typescript
// 使用 toast 或 alert 提供用户反馈
const handleLogin = async () => {
  try {
    await authStore.login(credentials)
    showSuccessToast('登录成功')
    await router.push('/')
  } catch (error) {
    showErrorToast(error.message || '登录失败')
  }
}
```

### 6. 样式规范

#### CSS 变量使用

```vue
<style scoped>
/* ✅ 推荐：使用设计系统变量 */
.article-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.article-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* ❌ 避免：硬编码值 */
.article-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.25s ease;
}
</style>
```

#### BEM 命名规范

```vue
<style scoped>
/* ✅ 推荐：BEM 命名 */
.nav-item { /* Block */ }
.nav-item--active { /* Modifier */ }
.nav-item__icon { /* Element */ }
.nav-item__text { /* Element */ }

/* 对于简单组件，可以使用 kebab-case */
.header-logo { }
.user-dropdown { }
</style>
```

### 7. 设计系统使用

#### 颜色使用

```vue
<style scoped>
/* ✅ 推荐：语义化颜色 */
.title {
  color: var(--color-primary);
}

.accent-text {
  color: var(--color-accent);
}

.muted-text {
  color: var(--color-muted);
}

/* ❌ 避免：直接颜色值 */
.title {
  color: #0d0d0d;
}
</style>
```

#### 间距和布局

```vue
<style scoped>
/* ✅ 推荐：使用间距变量 */
.container {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

/* ❌ 避免：硬编码间距 */
.container {
  padding: 24px;
  margin-bottom: 32px;
}
</style>
```

### 8. 性能优化

#### 组件懒加载

```typescript
// ✅ 推荐：路由懒加载
const routes = [
  {
    path: '/article/:id',
    component: () => import('@/views/ArticleDetail.vue')
  }
]

// ✅ 推荐：组件异步加载
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
```

#### 响应式优化

```typescript
// ✅ 推荐：shallowRef 用于大对象
const largeData = shallowRef<LargeDataType>({})

// ✅ 推荐：computed 缓存计算结果
const filteredArticles = computed(() => {
  return articles.value.filter(article => article.category === selectedCategory.value)
})

// ✅ 推荐：避免不必要的响应式
const staticConfig = {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  version: '1.0.0'
}
```

### 9. 环境变量

```typescript
// ✅ 推荐：使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 在 .env 文件中定义
// VITE_API_BASE_URL=http://localhost:9000/api

// ❌ 避免：硬编码配置
const API_BASE_URL = 'http://localhost:9000/api'
```

### 10. 注释规范

```typescript
/**
 * 格式化日期为本地化字符串
 * @param date - 日期字符串或 Date 对象
 * @param options - 格式化选项
 * @returns 格式化后的日期字符串
 * @example
 * formatDate('2024-01-01') // '2024年1月1日'
 */
const formatDate = (
  date: string | Date, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', options)
}

// 对于简单逻辑，使用行内注释
const isActive = ref(false) // 当前激活状态

// 对于复杂逻辑，使用块注释
// 检查用户权限：
// 1. 验证用户是否已登录
// 2. 检查用户角色权限
// 3. 验证资源访问权限
const canAccessResource = (user: User, resource: Resource): boolean => {
  if (!user.isLoggedIn) return false
  if (!user.roles.includes('admin')) return false
  return checkResourcePermission(user, resource)
}
```

---

## 开发最佳实践

### 1. 组件设计

- **单一职责**：每个组件只负责一个功能
- **可复用性**：通过 props 和 slots 提高复用性
- **无障碍性**：添加 aria 标签和键盘导航支持

### 2. 状态管理

- **本地状态**：使用 `ref` 和 `reactive`
- **全局状态**：使用 Pinia stores
- **服务端状态**：考虑使用 SWR 或 TanStack Query

### 3. 代码分割

- **路由分割**：使用动态导入
- **组件分割**：大型组件使用 `defineAsyncComponent`
- **Vendor 分割**：在 vite.config.ts 中配置 manualChunks

### 4. TypeScript 严格性

- **启用严格模式**：tsconfig.json 中 `strict: true`
- **避免 any**：使用 unknown 或具体类型
- **类型断言**：谨慎使用 `as`

---

## 常见问题解决

### 1. 类型错误

```bash
# 类型检查失败
vue-tsc --noEmit
```

### 2. 构建优化

```typescript
// vite.config.ts 优化配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['axios', 'markdown-it']
        }
      }
    }
  }
})
```

### 3. 开发环境代理

```typescript
// vite.config.ts 代理配置
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:9000',
      changeOrigin: true
    }
  }
}
```

---

## 文件清单参考

```
src/
├── api/                # API 服务层
├── assets/styles/      # 样式文件
├── components/         # 通用组件
├── router/            # 路由配置
├── stores/            # Pinia stores
├── types/             # 类型定义
├── utils/             # 工具函数
├── views/             # 页面组件
├── App.vue            # 根组件
└── main.ts            # 应用入口
```

---

## 生成信息

- **项目**：Blog Frontend (纸间墨语)
- **技术栈**：Vue 3.4.38 + TypeScript 5.6.2 + Vite 5.4.1
- **设计系统**：墨与纸 东方美学
- **生成时间**：2025-02-14
- **文档版本**：v1.0.0