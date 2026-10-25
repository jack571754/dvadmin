# P1 首批：权限基础与初始化等待

日期：2026-10-25。承接 V2 视觉试点，本批对应 B08 的权限来源和响应式入口，以及 B07 的权限初始化等待。保留当前未提交的视觉、后端清理与工具链改动。

## 行为变化

- 两个 `BtnPermission` 定义归并为 `stores/btnPermission.ts`，插件旧路径只 re-export；权限不再持久化，旧缓存不会用于授权。
- 权限请求可被真正等待，同一 Store 的并发请求共用一次网络调用。状态分为 idle/loading/ready/error；失败、刷新和无 token 时拒绝授权，显式请求可重试。
- token 替换、清除、跨标签页 storage 事件清空权限。请求使用会话版本隔离，旧账号的迟到成功或失败都无法覆盖新账号状态。
- `auth/auths/authAll`、插件函数、`v-auth/v-auths/v-auth-all`、插件指令和三种插槽组件使用同一来源。指令隐藏节点而非永久移除；权限授予/撤销、绑定值改变可更新显示，卸载时停止监听。
- 后端路由等待菜单和权限后才挂载页面；前端控制入口也等待权限。登录/改密成功后等待初始化再跳转；初始化失败释放进度和遮罩，下次导航可重试。

请求地址和成功响应保持 `/api/system/menu_button/menu_button_all_permission/`、`{code: 2000, data: string[]}`。权限判定仅控制界面，真实访问仍由后端决定。

## 验证

使用本机 Node 24.20.0、pnpm 11.25.0，前后端 E2E 地址为 8210/9010，测试库为 `backend/.e2e/db.sqlite3`。没有对工作数据库运行写入测试。

| 检查 | 结果 |
| --- | --- |
| `pnpm test:unit` | 10 通过，包含 7 项新增权限用例 |
| `pnpm exec playwright test --project=smoke tests/smoke/permissions.spec.ts tests/smoke/core.spec.ts` | 8 通过：4 项原核心回归、4 项新增权限浏览器用例 |
| `pnpm typecheck` | 限定范围检查通过，新权限 Store 和会话事件包含在内；不代表旧代码全量类型检查 |
| `pnpm lint` | 0 新增错误组，仍有 510 条存量错误；未扩充基线 |
| `pnpm build` | 通过，仍有原有大 chunk / Sass 等警告 |
| 本批相关文件 `git diff --check` | 通过 |

单元测试覆盖等待/并发、失败重试、登出、账号切换时迟到成功/失败、非法响应、权限刷新与订阅释放。浏览器覆盖真实用户查询、三账号接口和越权/数据范围基线、指令与插槽重新授权/绑定更新、慢权限阻止 CRUD 提前查询、初始化失败后再次导航恢复，以及真实跨标签页登出。

本地日志：`web/quality-reports/p1-access-build.log`、`web/quality-reports/p1-access-e2e.log`；Playwright HTML/trace 继续沿用原报告目录。浏览器辅助挂载代码在 `web/tests/helpers/permission-harness.js`，不进入生产入口。

## 边界、后续与回退

本批没有将 B07/B08 或 P1 全部标记完成。旧 FastCrud schema 的 `show: auth(...)` 仍是创建时快照，本次等待初始化修复首次加载判断；运行中刷新权限需后续改为 computed/compute，不能认为全部旧 CRUD 已响应式更新。权限 Store 不会自动轮询后台授权变更。

完整 bootstrap 并发去重、动态菜单/标签/KeepAlive 的账号切换清理、统一 HTTP 401、主题迁移、WebSocket 生命周期、四布局/全语言/插件全面回归尚未覆盖。改密入口的等待逻辑通过构建，但本批没有执行真实改密写入 E2E。

下一批优先完成 B07 初始化与会话生命周期，再迁移用户/角色 CRUD 的权限快照和失败状态。发布回退使用上一前端制品，接口与菜单 component 路径未变；本批未改变业务数据结构，也不需要恢复数据库。当前工作树包含其他批次改动，不能使用全仓 reset 作为本批回退方式。

后续进展：本报告记录首批交付；初始化去重、缓存清理与四布局冒烟的后续结果见 [P1 第二批交付记录](frontend-refactor-p1-bootstrap-report.md)。
