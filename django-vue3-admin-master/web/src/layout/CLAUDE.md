[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/layout**

---

# Layout 布局组件

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 叀更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 layout 文档 | Claude AI |

---

## 模块职责

提供应用整体布局组件，包括侧边栏、头部、标签页、面包屑等导航组件。

---

## 目录结构

```
layout/
├── index.vue              # 布局主入口
├── component/             # 布局子组件
│   ├── logo.vue          # Logo 组件
│   ├── navBars/          # 导航栏组件
│   └── navMenu/          # 菜单组件
└── main/                  # 布局模式
    ├── index.vue         # 经典布局
    ├── defaults.vue      # 默认布局
    ├── columns.vue       # 双栏布局
    └── classic.vue       # 经典布局
```

---

## 布局模式

### 1. 经典布局 (classic)

**特点：**
- 左侧固定菜单
- 顶部固定头部
- 内容区域自适应

### 2. 双栏布局 (columns)

**特点：**
- 左侧双栏菜单
- 支持菜单悬停展开
- 适合多级菜单

### 3. 默认布局 (defaults)

**特点：**
- 简洁布局
- 基础导航功能

---

## 核心组件

### logo.vue

**功能：** 显示 Logo 和系统名称

**位置：** 左上角

### navBars/ 导航栏组件

| 组件 | 说明 |
|------|------|
| `breadcrumb.vue` | 面包屑导航 |
| `tagsView.vue` | 标签页 |
| `topBar.vue` | 顶部栏 |
| `search.vue` | 搜索组件 |

**功能：**
- 面包屑：显示当前路径
- 标签页：显示已打开页面
- 顶部栏：用户信息、全屏等

### navMenu/ 菜单组件

| 组件 | 说明 |
|------|------|
| `vertical.vue` | 垂直菜单 |
| `horizontal.vue` | 水平菜单 |

**功能：**
- 动态加载菜单
- 支持多级嵌套
- 支持图标显示
- 支持外链跳转

---

## 布局切换

### 主题配置

通过 `stores/themeConfig.ts` 配置：

```typescript
{
  layout: 'defaults',  // 布局模式
  isClassic: false,    // 是否经典布局
  isColumns: false,    // 是否双栏布局
}
```

### 切换方式

```vue
<el-select v-model="layoutMode" @change="changeLayout">
  <el-option label="默认" value="defaults"></el-option>
  <el-option label="经典" value="classic"></el-option>
  <el-option label="双栏" value="columns"></el-option>
</el-select>
```

---

## 响应式设计

### 断点配置

| 断点 | 屏幕宽度 | 行为 |
|------|----------|------|
| xs | <768px | 隐藏侧边栏 |
| sm | ≥768px | 显示侧边栏 |
| md | ≥992px | 完整布局 |
| lg | ≥1200px | 完整布局 |
| xl | ≥1920px | 完整布局 |

### 移动端适配

- 自动收起侧边栏
- 汉堡菜单按钮
- 滑动抽屉菜单

---

## 布局配置

### 固定头部

```typescript
{
  isFixedHeader: true,  // 固定头部
}
```

### 显示标签页

```typescript
{
  isShowsTag: true,  // 显示标签页
}
```

### 显示面包屑

```typescript
{
  isBreadcrumb: true,  // 显示面包屑
}
```

---

## 常见问题 (FAQ)

### 1. 如何修改布局模式？

在主题设置中选择布局模式，或直接修改配置：

```typescript
const themeConfigStore = useThemeConfig();
themeConfigStore.setThemeConfig({
  layout: 'classic'
});
```

### 2. 如何隐藏侧边栏？

```typescript
{
  isCollapse: true,  // 折叠侧边栏
}
```

### 3. 如何自定义布局？

1. 在 `layout/main/` 下创建新的布局文件
2. 实现布局组件
3. 在路由配置中使用

```typescript
{
  path: '/',
  component: () => import('@/layout/main/myLayout.vue'),
}
```

### 4. 如何修改 Logo？

替换 `assets/logo.png` 或修改 `logo.vue` 组件。

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `index.vue` | 布局主入口 |
| `component/logo.vue` | Logo 组件 |
| `component/navBars/` | 导航栏组件 |
| `component/navMenu/` | 菜单组件 |
| `main/index.vue` | 经典布局 |
| `main/defaults.vue` | 默认布局 |
| `main/columns.vue` | 双栏布局 |
| `main/classic.vue` | 经典布局 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [layout] (./)
```
