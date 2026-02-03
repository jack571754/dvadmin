# 状态管理 - 模块文档

[根目录](../../CLAUDE.md) > [src](../) > **stores**

---

## 模块职责

使用 Pinia 管理应用的全局状态，包括用户认证状态和文章数据状态。

---

## Store 清单

| Store | 文件 | 说明 |
|-------|------|------|
| auth | auth.ts | 用户认证状态（登录、登出、token） |
| articles | articles.ts | 文章数据状态（列表、详情、分类、标签） |

---

## auth.ts

### 功能

- JWT 认证管理
- 用户信息存储
- 自动 token 刷新

### State

```typescript
token: string | null          // JWT 访问令牌
user: User | null             // 用户对象
```

### Getters

```typescript
isLoggedIn: boolean           // 是否已登录
```

### Actions

```typescript
login(username, password)     // 用户登录
register(data)                // 用户注册
getUserInfo()                 // 获取用户信息
fetchUserInfo(redirectOnError) // 获取并存储用户信息
logout()                      // 登出
initAuth()                    // 初始化认证状态
```

### 用户对象

```typescript
interface User {
  id: number
  username: string
  name?: string
  email?: string
}
```

### 后端对接

- 登录端点：`POST /login/` - 返回 `{ access, refresh }`
- 用户信息：`GET /system/user/user_info/`
- 认证头格式：`Authorization: JWT <token>`

---

## articles.ts

### 功能

- 文章列表状态管理
- 分页控制
- 分类和标签筛选

### State

```typescript
articles: Article[]           // 文章列表
currentArticle: Article | null  // 当前文章
categories: Category[]        // 分类列表
tags: Tag[]                   // 标签列表
loading: boolean              // 加载状态
error: string | null          // 错误消息
currentPage: number           // 当前页
pageSize: number              // 每页数量
totalCount: number            // 总数
hasNext: boolean              // 有下一页
hasPrevious: boolean          // 有上一页
```

### Getters

```typescript
hasArticles: boolean          // 有文章
hasCategories: boolean        // 有分类
hasTags: boolean              // 有标签
totalPages: number            // 总页数
```

### Actions

```typescript
fetchArticles(page, reset)          // 获取文章列表
fetchArticle(id)                    // 获取文章详情
fetchCategories()                   // 获取分类
fetchTags()                         // 获取标签
fetchArticlesByCategory(categoryId, page)  // 按分类获取
fetchArticlesByTag(tagId, page)     // 按标签获取
searchArticles(query, page)         // 搜索文章
loadMore()                          // 加载更多
resetArticles()                     // 重置状态
clearError()                        // 清除错误
```

---

## 相关文件清单

```
src/stores/
├── auth.ts              # 认证状态管理（232 行）
└── articles.ts          # 文章状态管理（244 行）
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
