# shared · 会话、权限、请求、公共 UI

> 导航：[仓库根](../../CLAUDE.md) › [web 前端](../CLAUDE.md) › **shared 会话与请求**
>
> 最后更新：2026-10-25

## 这一层负责什么

把"会话"当成一个有生命周期的一等对象：令牌变化即换代，旧请求作废、旧权限清空、
旧初始化不再发布结果。上层的 Pinia store 和页面只消费这里导出的能力。

设计记录：[docs/frontend-refactor-p1-access-report.md](../../../docs/frontend-refactor-p1-access-report.md)、
[p1-bootstrap-report](../../../docs/frontend-refactor-p1-bootstrap-report.md)、
[p1-http-report](../../../docs/frontend-refactor-p1-http-report.md)。

## 四个子目录

### `access/` —— 会话与偏好

| 文件 | 导出 | 职责 |
|------|------|------|
| `bootstrap.ts` | `createSessionBootstrap(getKey)` | 一次会话只允许一次在飞初始化、一个成功结果；用 `getKey()`（令牌）判断是否换代 |
| `startup.ts` | `createStartupState()` / `startupState` | 启动状态机 `idle→initializing→ready/failed`，带 `retry()`；失败后重试替换上一次而不是叠加 |
| `startupResources.ts` | `startOptionalStartupResources()` | 启动期可选资源（失败不阻塞启动），用 `name` 做诊断标识 |
| `permissionStore.ts` | `createPermissionStore(fetch, session)` | 生成 Pinia store `BtnPermission`；`hasPermission()` 要求 `status==='ready'` 且 `owner===当前令牌`，换代后旧权限失效 |
| `sessionEvents.ts` | `sessionRevision`、`sessionViewReady`、`notifySessionChanged()`、`captureSession()`、`onSessionChanged()` | 会话事件的唯一广播点；监听跨标签页 `storage` 事件的 `token` 变化 |
| `eventSubscriptions.ts` | `createEventSubscriptions(bus)` | 保留 mitt 处理器引用，组件卸载时精确注销 |
| `preferences.ts` | `migrateThemeVersion()`、`migrateThemeConfig()` | 偏好迁移：补齐新增 key、迁移旧默认色到深灰预设、保留自定义颜色和登录状态，已删除布局回落 `defaults` |
| `theme.ts` | `applyTheme(config)`、`applyDarkMode(isDark)` | 从统一色板生成完整样式，并同步 `<html>` 上的 `data-theme='dark'` + `.dark` 类；**暗色只能从这里写**，别处各写一套必然漂移 |

**`captureSession()` 的用法**：请求发出前捕获，回来后调用返回的校验函数；会话已换代就抛
`AbortError`（用 `isCancellation()` 判断）。这样避免了"上一个账号的数据渲染到下一个账号页面上"。

### `api/` —— HTTP 运行时

| 文件 | 导出 | 职责 |
|------|------|------|
| `client.ts` | `createHttpRuntime(deps)` | axios 实例工厂，依赖注入 `{ getSession: () => ({token, revision}) }`，便于测试延迟响应与换号 |
| `errors.ts` | `ApiError`、`ApiErrorKind`、`isCancellation()`、`isSilentRequestError()` | 把 axios 错误归一成 8 类：`network`/`timeout`/`cancelled`/`auth`/`forbidden`/`validation`/`business`/`server` |
| `fieldPolicy.ts` | `normalizeFieldPolicy()`、`applyFieldPolicy()`、`fieldPolicyKey()` | 字段级权限（`is_query`/`is_create`/`is_update`）应用到列定义 |

### `composables/` —— 并发原语

| 文件 | 导出 | 职责 |
|------|------|------|
| `latestRequest.ts` | `createLatestRequest(onPending)` | 一个列表只认一个当前查询；相同在飞查询共享响应；旧响应丢弃 |
| `rowMutation.ts` | `useRowMutation()` | 行级变更中状态（`reactive(Set)`），配合 Element `before-change` 只在成功后提交 |

### `ui/` —— 公共组件

- `PageHeading.vue` —— 页面标题 + 描述（V2 里 `/home`、登录后各页头的统一写法，`admin-page-heading`）；
- `StartupError.vue` —— 启动失败兜底页，`role="alert"`，带重试。

## 硬规则

1. **令牌是会话的身份。** 任何缓存数据、权限、在飞请求都必须绑定当前令牌，换号即失效。
2. **不要把 axios 直接 import 到业务里。** 走 `utils/service.ts`，它建立在 `api/client.ts` 之上。
3. **取消不是错误。** `isCancellation()` 为真时不要提示用户、不要写日志。
4. **修改外观通过 `themePresets.ts` 的 `changeThemeMode()`；根标记只经 `applyTheme()` 调用 `applyDarkMode()`。**
5. 这些文件多数有对应的 Node 单测（`web/scripts/tests/*.test.mjs`），改动后跑：

```powershell
cd web
node --test (Get-ChildItem scripts/tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName })
```

## 已知坑

- `permissionStore` 的 `defineStore` 在函数调用时才注册；同一 id `BtnPermission` 重复注册会取首个。
  `stores/btnPermission.ts` 是它的**实例化处**（注入真实 `fetchPermissions` 与 session），改注入请去那里。
- `preferences.ts` 的迁移在 `App.vue` 渲染子组件前完成，然后调用 `applyTheme()`；不要恢复整段旧 `themeConfigStyle`。
- 跨标签页退出登录靠 `storage` 事件；同一标签页内不影响，需要 `notifySessionChanged()` 主动广播。
