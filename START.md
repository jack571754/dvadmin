# DVAdmin 启动指南

> 适用仓库：`E:\project\管理后台\dvadmin`（仓库根）
> 最后更新：2026-10-25
> 说明：旧文档中的 `django-vue3-admin-master/` 子目录、`start_daphne.ps1`、npm/yarn 命令已不适用；当前前端统一使用 pnpm，仓库根直接包含 `backend/`、`web/`。

---

## 1. 环境要求

| 项目 | 要求 | 说明 |
|------|------|------|
| Python | >= 3.11 | `README.md` 声明；CI 使用 3.12 |
| Django | 5.2.18 | `backend/requirements.txt` |
| Node.js | 24.22.1 | `web/.node-version`；`engines.node` 为 `>=24.0.0 <25` |
| pnpm | 11.25.0 | `web/package.json` 的 `packageManager` |
| 数据库 | 由 `backend/conf/env.py` 决定 | 示例配置包含 MySQL，并保留 SQLite 注释项 |
| Redis | 可选 | Celery / Channels 相关 |

本机环境核查（2026-10-25，仅作参考）：

- Python：`3.13.2`，`pip 24.3.1`；当前环境已安装 Django `5.2.18`。
- 仓库内未检入 `venv`/`.venv`；如使用虚拟环境，请先自行创建并激活。
- 当前 shell 的 Node 为 `v20.20.2`；`fnm` 已安装 `v24.20.0`（满足 `engines`，但 `.node-version` 要求 `24.22.1`）。
- PowerShell 中 `pnpm.cmd --version` 为 `11.25.0`；本次 Bash 会话的 `PATH` 中没有 `pnpm`。

> Node 24 是项目要求，不是可选建议。Node 20 下部分单元测试会因直接导入 `.ts` 失败，详见第 6 节。

---

## 2. 目录速览

```text
dvadmin/
├── backend/     # Django 后端：application/、dvadmin/、plugins/、conf/、manage.py
├── web/         # Vue 3 前端：src/、scripts/、tests/、package.json
├── docker_env/  # Docker 镜像与配置
├── docs/        # 重构、i18n、安全、原型等文档
├── docker-compose.yml
├── START.md     # 本文件
└── CLAUDE.md    # 完整项目文档
```

常用入口：

- 后端配置：`backend/application/settings.py`
- 后端路由：`backend/application/urls.py`
- 后端 ASGI 入口：`backend/application/asgi.py`
- 本地环境配置：`backend/conf/env.py`（由 `conf/env.example.py` 复制，git 忽略）
- 前端脚本：`web/package.json`
- 前端开发配置：`web/.env.development`（已跟踪的配置文件；不要写入凭据）

---

## 3. 首次准备（会改文件/数据库，按需执行）

> 命令约定：以下每个示例代码块默认从仓库根目录开始；后端和前端各开一个独立终端。若在同一终端连续执行多个代码块，先回到仓库根目录，再进入对应子目录，避免重复 `cd` 或误入 `backend/backend`、`backend/web`。
>
> 以下步骤只在首次搭建或更换环境时执行。迁移和初始化会写数据库，执行前请确认目标库并做好备份。本指南不代替你在真实环境中的确认。

### 3.1 创建后端本地配置

> 仅当 `backend/conf/env.py` 不存在时复制；已有配置请保留，不要覆盖。

PowerShell：

```powershell
cd backend
if (-not (Test-Path 'conf\env.py')) {
    Copy-Item 'conf\env.example.py' 'conf\env.py'
}
```

Bash：

```bash
cd backend
[ -f conf/env.py ] || cp conf/env.example.py conf/env.py
```

然后编辑 `backend/conf/env.py`，按实际环境配置数据库、Redis 等。该文件包含敏感信息，已被 `.gitignore` 忽略；不要提交，也不要把内容复制到文档、聊天或命令行。

### 3.2 安装后端依赖

