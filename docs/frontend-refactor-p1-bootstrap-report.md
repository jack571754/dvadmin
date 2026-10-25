# P1 第二批：初始化与会话切换

日期：2026-10-25。承接 [权限基础首批](frontend-refactor-p1-access-report.md)，本批推进 B07 的初始化和会话生命周期，并补齐 B10 的主题版本键迁移、B13 的卸载清理。保留其他未提交改动，没有改动业务数据库或提交 Git。

## 实现与兼容

- 新增可测试的 `createSessionBootstrap`：同一会话共用初始化 Promise，成功后复用，失败后可重试；会话版本变化后旧任务不能发布路由。
- 默认后端路由模式集中等待用户资料、菜单、按钮权限、系统配置、部门和字典。Store 请求返回真正可等待的 Promise，写入前检查 token 与会话版本；用户信息不再从未验证的旧缓存恢复。
- token 替换、移除和跨标签页变化时，立即关闭受保护页面，移除动态路由，清空用户资料、菜单、标签、KeepAlive、字段权限、部门、字典、配置和未读数；关闭旧 WebSocket 和心跳/重连定时器。新账号仍留在原路径时强制重新导航，重新完成初始化。
- App 以会话版本隔离页面实例，公共静态页面继续可用。标签缓存仅对重新验证过的账号恢复；退出登录通过路由返回登录页，无需刷新文档。
- 导航、面包屑、标签、父路由视图与设置组件保留实际 mitt handler 引用并在卸载时清理；标签卸载销毁 Sortable。四布局的延迟滚动任务卸载时取消，分栏高亮容忍 DOM 尚未生成或已移除。
- 主题版本迁移只规范化 `themeConfigVersion`，兼容旧版普通字符串，保留 token 和已有主题偏好；移除原来的全量 Local.clear/reload。修正测试夹具写入非 JSON 版本号导致的异常。
- OAuth 只移除 `_oauth2_token` 参数，保留其他 query 和 hash 深链。
- 用户页仅在有 `role:Search` 权限时加载角色字典，列表使用用户响应自带的 `role_info` 展示名称，避免只读账号产生被拒绝的角色查询和未捕获 Promise。

保留 URL、菜单 component 标识、原 API 返回结构及四种布局；没有改动后端授权策略。旧路由转换入口继续兼容，未在本批统一为新的组件注册器。

## 验证

运行环境为 Node 24.20.0、pnpm 11.25.0，隔离 E2E 端口 8210/9010、数据库 `backend/.e2e/db.sqlite3`。

| 命令/范围 | 结果 |
| --- | --- |
| `pnpm test:unit` | 20 通过，包含本批 6 项初始化及 4 项主题迁移用例 |
| `pnpm exec playwright test --project=smoke tests/smoke/bootstrap.spec.ts tests/smoke/permissions.spec.ts tests/smoke/core.spec.ts` | 16 项通过，包含 8 项新增初始化/会话场景 |
| `pnpm typecheck` | 限定范围通过；新增 shared 逻辑及 TS 测试在范围内，不代表存量全量类型检查 |
| `pnpm lint` | 0 新增错误组，506 条存量错误；没有扩大基线 |
| `pnpm build` | 生产构建通过，原有大 chunk/Sass 等警告仍在 |
| 本批相关文件 `git diff --check` | 通过 |

新增浏览器场景：8 个并发调用的 6 类必要请求各发一次，已完成初始化不重复请求；不刷新文档替换为真实只读账号，旧动态路由/标签/KeepAlive 清空；登出后旧资料响应被拒绝；三次账号替换监听数量不增长；旧菜单迟到不能注册路由；classic/transverse/columns/defaults 切换和导航；从全新存储通过真实登录表单进入工作台；OAuth 深链清理。新增测试同时断言没有未捕获浏览器异常。原权限与三账号接口基线一起回归。

日志位于 `web/quality-reports/p1-bootstrap-e2e.log`、`p1-bootstrap-build.log`；Playwright 保留失败 trace。日志与 trace 仅供本地诊断，不作为源码提交内容。

## 尚未覆盖与下一批

本批四布局验证为导航/卸载冒烟，不能代表插件、表单、移动端和全语言验收。默认后端路由模式有真实浏览器证据；旧前端角色路由模式未完成完整回归。完整外链/iframe 转换、动态组件精确映射仍属于 B07 后续工作。

统一 HTTP client、并发 401 及旧请求错误对新会话的影响仍属 B09；本批 Store 写入校验不替代 HTTP 层处理。WebSocket 的重连 handler 保留、重新连接次数重置和版本检查脱离路由仍属 B13 后续工作。

旧 FastCrud schema 的布尔权限快照、用户列表乱序和筛选恢复、角色授权草稿尚未迁移。下一批优先处理 B09 请求生命周期，再推进用户/角色试点。主题按账号隔离的列/筛选偏好不在本次版本键迁移范围内。

本批保持 API 和菜单路径不变，回退使用上一前端制品；不回滚数据库，也不使用全仓 reset 覆盖混合工作树。B07、B08 和 P1 均未标记为整体完成。

后续进展：本报告记录第二批交付；HTTP 请求内核、并发 401 与下载契约的后续结果见 [P1 第三批交付记录](frontend-refactor-p1-http-report.md)。
