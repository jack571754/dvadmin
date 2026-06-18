[根目录](../CLAUDE.md) > **web**

# Web 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 product_spec 模块化拆解（index.vue 3529 行 + types.ts + constants.ts + utils.ts + 2 子组件）、Univer 3 模板+3 主题说明、@ 提及选择器与赠品配置弹窗、字段级权限同步遮罩机制、自动保存与重试逻辑、新增 design_order 页面清单 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

Vue3 管理后台前端应用，提供系统管理、设计工单、工作流审批、作品集管理等全部前端页面。基于 Element Plus + fast-crud 构建，支持后端动态路由、国际化、主题切换。设计工单模块集成了 Univer 电子表格，用于可视化编辑美妆活动提报的产品规格矩阵。

---

## 入口与启动

- **入口文件**：`src/main.ts` -- 创建 Vue 应用，注册所有插件和全局组件
- **路由**：`src/router/index.ts` -- Hash 模式路由，后端控制动态路由
- **构建工具**：Vite (`vite.config.ts`)
- **包管理器**：pnpm（`preinstall` 脚本强制 `npx only-allow pnpm`）
- **启动命令**：`pnpm run dev`（开发）/ `pnpm run build`（生产）

---

## 对外接口

前端通过 `src/utils/service.ts`（Axios 封装）与后端 API 通信。

### API 接口定义

| 文件 | 说明 |
|------|------|
| `src/api/login/index.ts` | 登录/登出/验证码 |
| `src/api/menu/index.ts` | 菜单数据获取 |
| `src/api/design_order/product_archive.ts` | 产品档案 API（CRUD + GetPermission + BatchDelete） |
| `src/api/design_order/product_spec.ts` | 产品规格 API（GetPermission，spec 前缀） |
| `src/api/design_order/product_spec_submission.ts` | 规格提报 API（CRUD + GetPermission + CopyObj） |

### API 工具函数示例

```typescript
// src/api/design_order/product_archive.ts
export function GetPermission() {
    return request({
        url: apiPrefix + 'field_permission/',
        method: 'get',
    });
}

export function BatchDelete(keys: any[]) {
    return request({
        url: apiPrefix + 'multiple_delete/',
        method: 'delete',
        data: { keys },
    });
}
```

---

## 关键依赖与配置

### 核心依赖

| 依赖 | 用途 |
|------|------|
| vue 3.4.38 | UI 框架 |
| element-plus 2.8.0 | 组件库 |
| @fast-crud/fast-crud 1.28.1 | CRUD 快速开发 |
| pinia 2.0.28 | 状态管理 |
| vue-router 4.4.3 | 路由 |
| axios | HTTP 请求 |
| vue-i18n 9.14.0 | 国际化 |
| echarts 5.5.1 | 图表 |
| tailwindcss 3.2.7 | 原子化样式 |
| vxe-table 4.6.18 | 高级表格 |
| @univerjs/presets + @univerjs/preset-sheets-core | Univer 电子表格 |
| @univerjs/preset-sheets-data-validation | Univer 数据验证 |

### 路由机制

- **后端控制路由**（默认）：`isRequestRoutes = true`，菜单数据从后端获取
- **动态导入**：`backEnd.ts` 中的 `dynamicImport()` 根据 component 路径匹配 Vue 文件
- **路径兼容**：`dvadmin3_flow/` 前缀会自动转换为 `dvadmin3-flow-web/src/` 格式
- **白名单路由**：`/login`, `/portfolio`（免登录）

### 插件系统

`src/views/plugins/index.ts` -- `scanAndInstallPlugins()` 自动扫描插件目录，注册异步组件和 Vue 插件。

---

## 数据模型

前端无独立数据模型，通过 Pinia Stores 管理状态：

| Store | 文件 | 说明 |
|-------|------|------|
| userInfo | `stores/userInfo.ts` | 用户信息与权限 |
| themeConfig | `stores/themeConfig.ts` | 主题配置 |
| routesList | `stores/routesList.ts` | 路由列表 |
| tagsViewRoutes | `stores/tagsViewRoutes.ts` | 标签页路由 |
| keepAliveNames | `stores/keepAliveNames.ts` | 缓存组件名 |
| dictionary | `stores/dictionary.ts` | 字典数据 |
| btnPermission | `stores/btnPermission.ts` | 按钮权限 |
| columnPermission | `stores/columnPermission.ts` | 列权限 |
| frontendMenu | `stores/frontendMenu.ts` | 前端菜单 |
| messageCenter | `stores/messageCenter.ts` | 消息中心 |
| systemConfig | `stores/systemConfig.ts` | 系统配置 |
| requestOldRoutes | `stores/requestOldRoutes.ts` | 原始路由数据 |
| dept | `stores/modules/dept.ts` | 部门信息 |

---

## 页面结构

