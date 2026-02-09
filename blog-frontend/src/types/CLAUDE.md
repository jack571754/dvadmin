# 类型定义 - 模块文档

[项目根](../../../CLAUDE.md) > [blog-frontend](../../CLAUDE.md) > [src](../) > **types**

---

## 模块职责

定义应用中使用的 TypeScript 接口和类型，提供类型安全保障。

---

## 类型定义

### Article - 文章对象

```typescript
interface Article {
  id: string                      // 文章 ID
  title: string                   // 标题
  excerpt: string                 // 摘要
  content: string                 // 内容
  createdAt: string               // 创建时间
  readTime: number                // 阅读时间（分钟）
  category: string                // 分类名称
  categoryId: number | null       // 分类 ID
  author: string                  // 作者
  slug: string                    // URL slug
  tags?: string[]                 // 标签列表
}
```

### Category - 分类对象

```typescript
interface Category {
  id: number | string             // 分类 ID
  name: string                    // 分类名称
  description?: string            // 描述
  article_count?: number          // 文章数量
}
```

### Tag - 标签对象

```typescript
interface Tag {
  id: number | string             // 标签 ID
  name: string                    // 标签名称
  article_count?: number          // 文章数量
}
```

### PaginatedResponse - 分页响应

```typescript
interface PaginatedResponse<T> {
  count: number                   // 总数
  next: string | null             // 下一页 URL
  previous: string | null         // 上一页 URL
  results: T[]                    // 数据列表
  page?: number                   // 当前页
  pageSize?: number               // 每页数量
}
```

### BlogConfig - 博客配置

```typescript
interface BlogConfig {
  title: string                   // 标题
  description: string             // 描述
  logo: string                    // Logo
}
```

### NavigationItem - 导航项

```typescript
interface NavigationItem {
  label: string                   // 显示文本
  path: string                    // 路径
  active: boolean                 // 是否激活
}
```

### ArticleCardProps - 文章卡片属性

```typescript
interface ArticleCardProps {
  article: Article                // 文章对象
  loading?: boolean               // 加载状态
}
```

---

## 相关文件清单

```
src/types/
└── blog.ts              # 博客类型定义（78 行）
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
