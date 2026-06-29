[根目录](../../CLAUDE.md) > **backend**

# Backend 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 settings.py 详细配置（SQLite WAL 并发支持、django-restql 集成、API_MODEL_MAP）、刷新对外接口表、补充 requirements-prod.txt 内容说明 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

Django 后端服务，提供 RESTful API 接口、权限控制、工作流审批引擎和 WebSocket 实时通信。

---

## 入口与启动

- **启动入口**：`main.py` -- 使用 uvicorn 运行 ASGI 应用，端口 9000
- **ASGI 配置**：`application/asgi.py`
- **WSGI 配置**：`application/wsgi.py`
- **Django 设置**：`application/settings.py`
- **URL 路由**：`application/urls.py`
- **Celery 配置**：`application/celery.py`
- **WebSocket 路由**：`application/ws_routing.py`
- **SSE 视图**：`application/sse_views.py`

---

## 对外接口 (URL 路由)

| 路径前缀 | 应用 | 说明 |
|----------|------|------|
| `/api/system/` | dvadmin.system | 系统管理 API |
| `/api/design_order/` | dvadmin.design_order | 设计工单 API（含产品规格书 Save/Load 自定义 APIView） |
| `/api/dvadmin3_flow/` | dvadmin3_flow | 工作流审批 API |
| `/api/portfolio/` | dvadmin_portfolio | 作品集展示 API（含免登录公开接口） |
| `/api/login/` | - | 登录接口 |
| `/api/logout/` | - | 登出接口 |
| `/api/captcha/` | - | 验证码接口 |
| `/sse/` | - | Server-Sent Events |
| `/` | drf-yasg | Swagger API 文档 |

---

## 关键依赖与配置

### settings.py 要点

- `INSTALLED_APPS`：注册了 system, test_app, design_order 三个核心应用
- 插件通过底部 `from xxx.settings import *` 自动注入（dvadmin3_celery, dvadmin3_flow, dvadmin_portfolio）
- 认证后端：`CustomBackend`（支持用户名/手机号登录）
- JWT 配置：`ACCESS_TOKEN_LIFETIME = 1440 分钟`，前缀 `JWT`，启用 `ROTATE_REFRESH_TOKENS`
- CORS：`CORS_ORIGIN_ALLOW_ALL = True`，`CORS_ALLOW_CREDENTIALS = True`
- Channel Layers：内存模式（生产应换 Redis）
- **SQLite 并发优化**：通过 `connection_created` 信号自动启用 `PRAGMA journal_mode=WAL` + `PRAGMA busy_timeout=5000`，支持 Playwright 测试并发读写
- **国际化**：`LANGUAGES` 支持 `zh-hans`、`en`、`zh-hant`，`LOCALE_PATHS = [BASE_DIR/locale]`
- **API 日志**：`API_LOG_METHODS = ["POST", "UPDATE", "DELETE", "PUT"]`
- **API_MODEL_MAP**：将 URL 路径映射到中文模块名，用于日志显示（`/api/login/` -> "登录模块" 等）
- **静态文件压缩**：`STATICFILES_STORAGE = whitenoise.storage.CompressedStaticFilesStorage`
- **分页/过滤/异常**：默认使用 `CustomPagination`、`CustomDjangoFilterBackend`、`CustomExceptionHandler`

### 环境配置

- `conf/env.example.py`：环境配置模板（数据库、Redis 等）
- `conf/env.py`：实际环境配置（gitignore）

### 依赖文件

- `requirements.txt`：开发依赖
- `requirements-prod.txt`：生产额外依赖
  - `psycopg2-binary==2.9.9`（PostgreSQL 驱动）
  - `gunicorn==23.0.0`（WSGI 服务器）
  - `gevent==24.2.1`（协程库）
  - `redis==5.0.8`（Redis 客户端）
  - 通过 `-r requirements.txt` 自动引入基础依赖

---

## 数据模型

### 核心应用

| 应用 | 模型 | 表名 |
|------|------|------|
| system | Users, Role, Dept, Menu, MenuButton, MenuField, FieldPermission, Dictionary, OperationLog, LoginLog, FileList, Area, ApiWhiteList, SystemConfig, MessageCenter, DownloadCenter | `system_*` |
| design_order | ProductArchive, ProductSpec, ProductSpecSnapshot, ProductSpecSubmission | `dvadmin_design_order_*` |
| test_app | Blog, Product | `test_*` |

### 插件

| 插件 | 模型 | 表名 |
|------|------|------|
| dvadmin3_flow | FlowInfo, FlowNode, FlowData, FlowRecord, FlowAuditUsers | `workflow_*` |
| dvadmin_portfolio | PortfolioConfig, ResumeTimeline, PortfolioItem | `portfolio_*` |

---

## 测试与质量

- `conftest.py`：pytest 配置
- `dvadmin/utils/tests/test_i18n.py`：唯一的自动化测试
- **缺口**：system, design_order, dvadmin3_flow, dvadmin_portfolio 均无自动化测试

---

## 常见问题 (FAQ)

**Q: 为什么端口是 9000 而不是 8000？**
A: Windows 系统保留端口 7911-8010，8000 端口可能不可用。`main.py` 已硬编码 9000。

**Q: 插件如何注册？**
A: 在 `application/settings.py` 底部添加 `from xxx.settings import *`，插件的 settings.py 会自动将自身注册到 INSTALLED_APPS 和 PLUGINS_URL_PATTERNS。

**Q: SQLite 在测试时遇到 "database is locked" 怎么办？**
A: 已通过 `_configure_sqlite_for_concurrency` 信号处理器启用 WAL 模式与 busy_timeout=5000，理论上应缓解。若仍出现，建议生产环境改用 PostgreSQL（见 requirements-prod.txt）。

**Q: 如何扩展 API_MODEL_MAP 让日志更友好？**
A: 在 settings.py 的 `API_MODEL_MAP` 字典中追加 `{"URL路径": "中文模块名"}`。

---

## 相关文件清单

```
backend/
  main.py                          # 启动入口
  manage.py                        # Django 管理命令
  conftest.py                      # pytest 配置
  requirements.txt                 # 开发依赖
  requirements-prod.txt            # 生产依赖（PostgreSQL/Gunicorn/gevent/redis）
  del_migrations.py                # 迁移清理脚本（开发辅助）
  application/
    settings.py                    # Django 全局设置
    urls.py                        # 根路由
    asgi.py                        # ASGI 配置
    wsgi.py                        # WSGI 配置
    celery.py                      # Celery 配置
    dispatch.py                    # 系统初始化调度
    sse_views.py                   # SSE 视图
    websocketConfig.py             # WebSocket 配置
    ws_routing.py                  # WebSocket 路由
  conf/
    env.example.py                 # 环境配置模板
  dvadmin/
    system/                        # 系统管理模块
    design_order/                  # 设计工单模块
    test_app/                      # 测试示例应用
    utils/                         # 工具类库
  plugins/
    dvadmin3_flow/                 # 工作流审批插件
    dvadmin_portfolio/             # 作品集展示插件
```
