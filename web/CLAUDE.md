# web · Vue 3 管理后台

> 导航：[仓库根](../CLAUDE.md) › **web 前端**
>
> 最后更新：2026-10-25 ｜ Node 24.22.1 ／ pnpm 11.25.0

## 运行与构建

```powershell
cd web
pnpm install --frozen-lockfile     # preinstall 会跑 only-allow pnpm，不能用 npm/yarn
pnpm dev                           # vite --force，端口取 .env.development 的 VITE_PORT（本机 8200）
pnpm build                         # 生产构建
```

| 约束 | 值 | 来源 |
|------|----|------|
| Node | `>=24 <25`，`.node-version` = 24.22.1 | `package.json:117-120` |
| 包管理器 | pnpm 11.25.0 | `package.json:134` |
| API 地址 | `VITE_API_URL`，开发为 `http://127.0.0.1:9000` | `.env.development:4`、`src/utils/baseUrl.ts:7` |
| 生产 API | `/api` | `.env.production:3` |

开发态**没有 `/api` 代理**（`vite.config.ts:44-51` 只代理 `/gitee`），前端直连 `VITE_API_URL`，
所以后端必须允许该 Origin 跨域。

## 入口与加载顺序（决定样式谁能覆盖谁）

`src/main.ts` 是唯一的启动链，顺序不能随意调整：

| # | 内容 | 行 |
|---|------|----|
| 1 | `assets/style/tailwind.css` | :7 |
| 2 | `element-plus/dist/index.css` | :9 |
| 3 | `element-plus/theme-chalk/dark/css-vars.css`（官方暗色层，必须在 #2 之后） | :11 |
| 4 | `theme/index.scss` | :12 |
| 5 | `settings.ts` → fast-crud `style.css` + `theme/fastCrud.scss` + fast-extends `style.css` | :16（内部 :6/:8/:17） |
| 6 | `assets/style/reset.scss`（**晚于主题，会反向覆盖**） | :33 |

后续：`:43` 自动扫描注册插件 → `:45` eIconPicker → `:51` pinia 持久化 → `:55-60` pinia/router/ElementPlus/i18n/fastCrud。

`App.vue` 负责启动期偏好迁移与主题恢复，渲染子组件前从配置调用 `applyTheme()` 生成完整色板；不再恢复旧 `themeConfigStyle`。四套方案及验证说明见 [modern-theme-settings.md](../docs/modern-theme-settings.md)。
**首帧暗色**由 `index.html` 内联脚本设置，新安装默认深灰，已有偏好由迁移器保留。

## 路由：后端菜单驱动

`src/router/`：

| 文件 | 职责 |
|------|------|
| `index.ts` | hash 路由；全局前置守卫（`:141-196`）：版本检查 → 免登录白名单 → 无 token 跳登录 → `pwd_change_count` 分流 → 首次初始化 |
| `route.ts` | 静态路由：`/` 重定向 `/home`、`/personal`、`/login`、`/demo`、404 |
| `backEnd.ts` | 菜单 → 组件映射，`init()` `:48-69`；三个 glob `:29-31` |
| `frontEnd.ts` | 纯前端路由模式（本项目不用） |
| `bootstrap.ts` | 按 token + `sessionRevision` 去重初始化 |

**关键机制**：`backEnd.ts:29-31` 用 `import.meta.glob` 收集可渲染组件：

```
../layout/routerView/*      → 目录/父级容器
../views/**/*               → 业务页面
@great-dream/**/*           → 别名指向 node_modules/@great-dream/（目前只有 dvadmin3-celery-web）
```

菜单表里的 `component` 字段（如 `system/home/index`）在 `backEndComponent`(`:219-252`) 里
按路径前缀匹配到 glob key；**匹配到多个会返回 `false`**（`dynamicImport` `:260-276`），
所以**不要创建同名的页面文件**。目录型菜单映射到 `layout/routerView/parent`。

**已知限制**：带参数的动态路由由 `backEnd.ts` 的 `oneFlat` / `twoLevel` 转换处理（`:78-120`）。
不要在前端硬编码菜单 —— 菜单与按钮权限都来自后端 `menu` 表。

## fast-crud 配置（28 个 CRUD 页的公共层）

`src/settings.ts` 默认导出的就是 fast-crud 插件，`commonOptions`（`:39-109`）是全局约定：

| 项 | 行 | 内容 |
|----|----|------|
| 请求适配 | :45-56 | `transformQuery`（page/limit/ordering）、`transformRes`（data/page/limit/total） |
| 表单提交 | :58-68 | 只在 `code == 2000` 时提示成功 |
| 表格 | :71-75 | 去斑马纹、去边框（V2 决策） |
| 分页 | :78-82 | layout 不含 jumper |
| 搜索区 | :86-95 | 布局参数**必须写在 `container` 下**，写在 `search` 下无效 |
| 列设置 | :96-107 | `toolbar.columns.show = false`：fast-crud 内置列设置依赖的 `fs-table-columns-filter` 在已安装版本里不存在 |

扩展：`editor`（:113-117）、`uploader`（:119-156）、字典组件染色（:160-164）、placeholder（:166-186）。

