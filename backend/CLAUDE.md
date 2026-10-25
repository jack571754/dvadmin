# backend · Django 5.2 后端

> 导航：[仓库根](../CLAUDE.md) › **backend 后端**
>
> 最后更新：2026-10-25 ｜ 技术栈版本以 [requirements.txt](./requirements.txt) 为准

## 入口与运行

| 入口 | 文件 | 说明 |
|------|------|------|
| 管理命令 | `manage.py` | `makemigrations` / `migrate` / `init` / `init_area` / `runserver` |
| ASGI（含 WebSocket） | `application/asgi.py` | `uvicorn application.asgi:application`；`ProtocolTypeRouter`，WS 走 `ws_routing.py` |
| WSGI | `application/wsgi.py` | 仅同步，无 WebSocket |
| Celery 应用 | `application/celery.py` | `config_from_object('django.conf:settings', namespace='CELERY')`；`task_postrun` 回写 `TaskResult.periodic_task_name` |
| 容器启动 | `docker_start.sh` | `uvicorn application.asgi:application --port 8000 --host 0.0.0.0 --workers 4`（migrate/init 已注释掉） |
| Gunicorn | `gunicorn_conf.py` | `uvicorn.workers.UvicornWorker`，workers=CPU*2+1，bind `0.0.0.0:8000` |

Windows 本机开发：`python manage.py runserver 127.0.0.1:9000`（WSGI）；需要 WebSocket 时用 uvicorn 起同一个端口。

## 配置加载链

```
conf/env.py   ← 本地配置，git 忽略（**含数据库/Redis 凭据，不要提交、不要抄进文档**）
  ↑ settings.py:25  `from conf.env import *`
settings.py   ← 组装 DATABASES(:108-117)、DRF(:358-380)、JWT(:389-397)、Channels(:253-266)、日志(:273-352)
  ↑ 插件副作用导入 settings.py:486-487
plugins/*/settings.py + dvadmin3_celery/settings.py  ← 向 INSTALLED_APPS、PLUGINS_URL_PATTERNS 追加
```

`application/settings.py` 在导入时就执行 `from conf.env import *`，所以 **`conf/env.py` 必须先存在**：
`Copy-Item conf/env.example.py conf/env.py`（仅当不存在时复制）。

`env.example.py` 的配置项名（只列 key，值请自行填）：
`DATABASE_ENGINE`、`DATABASE_NAME`、`DATABASE_HOST`、`DATABASE_PORT`、`DATABASE_USER`、
`DATABASE_PASSWORD`、`TABLE_PREFIX`（默认 `dvadmin_`）、`REDIS_DB`、`CELERY_BROKER_DB`、
`REDIS_PASSWORD`、`REDIS_HOST`、`REDIS_URL`、`DEBUG`、`ENABLE_LOGIN_ANALYSIS_LOG`、
`LOGIN_NO_CAPTCHA_AUTH`、`ALLOWED_HOSTS`、`COLUMN_EXCLUDE_APPS`。

SQLite 下另有 WAL + `busy_timeout` 调优（`settings.py:119-128`）。

## 已注册的 app

- `INSTALLED_APPS`（`settings.py:54-68`）：Django 内置 + `rest_framework`、`django_filters`、`corsheaders`、
  `drf_yasg`、`captcha`、`channels`、**`dvadmin.system`**。
- 插件在 `settings.py:486-487` 通过 import 副作用追加：
  - `backend/plugins/dvadmin3_flow/settings.py` → `dvadmin3_flow`，路由前缀 `api/dvadmin3_flow/`；
  - `dvadmin3_celery/settings.py`（**站点包，不在本仓库**）→ `dvadmin3_celery` + `django_celery_beat` +
    `django_celery_results`，路由前缀 `api/dvadmin_celery/`。

## 路由总览

`application/urls.py`：

| 路径 | 说明 | 行 |
|------|------|----|
| `/` | Swagger UI（`/swagger.json`、`/swagger.yaml`、`/redoc/`） | 89-103 |
| `api/system/` | 系统管理（`dvadmin/system/urls.py`） | 104 |
| `api/login/`、`api/logout/`、`token/refresh/`、`apiLogin/` | 登录体系 | 105-114 |
| `api/system/...` 验证码、字典/配置初始化 | 验证码图片、`init/dictionary`、`init/setting` | 111-113 |
| `api/token/` | 仅开发环境 | 117 |
| `sse/` | SSE 推送未读消息（5s 心跳，token 从 query 取） | 122 |
| `api/dvadmin3_flow/`、`api/dvadmin_celery/` | 插件路由（`PLUGINS_URL_PATTERNS` 展开） | 126 |

