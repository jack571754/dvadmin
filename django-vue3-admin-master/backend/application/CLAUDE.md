[根目录](../../../CLAUDE.md) > [backend](../CLAUDE.md) > **application**

---

# Application Django 应用配置

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 application 模块文档 | Claude AI |

---

## 模块职责

Django 应用核心配置模块，负责全局设置、路由注册、中间件配置、WebSocket 支持、Celery 任务队列等。

---

## 入口与启动

### 核心配置文件

| 文件 | 说明 |
|------|------|
| `settings.py` | Django 主配置文件（数据库、认证、中间件等） |
| `urls.py` | 主路由配置 |
| `asgi.py` | ASGI 应用配置（支持 WebSocket） |
| `wsgi.py` | WSGI 应用配置 |
| `celery.py` | Celery 异步任务配置 |
| `websocketConfig.py` | WebSocket Consumer 配置 |
| `ws_routing.py` | WebSocket 路由配置 |
| `sse_views.py` | Server-Sent Events 视图 |
| `dispatch.py` | URL 分发器 |

---

## 配置详解

### settings.py 核心配置

**数据库配置：**
- 支持 SQLite3（默认）、MySQL、PostgreSQL
- 通过 `conf/env.py` 动态配置
- 表前缀：`dvadmin_`

**认证配置：**
- JWT 认证（djangorestframework_simplejwt）
- 自定义认证后端（支持用户名/手机号/邮箱）
- ACCESS_TOKEN_LIFETIME: 1440 分钟

**插件系统：**
- 动态扫描 `plugins/` 目录
- 自动加载插件到 Python 路径
- 支持热插拔

**WebSocket 支持：**
- Channels 4.1.0
- Redis 作为消息代理（可选）

**中间件：**
- CORS 跨域处理
- API 日志记录
- 健康检查

### 路由配置 (urls.py)

**主路由：**
```python
/api/system/        # 系统模块
/api/login/         # 登录
/api/logout/        # 登出
/api/captcha/       # 验证码
/swagger/           # Swagger 文档
/web/               # 前端页面映射
/ws/<token>/        # WebSocket 连接
```

---

## WebSocket 配置

### Consumer (websocketConfig.py)

| Consumer | 路由 | 功能 |
|----------|------|------|
| `MegCenter` | `/ws/<token>/` | 消息中心实时推送 |

### 连接流程

1. 前端获取 JWT token
2. 构建 WebSocket URL：`ws://host:port/ws/{token}/`
3. 后端验证 token 并解析 user_id
4. 加入用户专属 channel：`user_{user_id}`
5. 推送消息到指定用户

---

## Celery 配置 (celery.py)

**任务队列配置：**
- Broker: Redis（可选）
- Backend: Redis（可选）
- 任务序列化：JSON
- 时区设置：Asia/Shanghai

**任务模块：**
- `dvadmin.system.tasks`

---

## 对外接口

### 特殊接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/login/` | POST | 用户登录 |
| `/api/logout/` | POST | 用户登出 |
| `/api/captcha/` | GET | 获取验证码 |
| `/api/token/` | POST | 获取 Token |
| `/token/refresh/` | POST | 刷新 Token |
| `/sse/` | GET | Server-Sent Events |
| `/swagger/` | GET | Swagger UI |
| `/redoc/` | GET | ReDoc |

---

## 环境配置

### 环境变量 (conf/env.py)

从 `env.example.py` 复制并修改：

```python
# 数据库配置
DATABASE_ENGINE = "django.db.backends.mysql"  # 或 sqlite3
DATABASE_NAME = 'django-vue3-admin'
DATABASE_HOST = '127.0.0.1'
DATABASE_PORT = 3306
DATABASE_USER = 'root'
DATABASE_PASSWORD = 'password'

# Redis 配置（可选）
REDIS_HOST = '127.0.0.1'
REDIS_PORT = 6379

# 调试模式
DEBUG = True
```

---

## 依赖关系

### 依赖模块

- Django Core
- djangorestframework
- djangorestframework_simplejwt
- channels（WebSocket）
- celery（异步任务）
- dvadmin.system
- dvadmin.utils
- plugins/*

### 被依赖方

- 所有 Django App
- ASGI/WSGI 服务器

---

## 常见问题 (FAQ)

### 1. 如何添加新的 Django App？

在 `settings.py` 的 `INSTALLED_APPS` 中添加：

```python
INSTALLED_APPS = [
    # ...
    "myapp",
]
```

### 2. 如何配置 WebSocket？

确保使用 ASGI 服务器（Uvicorn）：

```bash
uvicorn application.asgi:application --port 9000 --host 0.0.0.0 --reload
```

### 3. 如何启用 Celery？

配置 Redis 并启动 Celery Worker：

```bash
celery -A application worker -l info
```

### 4. 如何修改数据库？

修改 `conf/env.py` 并运行迁移：

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `settings.py` | Django 主配置 |
| `urls.py` | 主路由 |
| `asgi.py` | ASGI 配置 |
| `wsgi.py` | WSGI 配置 |
| `celery.py` | Celery 配置 |
| `websocketConfig.py` | WebSocket 配置 |
| `ws_routing.py` | WebSocket 路由 |
| `sse_views.py` | SSE 视图 |
| `dispatch.py` | URL 分发器 |

---

## 面包屑导航

```
[根目录] (../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../CLAUDE.md)
       └─ [backend] (../CLAUDE.md)
            └─ [application] (./)
```
