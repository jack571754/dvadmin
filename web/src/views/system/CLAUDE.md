# views/system · 系统管理页面

> 导航：[仓库根](../../../../CLAUDE.md) › [web 前端](../../../CLAUDE.md) › **system 系统管理页面**
>
> 最后更新：2026-10-29

## 页面清单

18 个目录，按"是否 fast-crud 页面"分三类：

| 类型 | 目录 | 说明 |
|------|------|------|
| **CRUD 页**（`index.vue` + `crud.tsx` + `api.ts`） | `areas`、`demo`、`dictionary`（含 `subDict/`）、`downloadCenter`、`fileList`、`messageCenter`、`whiteList`、`log/loginLog`、`log/operationLog`、`role`、`user` | 标准三件套 |
| **自定义页 + 内嵌 CRUD** | `dept`、`menu` | 主表自绘树/表格，弹窗里嵌 `<fs-crud>`：`dept/components/DeptUserCom/crud.tsx`、`menu/components/MenuButtonCom/crud.tsx`、`menu/components/MenuFieldCom/crud.tsx` |
| **非 CRUD** | `home`、`login`、`personal`、`columns`、`config`、`error/`（401、404） | `config` 内部的 `components/components/crudTable.vue` 仍在用 `fs-crud`；`columns` 的菜单列已被注释掉 |

`role` 另有 `addUsers`、`searchUsers` 两个内嵌 CRUD；`dictionary` 有子字典 `subDict/`。
合计 **28 个 `<fs-crud>` 实例**，其中 5 个是没有 `.fs-page` 包裹的内嵌实例
（`DeptUserCom`、`MenuButtonCom`、`MenuFieldCom`、`addUsers`、`searchUsers`）。

## 标准写法（以 `areas` 为模板）

### `api.ts`

```ts
const apiPrefix = '/api/system/area/';
// GetList / GetObj / AddObj / UpdateObj / DelObj / GetPermission
```

见 `areas/api.ts:4-47`。审计列复用 `utils/commonCrud.ts:52` 的 `commonCrudConfig`。

### `crud.tsx`

- 导出 `createCrudOptions`，返回 `{ crudOptions }`（`areas/crud.tsx:20-54`）；
- 四个 request 映射到 api 的 `GetList/AddObj/UpdateObj/DelObj`；
- 按钮权限用 `auth('area:Create')` 之类的权限值（`:55-83`）；
- 字典两种写法：`dict({ data: dictionary('button_status_bool') })`（`:207-209`）
  或 `dict({ url, isTree, value, label, children })`（`utils/commonCrud.ts:64-70`）；
- 树表用 `lazy` 加载（`:84-92`）。

### `index.vue`

```vue
<fs-page><fs-crud ref="crudRef" v-bind="crudBinding" /></fs-page>
useFs({ createCrudOptions })
// 监听 globalI18n 变化 → resetCrudOptions
// onMounted: handleColumnPermission(GetPermission, crudOptions) → doRefresh()
```

见 `areas/index.vue:2-4,17,20-34`。

## 样式约定（重要）

- **CRUD 的公共样式挂在 `.fs-crud-container`**，不是 `.fs-page`。`.fs-page` 只覆盖 28 个实例中的 20 个，
  且被 4 个非 CRUD 页面复用，在它下面写样式会泄漏。
- **页面里尽量不写 `:deep()` 覆盖**。样式统一在 [theme/fastCrud.scss](../../theme/fastCrud.scss) 与
  [theme/element.scss](../../theme/element.scss) 里，选择器要与 Element 的真实形状一致
  （例如 `.el-tag.el-tag--primary`，见 [theme/CLAUDE.md](../../theme/CLAUDE.md)）。
- 弹窗/抽屉会 teleport 到 `<body>`，所以**弹窗内部**的样式不能挂在页面作用域下，要在全局层写。
- 颜色一律 `var(--admin-*)`；不要用 `--el-color-white` 当背景（暗色下仍是纯白）。
- 有 6 个 `crud.tsx` 用内联样式锁死了开关颜色（`areas:197`、`DeptUserCom:379`、`dictionary:177`、
  `role:192`、`user:459`、`whiteList:237`），改主题时这些点不会自动跟随。

## 页面级坑

1. `demo/index.vue:11` 的 `name="loginLog"` 与登录日志页重名 → keep-alive 缓存会串页。
2. `dictionary/crud.tsx:7` 残留 `import React from 'react'`，项目没装 react。
3. `columns/index.vue:6-10` 的菜单列被注释掉，该页目前只展示模型字段。
4. `config/index.vue:526`、`login/index.vue:31` 有 TODO（配置编辑参数、手机号登录未接入）。
5. 登录页密码在前端做 MD5（`login/component/account.vue:150`），仅作传输处理，**不是后端存明文**。
6. `home/index.vue` 是 V2 视觉试点页（工作台），样式类 `.admin-workspace` / `.admin-surface` 定义在
   [theme/modern.scss](../../theme/modern.scss)，页面内是 scoped 样式 + 令牌。
7. 内嵌 CRUD（`DeptUserCom` 等）因为 keep-alive 会保留上一份表格，用自动化探测时容易读错元素，
   人工验证请先关掉已打开的弹窗。

## 验证一个页面改动

```powershell
cd web
pnpm typecheck        # 注意：tsconfig.refactor.json 不含本目录，类型错误不会被它拦住
pnpm lint
```

页面样式是否真的生效，**用 DevTools 看 Computed 面板**，不要靠读代码——CSS 特异性失误不会报错，
只会静默回退到 Element 默认值。