页面级写法见 [views/system/CLAUDE.md](./src/views/system/CLAUDE.md)。

## 请求栈

```
views/*/api.ts  →  utils/service.ts  →  utils/http.ts  →  shared/api/client.ts  →  axios
```

| 层 | 文件 | 要点 |
|----|------|------|
| 服务封装 | `src/utils/service.ts:8-21` | timeout 20s；剔除空串参数；boolean→`True`/`False`；`downloadFile` 识别 blob 与 JSON 任务 |
| 运行时注入 | `src/utils/http.ts:17-35` | 注入 token/revision/baseURL/语言；**401 直接清会话**（`:26`），没有 refresh token 流程 |
| HTTP 运行时 | `src/shared/api/client.ts:100-101` | `Authorization: JWT <token>`（仅同源 API）+ `Accept-Language`；业务成功码 `2000` |
| 错误归一 | `src/shared/api/errors.ts` | 8 类错误，`isCancellation()` 识别会话换代 |

**成功码有两个**：新版 `2000`（`shared/api/client.ts:82`），旧版 `0`（`utils/request.ts:5-12`，
只被死代码 `src/api/login/index.ts` 引用）。新接口一律按 2000 判断。

## i18n

`src/i18n/index.ts:20` 用 `import.meta.glob('./**/*.ts')` **自动收集**所有语言文件，
按文件名最后一节（`en` / `zh-cn` / `zh-tw`）分桶后 `deepMerge`（:25-58）。

- 全局文案：`src/i18n/lang/{en,zh-cn,zh-tw}.ts`
- 页面文案：`src/i18n/pages/<page>/{en,zh-cn,zh-tw}.ts`
- fast-crud 缺失的 zh-tw 由 `src/i18n/fs/zh-tw.ts` 补

新增页面只要按上面的路径建三个文件，无需改任何注册代码。规范见 [docs/i18n-guide.md](../docs/i18n-guide.md)。

## 组件与指令

- `src/components/`：`auth/`（`<auth>`/`<auths>`/`<authAll>` 插槽权限组件）、`editor/`（wangEditor）、
  `importExcel/`、`iconSelector/`、`tableSelector/`、`manyToMany/`、`cropper/` 等。
- `src/directive/`：`v-auth` / `v-auths` / `v-auth-all`（权限）、`v-waves`、`v-drag`、`v-resizeOb`。
- `src/plugin/permission/`：注册 `v-permission` 与 `$hasPermissions`。
- `src/views/plugins/index.ts`：启动时扫描插件目录自动注册组件。

## 测试与脚本

| 命令 | 内容 |
|------|------|
| `pnpm test:unit` | `scripts/tests/*.test.mjs`，13 个文件，覆盖 shared/api、shared/access、features/users、features/roles |
| `pnpm test:e2e` | Playwright smoke（10 个 spec） |
| `pnpm test:i18n` | Playwright i18n（17 个 spec） |
| `pnpm test:parity` | Playwright parity（23 条路由） |
| `pnpm baseline` | 采集构建基线 |
| `pnpm lint` / `lint:all` / `lint:fix` | `check-lint.mjs` 与基线比较 / 全量 ESLint |
| `pnpm typecheck` | `vue-tsc -p tsconfig.refactor.json`（**只覆盖 shared/features/user/role**） |
| `pnpm typecheck:legacy` | `tsconfig.json`，当前 275 个历史错误，作为基线 |

Windows 下 `cmd.exe` 不展开通配符，`pnpm test:unit` 会失败，用 PowerShell 显式展开：

```powershell
node --test (Get-ChildItem scripts/tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName })
```

E2E 用独立环境：Web `8210` / API `9010`，`test-environment.mjs` 会拒绝 `8200`/`9000`，
后端库是 `backend/.e2e/db.sqlite3`。**不要指向开发库。**

## 已知坑

1. `main.ts:18` 导入了 `RegisterPermission` 但从未调用 → `v-permission` 与 `$hasPermissions` 实际不存在，
   能用的是 `v-auth` 系列。
2. `vite.config.ts:26` 的 `@dvaformflow` 别名指向 `./src/viwes/...`（拼写错误），目录不存在且无人引用。
3. `vite.config.ts:5,32` 的 `vueJsx` 插件被注释 → **现有 `.tsx` 都是纯 TS，一旦写 JSX 就会编译失败**。
4. `settings.ts:122` 上传 action 硬编码 `/api/system/file/`；生产 baseURL 也是 `/api`，有拼成 `/api/api/...` 的风险。
5. `views/system/demo/index.vue:11` 的 `name="loginLog"` 与登录日志页重名，keep-alive 会串缓存。
6. `views/system/dictionary/crud.tsx:7` 有 `import React from 'react'`，但项目没装 react（删掉即可，属残留）。
7. 死代码：`src/api/login/index.ts`、`src/utils/request.ts`、`App.vue` 的 `Upgrade`/`getVersion`。
8. `tests/smoke/prototype.spec.ts` 测的是 `docs/prototypes/dvadmin.html` 静态原型，**不覆盖真实应用**；
   `tests/baseline/performance.spec.ts` 默认 skip。