### 系统页面 (`views/system/`)

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | `login/` | 登录页 |
| 首页 | `home/` | 仪表盘 |
| 用户管理 | `user/` | 用户 CRUD |
| 角色管理 | `role/` | 角色 CRUD |
| 菜单管理 | `menu/` | 菜单树形管理 |
| 部门管理 | `dept/` | 部门树形管理 |
| 字典管理 | `dictionary/` | 字典 CRUD |
| 日志 | `log/loginLog/`, `log/operationLog/` | 日志查看 |
| 文件管理 | `fileList/` | 文件上传管理 |
| 消息中心 | `messageCenter/` | 站内消息 |
| 系统配置 | `config/` | 系统参数配置 |
| 地区管理 | `areas/` | 地区数据 |
| 白名单 | `whiteList/` | API 白名单 |
| 下载中心 | `downloadCenter/` | 下载任务 |
| 列权限 | `columns/` | 字段权限配置 |
| 个人中心 | `personal/` | 个人信息 |
| 示例 | `demo/` | CRUD 示例 |

### 设计工单页面 (`views/design_order/`)

| 页面 | 路径 | 说明 |
|------|------|------|
| 产品档案管理 | `product_archive/index.vue` + `crud.tsx` | fast-crud 标准页面，含字段级权限遮罩 |
| 产品规格提报 | `product_spec/index.vue`（3529 行）+ 5 个辅助文件 | **Univer 电子表格** + 自定义表单弹窗 |
| 规格提报历史 | `product_spec_submission/index.vue` + `crud.tsx` | fast-crud 标准页面，含一键复用 |

### product_spec 模块详细拆解

| 文件 | 行数 | 说明 |
|------|------|------|
| `index.vue` | 3529 | 主组件：Univer 表格初始化、控制面板、表单弹窗、@ 提及、校验结果弹窗 |
| `types.ts` | 56 | 接口定义（GiftInfo / ProductInfo / DBProductItem / SelectableProduct / ValidationError / ValidationResult）；`ProductInfo` 含可选 `specData` |
| `constants.ts` | 89 | `TEMPLATE_LABELS`（已弃用，标签改由 Schema 派生）+ `BORDER_DICT` + `buildStylesDict()`（3 主题样式字典） |
| `utils.ts` | 120 | `escapeRegExp` / `getCleanNickname` / `getProductCoords`（接收 `rowsPerBlock`/`columnsPerBlock` 参数）/ `getCursorOffsetInContainer` / `setCaretPosition` |
| `schema/types.ts` | - | `FieldDef`/`TemplateSchema`/`FieldStyle`/`FieldKind` 类型定义 |
| `schema/templates.ts` | - | 三模板 Schema 定义（main_image / live_stream / detail_page）的单一事实源，与后端 `templates_schemas.py` 对等 |
| `schema/index.ts` | - | `getSchema`/`getRowsPerBlock`/`getColumnsPerBlock`/`getFields`/`getFieldByRow`/`getLabelByRow`/`styleToUniverStyleName` 查询函数 |
| `components/ProductSelectDialog.vue` | 280 | @ 提及选择器弹窗，支持键盘 ↑↓/Enter/Esc |
| `components/GiftConfigModal.vue` | ~150 | 标配赠品配置弹窗（旧版双击配置入口，新表单弹窗已替代） |

> **模板引擎化（2026-06-18）**：`index.vue` 中全部行/列魔法数字（`15`/`6`/`+N`）已消除，Univer 渲染/读写/收集/遮罩/脚注重算全部由 `schema/` 驱动。新增提报模板只需在 `schema/templates.ts` 加一份 Schema 并注册，零业务代码改动。表单弹窗（`syncUniverToForm`/`syncFormToUniver`）当前按 main_image 语义命名，主要服务 main_image。

#### Univer 配置要点

```typescript
// 3 种模板：main_image / live_stream / detail_page
// 每种模板对应 14 行标签（Row 0 = "配置字段"，Row 1-13 为字段标签）
// 3 种主题：proya / collgene / luxury（每种主题 8 种样式：header/label/contentCenter/contentCenter_shaded/contentLeft/contentLeft_shaded/editableCenter/editableDate）
// 工作簿结构：每 6 列为 1 个 block，每 block 15 行（block 起始行 = blockIdx * 15）
// 列坐标：blockCol = (idx % 6) + 1
```

#### 字段级权限同步遮罩

```typescript
// 前端在渲染前调用 filterSnapshotData() 对受限字段执行遮罩
// 与后端 LoadProductSpecView 的遮罩逻辑形成双重保护
const ROW_TO_FIELD_MAP: Record<number, string> = {
  1: 'brand', 2: 'nickname', 3: 'full_name', 4: 'specification',
  5: 'efficacy', 6: 'gifts', 7: 'threshold_a', 8: 'member_gift',
  9: 'member_value', 10: 'selling_point', 11: 'price',
  12: 'start_date', 13: 'remarks'
};
```

#### 自动保存机制

```typescript
const AUTO_SAVE_INTERVAL = 30_000;  // 30 秒
const MAX_RETRY = 3;
// isDirty 标记 + autoSaveTimer 定时器 + retryCount 重试
// 保存调用 POST /api/design_order/product_archives/save_spec/ 并标记 status='draft'
```

