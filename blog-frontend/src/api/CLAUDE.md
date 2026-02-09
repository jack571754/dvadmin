# API 服务层 - 模块文档

[项目根](../../../CLAUDE.md) > [blog-frontend](../../CLAUDE.md) > [src](../) > **api**

---

## 模块职责

负责与后端 DVAdmin 系统的 HTTP 通信，提供类型安全的 API 调用接口，处理数据转换与错误处理。

---

## 入口与启动

**主文件**：`blog.ts`

**使用方式**：

```typescript
import { blogApi } from '@/api/blog'

// 获取文章列表
const response = await blogApi.getArticles(1, 10)

// 获取单篇文章
const article = await blogApi.getArticle('123')
```

---

## 对外接口

### BlogApiService 类

#### 文章相关

- `getArticles(page, pageSize)` - 获取文章列表（分页）
- `getArticle(id)` - 获取文章详情
- `getArticlesByCategory(categoryId, page, pageSize)` - 按分类获取文章
- `getArticlesByTag(tagId, page, pageSize)` - 按标签获取文章
- `searchArticles(query, page, pageSize)` - 搜索文章

#### 分类与标签

- `getCategories()` - 获取所有分类
- `getTags()` - 获取所有标签

#### 用户认证

- `login(username, password)` - 用户登录，返回 JWT token
- `register(username, email, password)` - 用户注册
- `getUserInfo()` - 获取当前用户信息

---

## 关键依赖与配置

### 依赖

- **axios 1.7.7** - HTTP 客户端
- **@/types/blog** - 类型定义
- **@/utils/date** - 日期格式化工具
- **@/utils/errorHandler** - 错误处理工具

### 配置

```typescript
// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'

// 请求超时
const API_TIMEOUT = 10000
```

### 环境变量

`.env` 文件配置：

```env
VITE_API_BASE_URL=http://localhost:9000/api
```

---

## 数据模型

### BackendResponse<T>

后端统一响应格式：

```typescript
interface BackendResponse<T> {
  code: number          // 状态码（2000 表示成功）
  msg: string           // 消息
  data: T              // 实际数据
  page?: number        // 当前页
  limit?: number       // 每页数量
  total?: number       // 总数
  is_next?: boolean    // 是否有下一页
  is_previous?: boolean // 是否有上一页
}
```

### ArticleApiResponse

后端文章对象格式：

```typescript
interface ArticleApiResponse {
  id: number
  title: string
  summary?: string
  content?: string
  cover_image?: string | null
  category?: number | null
  category_name?: string | null
  tags_list?: Tag[]
  status: string
  views_count: number
  likes_count: number
  is_top: boolean
  author_name?: string | null
  create_datetime: string
  update_datetime?: string
}
```

### Article（前端格式）

经过 `transformArticle` 转换后的格式：

```typescript
interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  createdAt: string
  readTime: number
  category: string
  categoryId: number | null
  author: string
  slug: string
  tags?: string[]
}
```

---

## 拦截器

### 请求拦截器

自动添加 JWT 认证头：

```typescript
config.headers.Authorization = `JWT ${token}`
```

### 响应拦截器

- 401 错误：自动清除本地 token
- 统一错误处理：调用 `handleApiError` 转换为用户友好消息

---

## 错误处理

### HTTP 状态码映射

| 状态码 | 消息 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 请先登录 |
| 403 | 没有权限访问 |
| 404 | 请求的资源不存在 |
| 500 | 服务器错误，请稍后重试 |
| 502/503/504 | 服务暂时不可用，请稍后重试 |

### 网络错误

- `ERR_NETWORK` - 网络连接失败，请检查网络设置
- `ECONNABORTED` - 请求超时，请稍后重试

---

## 相关文件清单

```
src/api/
└── blog.ts              # 博客 API 服务类（336 行）
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |

---

## 使用示例

### 获取文章列表

```typescript
import { blogApi } from '@/api/blog'

const response = await blogApi.getArticles(1, 10)
console.log(response.results)  // 文章数组
console.log(response.count)    // 总数
console.log(response.next)     // 下一页
```

### 用户登录

```typescript
const { token, refreshToken } = await blogApi.login('username', 'password')
localStorage.setItem('auth_token', token)
```

### 错误处理

```typescript
try {
  const article = await blogApi.getArticle('123')
} catch (error) {
  console.error(error.message)  // 用户友好的错误消息
}
```