```powershell
cd backend
python -m pip install -r requirements.txt
```

如需完全可复现环境，可使用 `requirements-lock.txt`。

### 3.3 安装前端依赖

先确认 Node 与 pnpm：

```powershell
node --version    # 应为 v24.22.1，或满足 >=24 <25
pnpm --version    # 应为 11.25.0
```

再安装：

```powershell
cd web
pnpm install --frozen-lockfile
```

项目 `preinstall` 会执行 `npx only-allow pnpm`，因此不要改用 npm 或 yarn。

### 3.4 数据库迁移与初始化（会写数据库）

> 仅在首次搭建、数据库为空或明确需要升级结构时执行。不要对生产库直接执行初始化。

```powershell
cd backend

# 仅在模型有变更、需要生成迁移文件时执行
python manage.py makemigrations

# 建表/升级数据库结构
python manage.py migrate

# 初始化系统基础数据
python manage.py init

# 可选：导入省市县数据
python manage.py init_area
```

注意事项：

- `python manage.py init -y` 会以重置模式执行初始化 fixture，可能覆盖既有初始化数据；不了解影响时不要使用。
- 测试使用独立的 `backend/.e2e/db.sqlite3`，不要拿业务数据库做测试库。
- 初始化 fixture 中的用户密码为不可用值（`!`），首次 `init` 后必须设置密码：

  ```powershell
  python manage.py changepassword superadmin
  ```

- 登录账号由初始化数据或管理员配置决定；本文档不记录默认账号和密码。

---

## 4. 日常启动

### 4.1 启动后端

常规 Django 开发服务器：

```powershell
cd backend
python manage.py runserver 127.0.0.1:9000
```

需要 WebSocket / ASGI 时：

```powershell
cd backend
python -m uvicorn application.asgi:application --host 127.0.0.1 --port 9000 --reload
```

说明：

- 当前本机后端工作端口按 `docs/` 和 `web/scripts/test-environment.mjs` 的约定为 **9000**；如被占用可改用其他端口。
- `manage.py runserver` 是 WSGI 开发服务器；WebSocket 请使用 uvicorn 加载 `application.asgi:application`。
- 健康检查：`http://127.0.0.1:9000/healthz`。
- API 文档：`http://127.0.0.1:9000/`（Swagger UI）、`http://127.0.0.1:9000/redoc/`（ReDoc）。
- 生产/容器入口：`backend/gunicorn_conf.py` 绑定 `0.0.0.0:8000`；`backend/docker_start.sh` 使用 uvicorn 监听 `8000`。

### 4.2 启动前端

```powershell
cd web
pnpm dev
```

- 当前本机前端端口按 `docs/` 记录为 **8200**；实际端口由已跟踪的 `web/.env.development` 中的 `VITE_PORT` 决定（`vite.config.ts` 读取该变量）。
- 前端请求地址由 `VITE_API_URL` 控制；`web/.env.development` 已跟踪，不要写入凭据。个人覆盖使用 Vite 支持的未跟踪 `.env.local` 或 `.env.development.local`，使用前先核对 `.gitignore`，确认不会被提交。
- 访问：`http://127.0.0.1:8200/`（以实际 `VITE_PORT` 为准）。

### 4.3 推荐启动顺序

1. 启动后端，确认 `/healthz` 可访问。
2. 启动前端，确认浏览器能打开登录页。
3. 如前端请求失败，先检查 `VITE_API_URL` 是否指向实际后端地址。

---

## 5. 端口与地址（当前本机约定）

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发服务器 | 8200 | 当前本机记录值；由 `VITE_PORT` 控制 |
| 后端开发服务器 | 9000 | 当前本机记录值；可按需更换 |
| Docker 前端 | 8080 | `docker-compose.yml` 映射 |
| Docker 后端 | 8000 | `docker-compose.yml` 映射；`backend/docker_start.sh` 使用 8000 |
| E2E Web | 8210 | 隔离测试默认值 |
| E2E API | 9010 | 隔离测试默认值 |

