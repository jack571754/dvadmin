# theme · 视觉层（设计令牌 / Element 覆盖 / 暗色）

> 导航：[仓库根](../../../CLAUDE.md) › [web 前端](../../CLAUDE.md) › **theme 视觉层**
>
> 最后更新：2026-10-25

## 这一层负责什么

全站视觉的入口：语义设计令牌、Element Plus 组件覆盖、fast-crud 表面层、暗色模式对接。
业务页面**不应该**写死颜色，只消费 `var(--admin-*)`。

视觉方案文档在 [docs/frontend-visual-v2.md](../../../docs/frontend-visual-v2.md)，原型在 `docs/prototypes/`（含 `styles.css`）。
当前四套现代配色见 [modern-theme-settings.md](../../../docs/modern-theme-settings.md) 和 [原型色板](../../../docs/prototypes/theme-palettes.css)。色值统一在 `shared/access/themePresets.ts` 定义，`tokens.scss` 保留首帧回退色与尺寸令牌。新增色值先更新原型和文档。

## 加载顺序（决定谁能覆盖谁）

外部 CSS 在 [`main.ts`](../main.ts) 中引入，SCSS 在 [`index.scss`](./index.scss) 中 `@use`。
顺序即层叠优先级（同类选择器下，后加载者胜）：

| # | 内容 | 位置 | 备注 |
|---|------|------|------|
| 1 | Tailwind | `main.ts:7` | 故意先引入，避免与 Element 冲突 |
| 2 | `element-plus/dist/index.css` | `main.ts:9` | UI 库基础样式 |
| 3 | `element-plus/theme-chalk/dark/css-vars.css` | `main.ts:11` | 必须在 #2 之后，否则亮色值反弹 |
| 4 | `theme/index.scss` | `main.ts:12` | 本目录的总入口 |
| 5 | fast-crud `style.css` | `settings.ts:6`（经 `main.ts:16` 加载） | **在 #4 之后**，所以 CRUD 覆盖样式必须从 `settings.ts` 里引入 |
| 6 | `assets/style/reset.scss` | `main.ts:33` | 晚于主题，会反向覆盖部分表格/placeholder 样式 |

`index.scss` 内部的 `@use` 顺序：`tokens → element-vars → app → common/transition → other → element → media/media → dark → fa → modern → skin/*`。
（`waves.scss` 已随 v-waves 指令一并删除，不要再 `@use` 它。）

## 令牌分层

```
--next-*   旧主题变量（app.scss 里保留，逐步指向下面一层）
   ↓
--admin-*  语义令牌（themePresets.ts 运行时色板 + tokens.scss 首帧回退）
   ↓
--el-*     Element Plus 变量（element.scss / modern.scss 把语义令牌映射过去）
```

**主题通过配置重新生成。** `shared/access/theme.ts` 的 `applyTheme()` 同时应用语义令牌、Element Plus 主色衍生值、导航变量及亮暗标记。`App.vue` 在渲染子组件前迁移偏好，监听配置更新；不再恢复整段 `themeConfigStyle`。

四套预设为黑白、冷灰蓝、暖灰、深灰，默认深灰。每套都有亮暗色板，切换模式保留用户自定义颜色；主色衍生值向当前表面混合，按钮文字按对比度选色。所有暗色开关经 `changeThemeMode()` 修改配置，再由 `applyTheme()` 调用 `applyDarkMode()` 同步两个根标记。

`--admin-accent-fg` 用于主色文字，`--admin-primary-foreground` 用于实心主色背景上的文字。状态色拥有各自的 `--admin-*-foreground`，不能统一写死白字。

## 文件职责

| 文件 | 行数 | 职责 |
|------|------|------|
| `tokens.scss` | 105 | 语义令牌真源：表面/文字/线/强调/状态/圆角/阴影/字号/间距，含亮暗两套 |
| `index.scss` | 11 | 总入口，只有 `@use` |
| `app.scss` | 329 | 全局重置、布局骨架尺寸（侧栏、顶栏）、工具类 |
| `modern.scss` | 38 | V2 外壳与产品表面（`.layout-modern`、`.admin-surface`、`.admin-workspace/.admin-users/.admin-role`） |
| `element.scss` | 399 | Element Plus 组件覆盖（按钮、表单、菜单、分页、Tag、抽屉…） |
| `fastCrud.scss` | 72 | fast-crud 表面层，作用域 `.fs-crud-container` |
| `dark.scss` | 134 | 暗色**对接层**：把 EP 官方暗色变量和 `--admin-*` 接上，不重复定义色板 |
| `dark.legacy.scss` | 251 | P4 之前的暗色实现，**不参与构建**，仅作回滚备份 |
| `other.scss` | 39 | wangeditor 富文本 |
| `tableTool.scss` / `loading.scss` / `iconSelector.scss` | 27/51/31 | 局部组件样式 |
| `media/`、`mixins/`、`common/`、`fa/` | — | 响应式断点、SCSS mixin、过渡、图标字体 |

## 硬规则

1. **只用令牌，不写死色值。** 新增样式一律 `var(--admin-*)`；确需新色值先补 `themePresets.ts` 的亮暗两套，并核对 `tokens.scss` 首帧回退。
2. **不要用 `--el-color-white` 当背景。** 官方暗色层不重定义它，它在暗色下仍是纯白 → 白底白字。
   背景用 `--admin-surface` / `--admin-canvas`。
3. **选择器形状要照抄 Element。** EP 的类型化规则是 `.el-tag.el-tag--primary`（特异性 0,2,0），
   plain 变体是 `.el-tag--plain`（**不是** `.is-plain`）。只写 `.el-tag--primary` 会被静默盖掉。
4. **少用 `!important`。** 用 `html.dark` 前缀或提高特异性即可；`!important` 会压掉后续所有修正
   （分页配色曾经因此两处打架）。
5. **颜色类改动要过 AA。** 正文对比度 ≥ 4.5:1，大字/非文字 ≥ 3:1。改完在浏览器里实测，不要目测。
6. **`.fs-crud-container` 而不是 `.fs-page`。** `.fs-page` 只覆盖 28 个 CRUD 中的 20 个，且被 4 个非 CRUD 页面使用。

## 验证

```powershell
cd web

# SCSS 能否编译（改完 .scss 先跑这个，报错行号是准的）
node node_modules/sass/sass.js --no-source-map --load-path=src src/theme/index.scss

# 样式是否真的命中（比看代码可靠：CSS 特异性失误不会报错，只会静默回退）
# 在浏览器 DevTools 里选中元素，看 Computed 面板拿到的 --admin-* 实际值
```

对比度请用实测值而非估算：取 `getComputedStyle` 的 `color` 与背景色，按 WCAG 相对亮度公式换算。
注意 `color-mix()` 的输出可能是 `color(srgb 0.64 0.63 0.94)` 形式（0–1 浮点），解析时不要当成 0–255。

## 已知坑

- `reset.scss` 晚于主题加载，样式"改了没生效"时先怀疑它。
- 暗色下 `<html>` 需要 `[data-theme='dark']` **和** `html.dark` 两个属性同时成立，
  由 [`shared/access/theme.ts`](../shared/access/theme.ts) 统一处理，不要在别处各写一套。
- EP 官方暗色层给 `html.dark` 加了 `color-scheme: dark`，未显式设色的文字会自动变白；
  所以 `body` 必须钉死 `color: var(--admin-text)`（`app.scss`）。
- 页面级 `:deep()` 覆盖仍有 38 处 / 18 个文件，能收敛到本目录的就收敛。
