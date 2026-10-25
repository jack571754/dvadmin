# P1 第三批：请求内核与会话失效

日期：2026-10-25。承接 [初始化与会话切换批次](frontend-refactor-p1-bootstrap-report.md)，本批对应 B09。保留其他未提交改动，没有改动业务数据库、升级依赖或提交 Git。

## 入口与返回契约

`shared/api/client.ts` 提供共同的请求生命周期，`utils/http.ts` 注入当前会话、语言、通知和会话失效动作。旧入口仍可按原路径导入，Axios 实例方法、请求参数、返回结构分别保持兼容。

| 入口 | 成功和返回 | 默认超时/序列化 |
| --- | --- | --- |
| `utils/service.ts` 的 `request/requestForMock` | `code:2000` 的完整包，含分页；Swagger/无 code 数据保留；Blob 保留 Axios response 和 headers | 5000ms，动态 `getBaseURL()`；空字符串省略，布尔值转 True/False |
| 同文件的 `service/serviceForMock` 实例 | 同一 DVAdmin 契约 | 实例超时 20000ms；包装函数仍显式覆盖为 5000ms |
| `utils/request.ts` 的默认 Axios 实例 | 旧 `code:0` 或无 code 的 body；保留 get/post 等方法 | 50000ms，沿用 VITE_API_URL 和 qs allowDots |

旧 `api/login/index.ts` 是默认入口的唯一源码导入方，定义 `/user/signIn`、`/user/signOut`；本轮源码没有发现该集合的调用方。实际登录页使用 `views/system/login/api.ts` 的 DVAdmin 入口。删除旧入口前仍应明确外部插件/模板使用范围，不以“当前没有调用”直接移除兼容导出。

调用方覆盖的 timeout 和 headers 继续生效；两个适配器共享 JWT 注入、Accept-Language、会话边界及失败处理。自动 JWT 仅发给配置的 API origin，调用方显式 Authorization 保留，不向外部 origin 自动附加账户 token。

## 请求生命周期与错误

- 每个请求在发送时记录 token 和会话版本，并组合调用方 signal 与会话 AbortController；登出或换账号后中止旧会话请求，迟到成功和错误都作为取消拒绝，不能触发新账号清理或通知。
- 同一有效会话的 HTTP 401、业务 401/4001 仅触发一次清理及失效提示。清理沿用第二批的路由/缓存/WebSocket 生命周期，导航到登录页，无整页刷新；新会话仍可独立失效。
- 403 保留当前会话与页面；校验和业务失败保留字段详情。无 response 的网络错误和超时可正常分类，自定义/mock adapter 的普通 Error 也会释放请求所有权。
- 取消和旧会话响应不弹错误提示。其他失败由共同内核通知一次；不会通过 Axios 写请求自动重试。
- 不改变旧成功包的 data/page/limit/total 层级。失败统一为 `ApiError`，可读取 `kind/code/msg/data/status/response/config`；取消的 name 为 AbortError，兼容 `axios.isCancel()`。

页面处理示例：

```ts
import { isSilentRequestError } from '/@/shared/api/errors';

try {
  const result = await request({ url, method: 'get', signal: controller.signal });
  // result 仍为完整业务响应包。
} catch (error) {
  if (isSilentRequestError(error)) return;
  // 保留表单内容，按 kind/data 展示局部错误；不再重复弹通用错误。
}
```

取消写请求只能停止前端等待，不能撤销服务端可能已经提交的操作；用户主动重试写操作前仍需核对服务端结果。本批没有加入写入幂等或后端事务能力。

## 上传与下载

FormData 的显式 multipart 和自定义 header 与认证头合并，浏览器可正常生成 boundary。Blob 的真实字节、状态和 Content-Disposition 保留；JSON Blob 的业务/认证错误在下载前拒绝，不把错误内容保存为表格。

`downloadFile()` 现在返回可等待的 Promise，支持 UTF-8 filename*、普通 filename 和缺省文件名；JSON 异步任务提示兼容 charset，释放对象 URL。导入组件的两个模板下载点击边界消费已通知的失败，避免未捕获 rejection。浏览器夹具使用与真实后端导出相同的 `Access-Control-Expose-Headers: Content-Disposition`。

## 验证

使用当前固定 Node 24.22.1、pnpm 11.25.0；隔离 E2E 地址 8210/9010，数据库为 `backend/.e2e/db.sqlite3`。TypeScript 的两个配置启用 noEmit/TS 扩展导入，以便 Node 24 单测直接执行受类型检查的共享源码；没有改变 Vite 产物流程。

| 检查 | 结果 |
| --- | --- |
| `pnpm test:unit` | 32 通过，含 12 项新增 HTTP 用例 |
| `pnpm exec playwright test --project=smoke tests/smoke/http.spec.ts tests/smoke/bootstrap.spec.ts tests/smoke/permissions.spec.ts tests/smoke/core.spec.ts` | 22 项通过，含 6 项新增 HTTP 浏览器用例 |
| `pnpm typecheck` | 限定范围通过，新 shared/api 模块和 TS 测试在范围内；未宣称存量全量类型检查通过 |
| `pnpm lint` | 0 新增错误组，502 条存量错误；未扩大基线 |
| `pnpm build` | 通过，原有 chunk/Sass 等警告仍在 |
| 本批相关文件 `git diff --check` | 通过 |

新增验证包括：两种成功码和分页/第三方/Swagger 契约、JWT origin 边界、参数与上传头、跨入口并发 401 的单次清理和单提示、旧 401 不影响新账号、无 response 错误、网络与超时分类、403/校验详情、取消安静退出、写请求不重试、Blob 字节和文件名、JSON Blob 错误拦截及错误后的资源释放。原登录/深链/四布局与权限基线一并回归。

本地日志：`web/quality-reports/p1-http-unit.log`、`p1-http-e2e.log`、`p1-http-build.log`。本批 HTTP 故障及文件用例使用浏览器拦截和 Axios adapter 注入；真实核心账号/菜单/查询回归使用隔离后端。没有对业务库执行写入测试。

## 边界与后续

B09 的共同请求内核及兼容入口已落地；这不等于所有页面的请求状态都已迁移。列表连续筛选的乱序控制和表单局部恢复仍需页面级验证；Element Plus 自带上传 action 等绕过这两个 Axios 入口的传输也没有在本批全量改造。旧拦截器拒绝值现为兼容字段的 ApiError，外部插件若依赖拒绝对象的原型或对象恒等，应单独回归。

版本文件检查仍使用独立 Axios，并等待路由执行，属于 B13 后续范围。WebSocket 重连 handler、精确动态组件注册、完整插件/全语言/移动端验收仍未完成。

下一批优先进入用户/角色试点：将 CRUD 权限快照改为响应式判断，处理列表乱序和表单失败状态。P1 尚未整体验收。回退使用上一前端制品，保持接口、菜单路径和业务数据；不使用全仓 reset 覆盖其他批次的改动。

后续进展：用户列表及用户/角色响应式操作权限的首批结果见 [P2 用户试点交付记录](frontend-refactor-p2-users-report.md)。
