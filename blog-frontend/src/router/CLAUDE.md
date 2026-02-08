# 路由配置 - 模块文档

[项目根](../../../CLAUDE.md) > [blog-frontend](../../CLAUDE.md) > [src](../) > **router**

---

## 模块职责

配置 Vue Router 路由，处理页面导航、守卫和滚动行为。

---

## 路由配置

### 路由表

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | Home | Home.vue | 首页 |
| `/article/:id` | ArticleDetail | ArticleDetail.vue | 文章详情 |
| `/archive` | Archive | Archive.vue | 归档 |
| `/about` | About | About.vue | 关于 |
| `/login` | Login | Login.vue | 登录 |
| `/register` | Register | Register.vue | 注册 |
| `*` | NotFound | NotFound.vue | 404 |

### 路由元信息

```typescript
meta: {
  title: string  // 页面标题
}
```

---

## 导航守卫

### 全局前置守卫

更新页面标题：

```typescript
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - My Blog` : 'My Blog'
  next()
})
```

---

## 滚动行为

平滑滚动到顶部：

```typescript
scrollBehavior(to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  } else {
    return { top: 0, behavior: 'smooth' }
  }
}
```

---

## 相关文件清单

```
src/router/
└── index.ts             # 路由配置（82 行）
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
