[根目录](../CLAUDE.md) > **backend**

---

# Backend 模块

> 最后更新：2026-02-03 (Django 5.2.0 升级)

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-02-03 | Django 升级到 5.2.0 LTS，Celery 配置更新 | Claude AI |
| 2026-01-23 15:35:00 | 修复 WebSocket 部署，添加 ASGI 启动方式 | Claude AI |
| 2026-01-23 14:19:21 | 初始化模块文档 | Claude AI |

---

## 模块职责

Django 后端服务，提供 RESTful API、WebSocket 服务、异步任务处理等核心功能。

---

## 入口与启动

### 主要入口文件

| 文件 | 说明 |
|------|------|
| `manage.py` | Django 管理命令入口 |
| `main.py` | ASGI 服务器启动入口（uvicorn） |
| `application/asgi.py` | ASGI 应用配置（支持 WebSocket） |
| `application/wsgi.py` | WSGI 应用配置 |
| `gunicorn_conf.py` | Gunicorn 配置文件 |

### 启动方式

> ⚠️ **重要提示**：WebSocket 功能需要 ASGI 服务器支持，使用 `python manage.py runserver` 启动时 WebSocket 不可用。

#### 开发环境（推荐 - 支持 WebSocket）

```bash
# 方式 1：直接使用 uvicorn 命令
# 注意：Windows 系统保留端口 7911-8010，8000 端口不可用
# 推荐使用 9000 端口，如遇端口冲突请更换其他端口（如 8888、8080）
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload

# 方式 2：使用提供的启动脚本
# Windows:
start_dev_asgi.bat

# Linux/Mac:
bash start_dev_asgi.sh
```

#### 传统方式（不支持 WebSocket）

```bash
# 注意：此方式不支持 WebSocket！
# Windows 系统如遇端口占用，请使用其他端口
python3 manage.py runserver 0.0.0.0:9000
```

#### 生产环境

```bash
# Uvicorn（推荐）
# 注意：请根据实际环境调整端口
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --workers 4

# 或使用启动脚本
# Windows:
start_prod_asgi.bat

# Gunicorn（不支持 WebSocket）
gunicorn application.wsgi:application -c gunicorn_conf.py
```

#### WebSocket 说明

- **路由**：`/ws/<token>/`
- **Consumer**：`application.websocketConfig.MegCenter`
- **功能**：消息中心实时推送
- **要求**：必须使用 ASGI 服务器（Uvicorn/Daphne）

---

## 对外接口

### API 路由

主路由配置：`application/urls.py`

| 路径前缀 | 说明 | 配置文件 |
|---------|------|---------|
| `/api/system/` | 系统模块接口 | `dvadmin/system/urls.py` |
| `/api/login/` | 登录接口 | `LoginView.as_view()` |
| `/api/logout/` | 登出接口 | `LogoutView.as_view()` |
| `/api/captcha/` | 验证码接口 | `CaptchaView.as_view()` |
| `/api/token/` | Token 获取 | `LoginTokenView.as_view()` |
| `/token/refresh/` | Token 刷新 | `TokenRefreshView.as_view()` |
| `/swagger` | Swagger API 文档 | `drf-yasg` |
| `/web/` | 前端页面映射 | `web_view()` |

### WebSocket 路由

- **配置文件**：`application/ws_routing.py`
- **Consumer**：`application.websocketConfig.MegCenter`
- **路由**：`/ws/<service_uid>/`（service_uid 为 JWT token）
- **功能**：消息中心实时推送
- **支持 SSE**：`/sse/`（Server-Sent Events，用于备选）

### WebSocket 连接流程

1. 前端获取 JWT token
2. 使用 token 构建 WebSocket URL：`ws://host:port/ws/{token}/`
3. 后端验证 token 并解析 user_id
4. 加入用户专属 channel：`user_{user_id}`
5. 推送消息到指定用户

---

## 关键依赖与配置