#### 校验与提交

```typescript
// 提交前调用后端 validate_submission（通过 status='submitted' 触发）
// 后端返回 errors + warnings 列表，前端弹出 validationDialogVisible 展示
// errors 必须修正，warnings 可选「仍然提交」
```

#### 脚注与编号生成

`recalculateSuffixesAndFootnotes()` 函数：
1. 扫描所有列的 nickname 行，按 fullName 首次出现顺序分配全局递增编号
2. 扫描赠品/满赠/会员礼行，识别其中提及的其他产品并分配编号
3. 为每个产品昵称写入 `[编号]规格` 后缀
4. 为赠品/满赠/会员礼文本中的产品名插入 `[编号]` 后缀（使用占位符避免短名匹配长名）
5. 为每列生成备注脚注：`[编号]昵称为产品昵称，产品备案全称为全称`

### 插件页面 (`views/plugins/`)

| 页面 | 说明 |
|------|------|
| `dvadmin3-flow-web/` | 工作流审批前端（流程设计器、审批列表、H5 表单） |
| `dvadmin_portfolio/` | 作品集管理（配置/履历/项目） |

### 公开页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 作品集展示 | `portfolio/` | 免登录公开页，3D 名片效果 |

---

## 测试与质量

- Playwright 已配置于 devDependencies，但无实质测试用例
- **缺口**（优先级低）：
  - 核心组件（权限控制、路由加载、字段遮罩）缺少测试
  - product_spec 的 `recalculateSuffixesAndFootnotes` 脚注生成逻辑复杂，建议补充单元测试
  - `getCleanNickname`、`setCaretPosition` 工具函数建议补充测试

---

## 常见问题 (FAQ)

**Q: 为什么必须使用 pnpm？**
A: `package.json` 中 `preinstall` 脚本强制检查 `npx only-allow pnpm`。

**Q: 如何新增 CRUD 页面？**
A: 在 `views/` 下创建目录，编写 `crud.tsx`（fast-crud 配置）和 `index.vue`（页面组件），然后在后端菜单管理中注册路由。`onMounted` 中调用 `handleColumnPermission(GetPermission, crudOptions)` 应用字段权限。

**Q: Univer 电子表格组件在哪里？**
A: 产品规格提报页面 (`views/design_order/product_spec/`) 集成了 Univer 电子表格，用于可视化编辑产品规格矩阵。主组件 3529 行已拆分为模块化结构。

**Q: 字段遮罩在前端如何处理？**
A: 前端 `product_spec/index.vue` 中的 `filterSnapshotData()` 与 `getPermittedVal()` 在加载快照后根据 `permissionData` 对受限字段值替换为 `***`，与后端 `LoadProductSpecView` 形成双重保护。保存时若某字段值为 `***`，后端会从既有记录中恢复原值。

**Q: Univer 工作簿支持多少列？**
A: 默认配置 6 列（1 标签列 + 5 商品列），超过 5 个商品时会自动追加新 block（每 block 15 行）。`formCount` 跟踪当前商品总数，删除列时通过 `CommandExecuted` 事件监听 `remove-col`/`delete-col` 命令同步。

---

## 相关文件清单

```
web/
  package.json           # 依赖与脚本
  vite.config.ts         # Vite 配置
  index.html             # 入口 HTML
  tailwind.config.js     # Tailwind 配置
  src/
    main.ts              # 应用入口
    App.vue              # 根组件
    settings.ts          # fast-crud 全局配置
    api/                 # API 接口定义 (5 个文件)
      login/index.ts
      menu/index.ts
      design_order/product_archive.ts
      design_order/product_spec.ts
      design_order/product_spec_submission.ts
    components/          # 通用组件 (~20 个)
    layout/              # 布局组件 (~20 个)
    views/               # 页面视图 (~60+ 个)
      system/            # 系统页面
      design_order/      # 设计工单页面
        product_archive/
          index.vue
          crud.tsx
        product_spec/    # Univer 规格书编辑器
          index.vue      # 3529 行主组件
          types.ts
          constants.ts
          utils.ts
          components/
            ProductSelectDialog.vue
            GiftConfigModal.vue
        product_spec_submission/
          index.vue
          crud.tsx
      plugins/           # 插件页面
        dvadmin3-flow-web/
        dvadmin_portfolio/
        index.ts         # 插件扫描注册
      portfolio/         # 作品集公开页
    stores/              # Pinia 状态管理 (15 个)
    router/              # 路由配置 (4 个文件)
    directive/           # 自定义指令 (4 个文件)
    i18n/                # 国际化 (~60 个文件)
    theme/               # 主题样式 (~30 个文件)
    utils/               # 工具函数 (24 个文件)
      service.ts         # Axios 封装
      columnPermission.ts  # 列权限处理
    plugin/              # 权限插件
    assets/              # 静态资源
```
