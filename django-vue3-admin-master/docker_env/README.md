# DVAdmin Docker 部署文档

> 更新时间：2026-02-21
> 版本：2.1
> 支持平台：Windows / Linux / macOS

---

## 目录结构

```
docker_env/
├── blog/                    # 博客前端 Docker 配置
│   ├── Dockerfile           # 生产环境镜像
│   ├── Dockerfile.dev       # 开发环境镜像
│   ├── nginx.conf           # Nginx 配置
│   └── .dockerignore        # 构建忽略文件
├── celery/                  # Celery Worker 配置
│   └── Dockerfile
├── django/                  # Django 后端配置
│   ├── Dockerfile
│   ├── DockerfileBuild      # 基础镜像构建
│   └── docker_start.sh      # 启动脚本
├── mysql/                   # MySQL 配置
│   ├── conf.d/              # MySQL 配置文件
│   ├── init/                # 初始化 SQL
│   └── data/                # 数据目录
├── nginx/                   # Nginx 配置
│   ├── my.conf              # 管理后台配置
│   └── my-80.conf           # 80端口配置
├── redis/                   # Redis 配置
│   ├── redis.conf           # Redis 配置
│   └── data/                # 数据目录
├── scripts/                 # 启动脚本
│   ├── docker-quick-start.bat  # Windows 脚本
│   └── docker-quick-start.sh   # Linux/Mac 脚本
├── web/                     # 管理前端配置
│   ├── Dockerfile
│   └── DockerfileBuild
├── .dockerignore            # 根构建忽略文件
├── .env.dev.example         # 开发环境配置模板
├── .env.prod.example        # 生产环境配置模板
├── docker-compose.yml       # 开发环境编排
└── docker-compose.prod.yml  # 生产环境编排
```

---

## 快速开始

### Windows 用户

```cmd
REM 方法1：在项目根目录执行
docker-quick-start.bat start

REM 方法2：进入 docker_env 目录执行
cd docker_env\scripts
docker-quick-start.bat start
```

### Linux/Mac 用户

```bash
# 方法1：在项目根目录执行
./docker-quick-start.sh start

# 方法2：进入 docker_env 目录执行
cd docker_env/scripts
./docker-quick-start.sh start
```

### 初始化数据库（首次部署）

```bash
# Windows
docker-quick-start.bat init

# Linux/Mac
./docker-quick-start.sh init
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:8080 |
| 博客前端 | http://localhost:5173 |
| API 文档 | http://localhost:9000/swagger |
| API 接口 | http://localhost:9000/api |

**默认账号**：`superadmin` / `admin123456`

---

## Windows 环境注意事项

### 1. 安装 Docker Desktop

1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 启用 WSL 2 后端（推荐）
3. 重启电脑

### 2. 文件共享配置

在 Docker Desktop 设置中，确保以下目录已添加到 File Sharing：
- `D:\project\dvadmin`

### 3. 换行符问题

如果脚本执行出错，可能是换行符问题：

```powershell
# 使用 PowerShell 转换换行符
(Get-Content docker_env\scripts\docker-quick-start.sh -Raw) -replace "`r`n", "`n" | Set-Content docker_env\scripts\docker-quick-start.sh -NoNewline
```

### 4. 端口冲突

Windows 保留了部分端口（如 8000），本项目使用：
- **8080**：管理后台
- **5173**：博客前端
- **9000**：Django API
- **3306**：MySQL
- **6379**：Redis

如遇端口冲突，修改 `docker-compose.yml` 中的端口映射。

### 5. PowerShell 执行策略

```powershell
# 允许执行脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 手动部署

### 开发环境

```bash
# 进入 docker_env 目录
cd docker_env

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境

```bash
# 1. 配置环境变量
cd docker_env
cp .env.prod.example .env.prod

# 2. 编辑 .env.prod，设置安全密码
# MYSQL_PASSWORD=your_secure_password
# REDIS_PASSWORD=your_secure_password

# 3. 启动服务
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 4. 初始化数据库
docker exec -it dvadmin3-django python manage.py migrate
docker exec -it dvadmin3-django python manage.py init -y
```

---

## 服务架构

```
┌─────────────────┐    ┌─────────────────┐
│  Admin Frontend │    │  Blog Frontend  │
│    (Port 8080)  │    │   (Port 5173)   │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    │
         ┌────────▼────────┐
         │   Django API    │
         │   (Port 9000)   │
         │   ASGI + WS     │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌─────▼─────┐  ┌────▼────┐
│ MySQL │   │   Redis   │  │ Celery  │
│ :3306 │   │   :6379   │  │ Worker  │
└───────┘   └───────────┘  └─────────┘
```

---

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启单个服务
docker-compose restart dvadmin3-django

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f dvadmin3-django
```

### 进入容器

```bash
# Django 容器
docker exec -it dvadmin3-django bash

# MySQL 容器
docker exec -it dvadmin3-mysql bash

# Redis 容器
docker exec -it dvadmin3-redis sh
```

### 数据库操作

```bash
# 执行迁移
docker exec -it dvadmin3-django python manage.py migrate

# 创建管理员
docker exec -it dvadmin3-django python manage.py createsuperuser

# 收集静态文件
docker exec -it dvadmin3-django python manage.py collectstatic
```

### 备份恢复

```bash
# 备份数据库
docker exec dvadmin3-mysql mysqldump -u root -pDVADMIN3 django-vue3-admin > backup.sql

# 恢复数据库
docker exec -i dvadmin3-mysql mysql -u root -pDVADMIN3 django-vue3-admin < backup.sql
```

---

## 故障排查

### 1. 容器无法启动

```bash
# 查看容器日志
docker-compose logs dvadmin3-django

# 检查容器状态
docker-compose ps

# 重新构建
docker-compose build --no-cache dvadmin3-django
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 是否就绪
docker exec dvadmin3-mysql mysqladmin ping -h localhost

# 查看 MySQL 日志
docker-compose logs dvadmin3-mysql
```

### 3. WebSocket 连接失败

确保后端使用 ASGI 模式：
- 检查环境变量：`DJANGO_SERVER_MODE=asgi`
- 使用正确的 URL：`ws://localhost:9000/ws/<token>/`

### 4. 权限问题 (Linux/Mac)

```bash
# 修复文件权限
chmod -R 755 docker_env/scripts/
chmod +x docker_env/scripts/*.sh
```

### 5. Windows 路径问题

确保 docker-compose.yml 中的路径使用 `/` 或 `./`，而不是 `\`。

---

## 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 备份数据库
docker exec dvadmin3-mysql mysqldump -u root -pDVADMIN3 django-vue3-admin > backup_$(date +%Y%m%d).sql

# 3. 重新构建并启动
docker-compose build --no-cache
docker-compose up -d

# 4. 运行迁移
docker exec -it dvadmin3-django python manage.py migrate
```

---

## 安全建议

1. **修改默认密码**：更改 MySQL、Redis、Django SECRET_KEY
2. **端口暴露**：生产环境仅暴露必要端口
3. **HTTPS**：配置 SSL 证书
4. **定期备份**：设置自动备份任务
5. **日志监控**：配置日志收集和告警

---

## 相关资源

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [DVAdmin 官方文档](https://django-vue-admin.com)