### 依赖包（requirements.txt）

核心依赖：
- Django 5.2.0 (LTS)
- djangorestframework 3.16.0
- djangorestframework_simplejwt 5.5.0
- drf-yasg 1.21.7
- channels 4.1.0
- django-celery-beat 2.8.1
- django-celery-results 2.5.1
- pymysql 1.1.0

### 配置文件

| 配置文件 | 说明 |
|---------|------|
| `application/settings.py` | Django 主配置 |
| `conf/env.example.py` | 环境变量示例（需复制为 env.py） |
| `conf/env.py` | 实际环境配置（不提交到版本控制） |

### 关键配置项

```python
# 数据库配置
DATABASE_ENGINE = "django.db.backends.mysql"  # 或 sqlite3
DATABASE_NAME = 'django-vue3-admin'
DATABASE_HOST = '127.0.0.1'
DATABASE_PORT = 3306
TABLE_PREFIX = "dvadmin_"

# JWT 配置
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=1440),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# 日志配置
LOGGING = {
    # 配置详见 settings.py
}
```

---

## 数据模型

### 核心模型（system 模块）

详见 [backend/dvadmin/system/CLAUDE.md](./dvadmin/system/CLAUDE.md)

### 基础模型类

- `CoreModel`：所有业务模型的基类（`dvadmin/utils/models.py`）
- `SoftDeleteModel`：软删除模型支持

---

## 测试与质量

### 测试文件

- `backend/dvadmin/system/tests.py`：系统模块测试

### 运行测试

```bash
python3 manage.py test
```

---

## 常见问题 (FAQ)

### 1. 数据库迁移失败

确保 `conf/env.py` 配置正确，然后：

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 2. 初始化数据执行

```bash
python3 manage.py init          # 初始化系统数据
python3 manage.py init_area     # 初始化省市区数据
```

### 3. 插件开发

在 `plugins/` 目录下创建插件，插件会自动加载到 Python 路径。

### 4. 静态文件收集

```bash
python3 manage.py collectstatic
```

### 5. WebSocket 返回 404 错误

**原因**：使用了 WSGI 服务器（`python manage.py runserver`），不支持 WebSocket 协议。

**解决方案**：使用 ASGI 服务器启动

```bash
# 停止 WSGI 服务器，使用以下命令启动
# Windows 系统保留端口 7911-8010，推荐使用 9000
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload
```

**验证方法**：WebSocket 连接成功应返回 101 状态码，而不是 404。

### 6. 前端 WebSocket 状态显示"未连接"

1. 确认后端使用 Uvicorn 启动
2. 检查浏览器控制台 WebSocket URL：`ws://host:port/ws/{token}/`
3. 确认 JWT token 有效
4. 检查后端日志是否有连接记录

---

## 相关文件清单

### 目录结构

```
backend/
├── application/          # Django 应用配置
│   ├── settings.py      # 主配置
│   ├── urls.py          # 主路由
│   ├── asgi.py          # ASGI 配置
│   ├── wsgi.py          # WSGI 配置
│   └── ...
├── dvadmin/             # 核心业务模块
│   ├── system/          # 系统模块
│   └── utils/           # 工具类
├── conf/                # 配置文件
│   └── env.example.py   # 环境变量示例
├── static/              # 静态文件
├── logs/                # 日志文件
├── media/               # 用户上传文件
├── plugins/             # 插件目录
├── templates/           # 模板文件
├── manage.py            # Django 管理命令
├── main.py              # ASGI 服务器入口
├── gunicorn_conf.py     # Gunicorn 配置
└── requirements.txt     # 依赖包
```

### 重要文件

| 文件 | 说明 |
|------|------|
| `manage.py` | Django 管理脚本 |
| `main.py` | ASGI 服务器启动脚本 |
| `del_migrations.py` | 删除迁移文件的脚本 |
| `docker_start.sh` | Docker 启动脚本 |
