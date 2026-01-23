[根目录](../CLAUDE.md) > **web**

---

# Web 前端模块

> 最后更新：2026-01-23 14:19:21

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-23 14:19:21 | 初始化模块文档 | Claude AI |

---

## 模块职责

Vue3 + TypeScript 前端应用，提供用户界面、权限控制、状态管理等功能。

---

## 入口与启动

### 主要入口文件

| 文件 | 说明 |
|------|------|
| `src/main.ts` | 应用入口 |
| `src/App.vue` | 根组件 |
| `index.html` | HTML 模板 |
| `vite.config.ts` | Vite 构建配置 |

### 启动方式

```bash
# 开发环境
yarn run dev
# 访问 http://localhost:8080

# 生产构建
yarn run build

# 本地生产构建
yarn run build:local

# 开发构建
yarn run build:dev
```

---

## 对外接口

### API 层结构

| 目录 | 说明 |
|------|------|
| `src/api/login/` | 登录相关 API |
| `src/api/menu/` | 菜单相关 API |
| `src/views/*/api.ts` | 各模块业务 API |

### 请求配置

- 基础配置：`src/utils/request.ts`
- 服务配置：`src/utils/service.ts`
- 基础 URL：`src/utils/baseUrl.ts`

---

## 关键依赖与配置

### 核心依赖（package.json）

**框架与库：**
- Vue 3.4.38
- Vue Router 4.4.3
- Pinia 2.0.28
- Element Plus 2.8.0
- TypeScript 4.9.4
- Vite 5.4.1

**UI 组件与工具：**
- @fast-crud/fast-crud 1.21.2（快速 CRUD）
- echarts 5.5.1（图表）
- vxe-table 4.6.18（表格）
- @wangeditor/editor 5.1.23（富文本编辑器）

### 配置文件

| 配置文件 | 说明 |
|---------|------|
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.eslintrc.js` | ESLint 代码检查 |
| `.prettierrc.js` | Prettier 格式化 |
| `postcss.config.js` | PostCSS 配置 |
| `.env.*` | 环境变量 |
| `flowH5.config.ts` | 移动端 H5 配置 |

### 环境变量

| 文件 | 说明 |
|------|------|
| `.env` | 通用环境变量 |
| `.env.development` | 开发环境 |
| `.env.production` | 生产环境 |
| `.env.local_prod` | 本地生产环境 |

---

## 目录结构

```
web/
├── src/
│   ├── api/              # API 接口定义
│   ├── assets/           # 静态资源
│   │   ├── iconfont/     # 图标字体
│   │   ├── img/          # 图片
│   │   ├── login-bg.svg  # 登录背景
│   │   └── style/        # 全局样式
│   ├── components/       # 通用组件
│   ├── directive/        # 自定义指令
│   ├── i18n/             # 国际化
│   ├── layout/           # 布局组件
│   ├── plugin/           # 插件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 公共静态文件
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

---

## 状态管理 (Pinia Stores)

| Store 文件 | 说明 |
|-----------|------|
| `userInfo.ts` | 用户信息 |
| `routesList.ts` | 路由列表 |
| `themeConfig.ts` | 主题配置 |
| `btnPermission.ts` | 按钮权限 |
| `columnPermission.ts` | 列权限 |
| `dictionary.ts` | 字典数据 |
| `frontendMenu.ts` | 前端菜单 |
| `messageCenter.ts` | 消息中心 |
| `systemConfig.ts` | 系统配置 |
| `keepAliveNames.ts` | 页面缓存 |
| `tagsViewRoutes.ts` | 标签页 |

---

## 路由配置

| 路由文件 | 说明 |
|---------|------|
| `router/index.ts` | 路由主入口 |
| `router/backEnd.ts` | 后端路由（动态加载） |
| `router/frontEnd.ts` | 前端路由 |
| `router/route.ts` | 路由配置 |

---

## 布局系统

| 布局文件 | 说明 |
|---------|------|
| `layout/index.vue` | 布局主组件 |
| `layout/component/` | 侧边栏、头部等 |
| `layout/main/` | 不同布局模式（经典、双栏、横向等） |
| `layout/navBars/` | 导航栏（面包屑、标签页等） |

---

## 通用组件

| 组件目录 | 说明 |
|---------|------|
| `components/auth/` | 权限控制组件 |
| `components/editor/` | 富文本编辑器 |
| `components/fileSelector/` | 文件选择器 |
| `components/iconSelector/` | 图标选择器 |
| `components/importExcel/` | Excel 导入 |
| `components/table/` | 表格组件 |

---

## 页面视图

### 系统模块视图 (views/system/)

| 页面 | 说明 |
|------|------|
| `login/` | 登录页 |
| `home/` | 首页 |
| `user/` | 用户管理 |
| `role/` | 角色管理 |
| `dept/` | 部门管理 |
| `menu/` | 菜单管理 |
| `dictionary/` | 字典管理 |
| `areas/` | 地区管理 |
| `fileList/` | 文件管理 |
| `config/` | 系统配置 |
| `columns/` | 列权限管理 |
| `messageCenter/` | 消息中心 |
| `personal/` | 个人中心 |
| `log/` | 日志管理 |

### 插件视图 (views/plugins/)

- 动态加载的插件页面

---

## 国际化 (i18n)

支持语言：
- 简体中文 (zh-cn)
- 繁体中文 (zh-tw)
- English (en)

---

## 常见问题 (FAQ)

### 1. 代理配置

开发环境代理配置在 `vite.config.ts` 中：

```typescript
proxy: {
    '/gitee': {
        target: 'https://gitee.com',
        ws: true,
        changeOrigin: true,
    },
}
```

### 2. 环境变量

在 `.env.*` 文件中配置：

```bash
VITE_PORT=8080
VITE_PUBLIC_PATH=/
```

### 3. 图标使用

使用 `e-icon-picker` 组件，支持：
- Element Plus 图标
- Font Awesome 4.7
- 自定义 iconfont

### 4. 权限控制

- 组件：`<auth value="system:user:add">`
- 指令：`v-auth="system:user:edit"`
- 函数：`hasPermi('system:user:delete')`

---

## 相关文件清单

### 重要配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖和脚本 |
| `vite.config.ts` | Vite 构建配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.eslintrc.js` | ESLint 配置 |
| `.prettierrc.js` | Prettier 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `flowH5.config.ts` | 移动端配置 |

### 核心源文件

| 文件 | 说明 |
|------|------|
| `src/main.ts` | 应用入口 |
| `src/App.vue` | 根组件 |
| `src/settings.ts` | fast-crud 配置 |
| `src/utils/request.ts` | Axios 请求封装 |
