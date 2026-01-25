[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/router**

---

# Router 路由配置

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 router 文档 | Claude AI |

---

## 模块职责

配置 Vue Router 路由，支持前端路由、后端动态路由、路由守卫等功能。

---

## 目录结构

```
router/
├── index.ts         # 路由主入口
├── backEnd.ts       # 后端路由（动态加载）
├── frontEnd.ts      # 前端路由
└── route.ts         # 路由配置
```

---

## 路由文件

### index.ts - 路由主入口

**功能：**
- 创建 Router 实例
- 配置路由模式（history 模式）
- 注册路由守卫

**配置：**
```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});
```

### backEnd.ts - 后端路由

**功能：**
- 从后端 API 获取菜单数据
- 动态生成路由
- 处理路由权限

**流程：**
1. 登录后获取用户菜单权限
2. 调用 `/api/system/menu/router/` 获取路由数据
3. 解析路由配置
4. 动态添加到 Router

### frontEnd.ts - 前端路由

**功能：**
- 定义前端静态路由
- 登录页、首页等公共路由

**示例路由：**
```typescript
{
  path: '/login',
  name: 'login',
  component: () => import('@/views/login/index.vue'),
  meta: {
    title: '登录',
  }
}
```

### route.ts - 路由配置

**功能：**
- 导出前端路由
- 导出后端路由
- 路由元信息定义

---

## 路由守卫

### 前置守卫 (beforeEach)

**位置：** `index.ts`

**功能：**
- 检查登录状态
- 处理路由权限
- 页面标题设置
- 进度条显示

**流程：**
```typescript
router.beforeEach((to, from, next) => {
  // 1. 检查是否需要登录
  if (to.meta.isAuth) {
    // 2. 检查 Token
    if (token) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});
```

### 后置钩子 (afterEach)

**功能：**
- 关闭进度条
- 设置页面标题

---

## 路由元信息

### meta 字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 页面标题 | `'用户管理'` |
| `isAuth` | 是否需要登录 | `true` |
| `isAffix` | 是否固定标签页 | `true` |
| `isKeepAlive` | 是否缓存页面 | `true` |
| `icon` | 菜单图标 | `'el-icon-user'` |
| `isHide` | 是否隐藏菜单 | `true` |

---

## 动态路由

### 路由格式

后端返回的路由格式：

```typescript
{
  path: '/system',
  name: 'system',
  component: 'layout/index.vue',
  redirect: '/system/user',
  meta: {
    title: '系统管理',
    icon: 'el-icon-setting',
  },
  children: [
    {
      path: '/system/user',
      name: 'systemUser',
      component: 'views/system/user/index.vue',
      meta: {
        title: '用户管理',
      }
    }
  ]
}
```

### 路由解析

```typescript
// 动态导入组件
const modules = import.meta.glob('../views/**/*.vue');

function loadComponent(component: string) {
  const key = `../${component}`;
  return modules[key];
}
```

---

## 常见问题 (FAQ)

### 1. 如何添加新的路由？

**前端路由：** 在 `frontEnd.ts` 中添加

```typescript
{
  path: '/new-page',
  name: 'newPage',
  component: () => import('@/views/new-page/index.vue'),
  meta: {
    title: '新页面',
  }
}
```

**后端路由：** 在系统管理 -> 菜单管理中添加

### 2. 如何实现路由懒加载？

```typescript
component: () => import('@/views/system/user/index.vue')
```

### 3. 如何配置嵌套路由？

```typescript
{
  path: '/system',
  component: Layout,
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index.vue'),
    }
  ]
}
```

### 4. 如何处理路由传参？

```typescript
// 路由配置
{
  path: '/user/:id',
  component: UserDetail,
}

// 跳转
router.push('/user/123');

// 获取参数
const route = useRoute();
const userId = route.params.id;
```

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `index.ts` | 路由主入口 |
| `backEnd.ts` | 后端动态路由 |
| `frontEnd.ts` | 前端静态路由 |
| `route.ts` | 路由配置导出 |

### 相关文件

| 文件 | 说明 |
|------|------|
| `../stores/routesList.ts` | 路由状态管理 |
| `../utils/request.ts` | API 请求 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [router] (./)
```