E2E 配置明确拒绝使用当前工作端口 `8200`、`9000`，避免测试写入开发中的服务或数据库。

---

## 6. 单元测试排障（Windows 实测）

> 以下为 2026-10-25 的实际结果，**不是已修复状态**。未修改 `package.json` 或测试代码。

已验证现象：

1. 当前 shell 的 Node 为 `v20.20.2`，不满足 `web/package.json` 的 `engines.node`（`>=24.0.0 <25`）。
2. 在 `cmd.exe` 中执行 `pnpm.cmd test:unit`（脚本为 `node --test scripts/tests/*.test.mjs`）时，`cmd.exe` 没有展开通配符，`node` 收到字面路径，退出码为 1。
3. 在 Bash 中手动展开通配符后，Node `v20.20.2` 的运行结果为 **3 通过、3 失败**；失败原因是测试直接导入 `.ts` 文件（例如 `../../src/shared/access/bootstrap.ts`），Node 20 不支持这种导入方式。
4. 在 Node 24 下是否全部通过，尚未在本任务中复测。

处理顺序：

1. 先切换到 Node 24.22.1（或满足 `engines` 的 Node 24.x）。
2. 再运行标准入口：

   ```powershell
   cd web
   pnpm test:unit
   ```

3. 如果 Windows `cmd.exe` 仍不展开通配符，可在 PowerShell 中显式展开文件路径：

   ```powershell
   cd web
   node --test (Get-ChildItem scripts/tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName })
   ```

   或逐个文件运行：

   ```powershell
   cd web
   Get-ChildItem scripts/tests/*.test.mjs | ForEach-Object { node --test $_.FullName }
   ```

说明：上面的 PowerShell 写法只用于规避通配符展开问题，不改变测试内容；在 Node 24 下是否通过仍需实际复测。不要把当前 Node 20 的结果当作项目测试基线。

---

## 7. 前端常用命令

