# DVAdmin 项目启动指南

> 快速启动 Django Vue3 Admin 项目

## 📋 环境要求

- Python >= 3.11.0
- Node.js >= 16.0.0
- MySQL >= 8.0（可选，默认使用 SQLite）
- Redis（可选，用于 Celery 和 Channels）

## 🚀 快速启动

### 1️⃣ 后端启动

```powershell
# 进入后端目录
cd django-vue3-admin-master/backend

# 激活虚拟环境（如果已创建）
.\venv\Scripts\Activate.ps1

# 首次启动需要安装依赖
pip install -r requirements.txt

# 数据库迁移（首次启动）
python manage.py makemigrations
python manage.py migrate

# 初始化数据（首次启动）
python manage.py init

# 启动服务（支持 WebSocket）
powershell -ExecutionPolicy Bypass -File start_daphne.ps1
```

**后端地址：** http://localhost:8001

### 2️⃣ 管理后台前端启动

```powershell
# 进入前端目录
cd django-vue3-admin-master/web

# 首次启动需要安装依赖
npm install

# 启动开发服务器
npm run dev
```

**前端地址：** http://localhost:9001


## 🔑 默认账号

- **用户名：** `superadmin`
- **密码：** `admin123456`

## 📦 技术栈版本

### 后端
- Django 5.2.0 LTS
- Django REST Framework 3.16.0
- Daphne 4.2.1（ASGI 服务器，支持 WebSocket）
- Channels 4.1.0（WebSocket 支持）
- JWT 认证 5.5.0

### 前端
- Vue 3.5.27
- Element Plus 2.13.2
- Vite 5.4.1
- TypeScript 4.9.4
- Pinia 2.3.1

## 🔧 常用命令

### 后端

```powershell
# 创建超级用户
python manage.py createsuperuser

# 清空数据库并重新初始化
python manage.py flush
python manage.py init

# 收集静态文件（生产环境）
python manage.py collectstatic

# 运行测试
python manage.py test
```

### 前端

```powershell
# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint-fix
```

## 📝 配置说明

### 后端配置

**环境配置文件：** `backend/conf/env.py`

```python
# 数据库配置
DATABASE_ENGINE = "django.db.backends.sqlite3"  # 或 mysql/postgresql
DATABASE_NAME = "db.sqlite3"

# Redis 配置（可选）
REDIS_HOST = "127.0.0.1"
REDIS_PASSWORD = ""
```

### 前端配置

**环境配置文件：** `web/.env.development`

```env
# API 地址
VITE_API_URL = 'http://127.0.0.1:8001'

# 是否启用按钮权限
VITE_PM_ENABLED = true
```

## 🌐 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 8001 | Django + Daphne（支持 WebSocket） |
| 管理后台 | 9001 | Vue3 前端（9000 被占用时自动切换） |

## 🔌 WebSocket 支持

项目使用 **Daphne** 作为 ASGI 服务器，完整支持 WebSocket。

**WebSocket 地址：** `ws://127.0.0.1:8001/ws/<token>/`

**功能：**
- 实时消息通知
- 在线状态同步
- 系统通知推送

## ⚠️ 常见问题

### 1. 端口被占用

**问题：** 启动时提示端口被占用

**解决：**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :8001

# 停止进程（替换 <PID>）
Stop-Process -Id <PID> -Force
```

### 2. 前端连接后端失败

**问题：** 前端请求超时或连接失败

**解决：**
1. 确认后端已启动：http://localhost:8001
2. 检查前端配置：`.env.development` 中的 `VITE_API_URL`
3. 重启前端服务

### 3. WebSocket 连接失败

**问题：** 浏览器控制台显示 WebSocket 连接失败

**解决：**
1. 确认使用 Daphne 启动（不是 Uvicorn）
2. 检查后端日志是否有错误
3. 确认 `websockets` 包已安装：`pip list | findstr websockets`

### 4. 数据库迁移错误

**问题：** 运行 migrate 时出错

**解决：**
```powershell
# 删除迁移文件（保留 __init__.py）
# 重新生成迁移
python manage.py makemigrations
python manage.py migrate
```

## 📚 相关文档

- [主文档](./CLAUDE.md) - 完整的项目文档
- [后端架构文档](./django-vue3-admin-master/backend/docs_architecture/) - 详细的架构说明
- [API 文档](http://localhost:8001/swagger/) - Swagger API 文档

## 🎯 下一步

1. 访问管理后台：http://localhost:9001
2. 使用默认账号登录
3. 探索系统功能：
   - 用户管理
   - 角色权限
   - 菜单管理
   - 部门管理
   - 消息中心

## 💡 开发建议

1. **代码规范**
   - 后端遵循 PEP 8
   - 前端使用 ESLint + Prettier

2. **Git 提交**
   - 使用语义化提交信息
   - 提交前运行代码检查

3. **测试**
   - 新功能添加单元测试
   - 重要功能添加集成测试

4. **文档**
   - 新增 API 添加注释
   - 复杂逻辑添加说明文档

## 🆘 获取帮助

- GitHub：https://github.com/jack571754/dvadmin

---

**最后更新：** 2026-02-03
**项目版本：** 3.2.0