**`/healthz` 和 `/readiness` 不在 urls.py**，由 `dvadmin/utils/middleware.py:105-157` 的
`HealthCheckMiddleware` 拦截（必须排在 MIDDLEWARE 第一位）。

## 中间件

`settings.py:70-83` 中有三个项目自有中间件：

1. `HealthCheckMiddleware`（71，**必须最先**）
2. `LocaleMiddleware`（76）—— Accept-Language 优先，用户偏好兜底
3. `ApiLoggingMiddleware`（82，**必须最后**）—— 按 `API_LOG_METHODS` 写 `OperationLog`

## 统一响应与异常

- `dvadmin/utils/json_response.py`：`SuccessResponse` / `DetailResponse` / `ErrorResponse`，
  一律 HTTP 200 + body 里的 `code` 区分结果。
- `dvadmin/utils/exception.py`：`CustomExceptionHandler` 把 401/404/DRF/`ProtectedError`/未知异常
  统一转成 `ErrorResponse`。新增接口不要再自己拼错误结构。

## 认证与权限

- 认证：JWT（`AUTH_HEADER_TYPES=("JWT",)`，access 1440 分钟，refresh 1 天，`ROTATE_REFRESH_TOKENS=True`）
  + Session。登录后端 `dvadmin/utils/backends.py:16-40`（密码失败时回退 MD5 比对，兼容老数据）。
- 权限：`CustomPermission`（`dvadmin/utils/permission.py:91-128`）按 `path+method` 匹配
  `RoleMenuButtonPermission`，并先查 `ApiWhiteList`；超管直接放行。
- 数据权限：`DataLevelPermissionMargeFilter`（`dvadmin/utils/filters.py:283`）合并两套过滤器，
  支持 `data_range` 0=仅本人 / 1=本部门及以下 / 2=本部门 / 3=全部 / 4=自定义部门。

详见 [dvadmin/utils/CLAUDE.md](./dvadmin/utils/CLAUDE.md)。

## 目录

| 目录 | 内容 |
|------|------|
| `application/` | settings / urls / asgi / wsgi / celery / e2e_settings / sse_views / dispatch（配置字典缓存）/ websocketConfig |
| `conf/` | `env.example.py`；`env.py` 本地、git 忽略 |
| `dvadmin/system/` | 系统管理模块，见 [系统模块文档](./dvadmin/system/CLAUDE.md) |
| `dvadmin/utils/` | 通用 ViewSet / 权限 / 过滤 / 中间件，见 [utils 文档](./dvadmin/utils/CLAUDE.md) |
| `plugins/dvadmin3_flow/` | 工作流插件，见 [插件文档](./plugins/dvadmin3_flow/CLAUDE.md) |
| `scripts/prepare_e2e.py` | 隔离 E2E 库准备（写 `backend/.e2e/`，git 忽略） |
| `util/` | 仅 `currency.py`（编码生成、缓存锁、部门递归 CTE） |
| `static/` `templates/` | captcha / drf-yasg / rest_framework 的静态与模板 |
| `locale/` | `en`、`zh_Hans` 的 `.po`（`.mo` 被忽略） |
| `logs/` | 运行时日志 `server.log`、`error.log`（路径见 `settings.py:273-275`） |

## 测试

```powershell
cd backend
python -m pytest                      # 配置在 pytest.ini
```

- `pytest.ini`：`DJANGO_SETTINGS_MODULE=application.settings`，`testpaths=dvadmin/utils/tests`。
- `conftest.py` 提供 `api_client`、`en_api_client`、`zh_api_client`、`test_user` 四个 fixture。
- 现有测试只有 `dvadmin/utils/tests/test_i18n.py`（登录错误信息中英文断言）。
- **依赖未声明**：`requirements.txt` 没有列出 `pytest`，也没有 `pytest-django`（而 `pytest.ini` 依赖它）。
  新环境跑测试前需自行 `pip install pytest pytest-django`，否则测试收集阶段就会失败。
- E2E 用独立设置 `application.e2e_settings` + 独立 SQLite（`.e2e/db.sqlite3`），
  **不要指向业务库**。

## 已知限制

1. `dvadmin3_celery` 未列入 `requirements.txt`（`requirements.txt:60-72` 有说明），但
   `settings.py:486` 会 import 它；全新环境按 requirements 安装后启动会失败。它出现在
   `requirements-lock.txt`（`dvadmin3-celery==3.1.6`）里，复现环境请用 lock 文件。
2. `ALWAYS_EAGER` / 内存 Channels 只在 `e2e_settings.py` 中打开；开发环境默认需要 Redis。
3. `application/urls.py:119-120` 映射的 `templates/web/index.html` 目前不存在，该路由不可用。