以下脚本均来自 `web/package.json`：

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器（`vite --force`） |
| `pnpm build` | 生产构建 |
| `pnpm build:dev` | 开发模式构建 |
| `pnpm build:local` | `local_prod` 模式构建 |
| `pnpm build:flowH5` | 使用 `flowH5.config.ts` 构建 |
| `pnpm lint` | 与 lint 基线比较 |
| `pnpm lint:all` | 全量 ESLint 检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm typecheck` | 限定范围类型检查（`tsconfig.refactor.json`） |
| `pnpm typecheck:legacy` | 旧配置类型检查（`tsconfig.json`） |
| `pnpm test:unit` | Node 单元测试 |
| `pnpm test:e2e` | Playwright smoke 测试 |
| `pnpm test:i18n` | Playwright i18n 测试 |
| `pnpm test:prepare` | 准备隔离 E2E 数据库（会写 `backend/.e2e/`） |
| `pnpm baseline` | 采集前端基线 |

---

## 8. 隔离 E2E 测试

- 配置文件：`web/playwright.config.ts`。
- 启动脚本：`web/scripts/e2e-server.mjs`。
- 测试地址：默认 Web `127.0.0.1:8210`、API `127.0.0.1:9010`。
- 后端设置：`backend/application/e2e_settings.py`。
- 测试数据库：`backend/.e2e/db.sqlite3`，由 `backend/scripts/prepare_e2e.py` 迁移并写入隔离数据。
- 常用命令：

  ```powershell
  cd web
  pnpm test:e2e
  pnpm test:i18n
  ```

- 不要将 E2E 指向 `8200`/`9000` 上的工作服务或业务数据库；测试环境会拒绝这些工作端口。

---

## 9. Docker（可选）

`docker-compose.yml` 定义了 Web、Django、MySQL、Redis、Celery 等服务：

- Web：`8080:8080`
- Django：`8000:8000`
- MySQL：`3306:3306`
- Redis：`6379:6379`

启动方式（需自行确认 Docker 环境）：

```powershell
docker compose up -d
```

首次运行仍需在容器内执行迁移和初始化，相关说明见 `docker_env/README.md`。`docker-compose.yml` 使用 `${MYSQL_PASSWORD}`、`${REDIS_PASSWORD}` 等环境变量；请通过本地环境或未提交的 env 文件提供，不要把凭据写入仓库。

> 本次文档更新未启动 Docker，也未执行容器内初始化；以上仅为文件内容说明。

---

## 10. 常见问题

### 10.1 后端提示缺少 `conf/env.py`

仅在 `conf/env.py` 不存在时复制，已有配置保留：

```powershell
cd backend
if (-not (Test-Path 'conf\env.py')) {
    Copy-Item 'conf\env.example.py' 'conf\env.py'
}
```

然后按实际数据库/Redis 配置编辑该文件。不要提交 `env.py`。

### 10.2 数据库连接失败

- 检查 `backend/conf/env.py` 中的数据库类型、主机、端口、库名。
- 确认数据库服务已启动、账号有权限。
- 不要把密码、连接串或令牌贴到文档、Issue 或聊天中。

### 10.3 `pnpm` 不可用或版本不符

- 确认 Node 为 24.x（优先 24.22.1），pnpm 为 11.25.0。
- 本机 PowerShell 中 `pnpm.cmd` 可用；如果 Bash 会话找不到 `pnpm`，请切换到已配置 pnpm 的 shell。
- 不要在项目中使用 npm/yarn 安装前端依赖；`preinstall` 会拒绝其他包管理器。

### 10.4 端口被占用

```powershell
netstat -ano | findstr :9000
Stop-Process -Id <PID> -Force
```

也可以改用其他空闲端口启动后端或修改前端 `VITE_PORT`。不要把 `8200`/`9000` 用于 E2E。

### 10.5 WebSocket 连接失败

- 确认后端使用 `uvicorn application.asgi:application` 启动，而不是仅用 `manage.py runserver`。
- WebSocket 路由为 `/ws/<service_uid>/`，需要经过 Channels/ASGI。
- 检查反向代理是否支持 WebSocket 升级。

### 10.6 全新环境后端启动时提示缺少 `dvadmin3_celery`

`backend/application/settings.py` 仍导入 `dvadmin3_celery.settings`，但 `backend/requirements.txt` 未列出该包；当前本机环境中已安装。全新环境如遇此问题，需要先确认/安装该依赖，或按项目计划迁移 Celery 配置。详见 `CLAUDE.md` 的“已知限制”。

### 10.7 根 `README.md` 的命令与当前仓库不一致

根 `README.md`、`README.zh.md` 仍含旧路径（如 `django-vue3-admin-master/`）和旧命令（如 `start_daphne.ps1`、npm/yarn）。以本文件与 `CLAUDE.md` 为准。

---

## 11. 相关文档

- [CLAUDE.md](./CLAUDE.md) - 完整项目文档、目录导航、已知限制
- [README.zh.md](./README.zh.md) - 项目简介与模块范围
- [docs/frontend-refactor-p0-report.md](./docs/frontend-refactor-p0-report.md) - 前端重构 P0 记录
- [docs/i18n-guide.md](./docs/i18n-guide.md) - 国际化指南
- [docs/安全风险评估与版本升级建议.md](./docs/安全风险评估与版本升级建议.md) - 安全与版本建议
- [docker_env/README.md](./docker_env/README.md) - Docker 说明
- [backend/requirements.txt](./backend/requirements.txt) - 后端依赖版本
- [web/package.json](./web/package.json) - 前端脚本与版本约束

---

**文档版本：** v4.0.0
**最后更新：** 2026-10-25
**维护原则：** 命令以仓库实际文件和脚本为准；不记录默认账号、密码、API key 或令牌；环境相关结果标注验证日期。
