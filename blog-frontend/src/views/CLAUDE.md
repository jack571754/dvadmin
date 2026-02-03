# 页面视图 - 模块文档

[根目录](../../CLAUDE.md) > [src](../) > **views**

---

## 模块职责

提供应用的所有页面视图组件，包括首页、文章详情、归档、关于、登录、注册和 404 页面。

---

## 页面清单

| 页面 | 路由 | 组件 | 说明 |
|------|------|------|------|
| 首页 | `/` | Home.vue | 文章列表，支持日期/分类筛选 |
| 文章详情 | `/article/:id` | ArticleDetail.vue | Markdown 渲染，代码高亮 |
| 归档 | `/archive` | Archive.vue | 按时间归档 |
| 关于 | `/about` | About.vue | 关于页面 |
| 登录 | `/login` | Login.vue | 用户登录 |
| 注册 | `/register` | Register.vue | 用户注册 |
| 404 | `*` | NotFound.vue | 404 页面 |

---

## Home.vue

### 功能

- Hero 区域（墨韵开篇动画）
- 文章列表展示
- 侧边栏筛选（按日期/分类）
- 分页加载
- 响应式布局

### 状态

```typescript
articles: Article[]           // 文章列表
categories: Category[]        // 分类列表
loading: boolean              // 加载状态
error: string                 // 错误消息
isScrolled: boolean           // 是否滚动
sidebarCollapsed: boolean     // 侧边栏折叠
activeTab: 'date' | 'category' // 活动选项卡
selectedYearMonth: string | null  // 选中年月
selectedCategory: string | number | null  // 选中分类
currentPage: number           // 当前页
totalCount: number            // 总数
```

### API 调用

```typescript
blogApi.getArticles(page, pageSize)    // 获取文章
blogApi.getCategories()                 // 获取分类
```

---

## ArticleDetail.vue

### 功能

- 阅读进度条
- Markdown 内容渲染
- 代码语法高亮 + 复制按钮
- 分享功能（Twitter、复制链接）
- 响应式设计

### 状态

```typescript
article: Article | null     // 文章对象
loading: boolean            // 加载状态
error: string               // 错误消息
readingProgress: number     // 阅读进度
showToast: boolean          // 显示提示
toastMessage: string        // 提示消息
```

### API 调用

```typescript
blogApi.getArticle(id)      // 获取文章详情
```

### Markdown 渲染

使用 `markdown-it` + `highlight.js`：

```typescript
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => { ... }
})
```

---

## Archive.vue

### 功能

- 按年份归档文章
- 按年月分组显示

### 状态

```typescript
articles: Article[]      // 文章列表
loading: boolean         // 加载状态
error: string            // 错误消息
groupedArticles: Record<string, Article[]>  // 分组文章
```

### API 调用

```typescript
blogApi.getArticles()    // 获取所有文章
```

---

## About.vue

### 功能

- 关于页面展示
- 静态内容

---

## Login.vue

### 功能

- 用户登录表单
- JWT 认证
- 错误提示

### 表单字段

```typescript
username: string         // 用户名
password: string         // 密码
```

### Store 调用

```typescript
authStore.login(username, password)
```

---

## Register.vue

### 功能

- 用户注册表单
- 表单验证

### 表单字段

```typescript
username: string         // 用户名
email: string            // 邮箱
password: string         // 密码
confirmPassword: string  // 确认密码
```

### Store 调用

```typescript
authStore.register(data)
```

---

## NotFound.vue

### 功能

- 404 错误页面
- 返回首页按钮

---

## 相关文件清单

```
src/views/
├── Home.vue              # 首页（1074 行）
├── ArticleDetail.vue     # 文章详情（970 行）
├── Archive.vue           # 归档页
├── About.vue             # 关于页
├── Login.vue             # 登录页
├── Register.vue          # 注册页
└── NotFound.vue          # 404 页
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
