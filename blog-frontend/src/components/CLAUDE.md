# 通用组件 - 模块文档

[根目录](../../CLAUDE.md) > [src](../) > **components**

---

## 模块职责

提供可复用的 Vue 3 组件，包括布局组件（Header、Footer、Sidebar）和功能组件（ArticleCard、MarkdownRenderer）。

---

## 组件清单

| 组件 | 文件 | 说明 |
|------|------|------|
| Header | Header.vue | 页头导航，包含桌面端和移动端菜单 |
| Footer | Footer.vue | 页脚，显示博客信息和社交链接 |
| ArticleCard | ArticleCard.vue | 文章卡片组件 |
| MarkdownRenderer | MarkdownRenderer.vue | Markdown 内容渲染器 |
| Sidebar | Sidebar.vue | 侧边栏（日期/分类筛选） |

---

## Header.vue

### 功能

- 响应式导航（桌面端水平菜单 + 移动端汉堡菜单）
- 用户认证状态显示
- 用户下拉菜单（修改密码、退出登录）
- 滚动时背景变化

### Props

无（使用内部状态）

### Events

无

### 状态

```typescript
isScrolled: boolean        // 是否滚动
mobileMenuOpen: boolean    // 移动菜单开启
userMenuOpen: boolean      // 用户菜单开启
```

### 插槽

无

---

## Footer.vue

### 功能

- 显示博客名称和描述
- 导航链接
- 社交媒体链接

### Props

```typescript
blogName: string          // 博客名称
description: string       // 博客描述
navLinks: NavLink[]       // 导航链接
socialLinks: SocialLink[] // 社交链接
```

### Events

无

---

## ArticleCard.vue

### 功能

显示文章摘要卡片，包含标题、分类、日期、标签。

### Props

```typescript
article: Article          // 文章对象
loading?: boolean         // 加载状态
```

### Events

```typescript
@click - 点击卡片，跳转文章详情
```

---

## MarkdownRenderer.vue

### 功能

- Markdown 内容渲染
- 代码语法高亮（支持多种语言）
- 代码复制按钮

### Props

```typescript
content: string           // Markdown 内容
```

### 支持的语言

JavaScript, TypeScript, Python, JSON, XML/HTML, CSS, SQL, Bash/Shell

---

## Sidebar.vue

### 功能

- 可折叠侧边栏
- 选项卡切换（日期/分类）
- 日期归档（按年月分组）
- 分类筛选

### Props

```typescript
articles: Article[]       // 文章列表
categories: Category[]    // 分类列表
```

### Events

```typescript
@filter - 筛选变化事件
```

---

## 相关文件清单

```
src/components/
├── Header.vue              # 页头导航（727 行）
├── Footer.vue              # 页脚组件
├── ArticleCard.vue         # 文章卡片
├── MarkdownRenderer.vue    # Markdown 渲染器
└── Sidebar.vue             # 侧边栏
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
