# 前端重构 P0 交付记录

日期：2026-10-24。范围：建立可运行、可比较的重构基线和三张交互原型。生产页面重构尚未开始。

本批脱敏的构建、浏览器采样及接口字段摘要见 [基线数据](frontend-refactor-p0-baseline.json)。

## 当前基线与工作区保护

- 当前基线提交为 `e2e9c789ce7a2c32eab71aa89440049c64dcc41b`，分支为 `chore/project-slim-down`。
- 实施前保留工作区差异、状态以及 package/lockfile 到项目外的 `dvadmin-backups/p0-20261024-224722/`。未提交、重置或覆盖此前的业务移除、安全升级和配置修改。
- 保留 135 个 Vue 页面/子组件文件、27 份 CRUD 配置；使用系统、配置、日志、Celery 和通用审批模块。
- 测试从官方初始化器构造专用数据，不复制当前数据库。测试初始化器合并 Celery fixture 与本地页面包装器的重复路由，保持每个路径唯一；这只作用于测试库。

## 已落地内容

### B02 工具链与质量检查

- 固定 Node `24.22.1`（`.node-version`）和 pnpm `11.25.0`（`packageManager`）；实际使用上述版本验证。
- TypeScript 升为 `5.9.3`，增加 vue-tsc；建立 ESLint flat config，升级兼容的 parser/plugin，补上非修改型 lint 命令。
- `pnpm lint` 检查全部源码及新增基础设施，与已登记的旧错误比较，新增错误使命令失败。基线按文件、规则、消息计数，不按容易漂移的行号屏蔽。
- 当前旧源码有 514 条 ESLint 错误、415 组指纹；它们没有被修复或宣称通过。`pnpm lint:all` 保留完整原始检查入口。
- `pnpm typecheck` 严格检查测试配置、测试代码，以及后续 app/shared/features 新模块；不代表旧页面已经全部类型正确。`pnpm typecheck:legacy` 在 TS 5.9.3 下产生 308 条现有代码及依赖源码诊断，保留在本地报告中，后续按迁移批次消化。
- ESLint 暂保留 9 主版本，生态维护提示列入后续工具链升级项；本批完成配置可运行及基线约束，不宣称全栈依赖已完成升级。

### B03 隔离测试环境

- 新增 `application.e2e_settings`，强制使用 `backend/.e2e/db.sqlite3`，测试媒体、日志、缓存、消息通道及 JWT 签名与工作环境隔离。
- `prepare_e2e.py` 迁移并幂等初始化专用账号、角色和部门：`e2e_admin` 超管、`e2e_reader` 全局只读、`e2e_scoped` 本部门只读、`e2e_outside` 外部门样本。
- 默认为 Web `127.0.0.1:8210`、API `127.0.0.1:9010`。拒绝非本地 origin、带凭据 URL、工作项目 8200/9000 端口和前后端同端口；不复用未知服务。
- 修复浏览器首次导航前写入 localStorage 的 origin 问题，按真实登录契约发送 MD5 密码，并将 token 仅注入测试 origin。旧国际化用例统一改用配置的 baseURL。
- CI 改为显式安装 Node、pnpm、Python，使用隔离后端与 `/healthz` 就绪探测；不再在 web 下错误地 `cd backend`。
- 工作数据库中未发现任何 `e2e_*` 账号。GitHub Actions 工作流尚未在远端执行，当前验证是本机 Windows 环境。

### B04 已核实的契约

| 接口/行为 | 当前验证结果 |
| --- | --- |
| 登录 | POST `/api/login/`，密码为 MD5；HTTP 成功之外还需检查业务 `code=2000`；token 在 `data.access` |
| 菜单 | GET `/api/system/menu/web_router/`；包含 component、web_path 等字段；测试校验路径唯一和用户菜单存在 |
| 用户分页 | GET `/api/system/user/?page=1&limit=100`；列表在 data，分页在 page/limit/total |
| 超管列表行为 | 现有用户接口排除超级用户；不能用“超管在列表中”作为成功条件 |
| 只读权限 | `e2e_reader` 查询成功、直接 POST 用户接口被拒绝；响应为 HTTP 200、业务码 4000 和权限错误信息 |
| 数据范围 | `e2e_reader` 可看到外部门样本，`e2e_scoped` 查不到外部门样本；不是仅检查前端按钮 |
| 特殊响应 | 下载 Blob、异步导出及第三方响应继续独立建模；本批没有执行全部下载/外部服务回归 |

脱敏样本生成在 `web/quality-reports/contract-e2e_*.json`；只保存响应字段名与数量，不保存 token、密码或真实用户内容。

### B05 可交互原型

文件：`docs/prototypes/dvadmin.html`。运行 `node web/scripts/prototype-server.mjs` 可在 `http://127.0.0.1:8211/` 查看。

- 工作台：功能入口、最近访问、通知空态；不使用虚假业务 KPI 冒充真实数据。
- 用户管理：部门、查询、重置、空态、失败重试、新增编辑抽屉/弹窗及结果上下文。
- 角色授权：即时菜单保存与当前菜单字段保存分别反馈；保存失败保留草稿、关闭未保存确认、放弃后恢复已保存状态。
- 支持浅/深色、紧凑密度与窄屏；浏览器测试验证 390px 下页面不发生整体横向溢出，表格在自己的容器内滚动。
- 原型使用模拟数据，无后端请求，不会修改真实用户、角色和权限。它用于交互评审，不作为已上线的生产页面。

### B06 性能和构建记录

新增 `pnpm baseline` 记录构建资产、gzip 字节、Node 版本、基线提交与锁文件摘要。资产总量不等于首屏传输量。浏览器 baseline 项目使用生产 preview、1440×900、Chrome 147、回环网络、无网络或 CPU 限速，采集 20 次新 context 冷启动及 20 次同 context 的 home→user 暖导航。

指标定义为导航发起到隔离样本用户行可见，包含 API 及自动化开销；它是本地对比基线，不是线上 SLO。原始数据保存在 `web/quality-reports/browser-baseline.json`。最终复核冷启动 p75 约 594ms、暖导航约 934ms。该数字来自本机回环网络，不代表线上用户体验。

暖导航更慢是实测现象，尚不直接归因为某一个模块；P1 将结合版本检查、路由缓存和重复请求进一步分析。不得把此数字写成已经提升的性能收益。

## 可复现命令

先切换 Node 24.22.1，进入 web 目录；Python 须已安装后端 requirements。Windows 可用环境变量 `PYTHON` 指定 Python 可执行文件。

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm baseline
pnpm test:e2e
pnpm test:i18n tests/i18n/home.spec.ts tests/i18n/user.spec.ts tests/i18n/role.spec.ts

# 生产预览基线：自动启动独立测试库/API，并构建测试 API 配置的 preview
$env:E2E_PREVIEW = '1'
pnpm exec playwright test --project=baseline
Remove-Item Env:E2E_PREVIEW

# 检查现有全量问题，预期当前仍有非零退出码
pnpm lint:all
pnpm typecheck:legacy
```

生产预览测试会将 dist 构建为测试 API 地址；测试后执行普通 `pnpm build` 恢复正式部署配置，再按需运行 `pnpm baseline`。日常开发 8200/9000 服务不由测试重启。

## 验证范围和下一阶段

本批通过标准构建、冻结安装、限定范围类型检查、无新增 lint 错误及 3 个隔离工具测试；开发环境的浏览器/API/原型加首页/用户/角色中英文检查共 8 项通过，生产预览的冒烟与 20 冷/20 暖采样共 6 项通过。没有执行全部系统表单、所有权限组合、所有插件和远端 CI；不能将这些结果等同全站功能通过。

下一批进入 P1：统一 session/bootstrap 和权限来源，建立请求兼容层、按键迁移偏好，再落地默认布局与公共页面组件。继续保留旧页面入口和既有 API，先用当前基线验证每一批改动。
