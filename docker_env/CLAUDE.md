# docker_env · 部署编排

> 导航：[仓库根](../CLAUDE.md) › **docker_env 部署**
>
> 最后更新：2026-10-25 ｜ 状态：**仅按文件内容整理，未在本机启动验证**

## 这一层负责什么

`docker-compose.yml` 用到的全部镜像定义、配置文件与初始化脚本。上游 README 见 [README.md](./README.md)。

## 五个服务

编排入口：[../docker-compose.yml](../docker-compose.yml)，固定子网 `177.10.0.0/16`。

| 服务 | 镜像/构建 | 端口 | IP | 说明 |
|------|-----------|------|----|------|
| `dvadmin3-web` | `docker_env/web/Dockerfile` | `8080:8080` | 177.10.0.11 | nginx 托管前端构建产物 |
| `dvadmin3-django` | `docker_env/django/Dockerfile` | `8000:8000` | 177.10.0.12 | 挂载 `./backend`，`CMD docker_start.sh` |
| `dvadmin3-mysql` | `mysql:8.0` | `3306:3306` | 177.10.0.13 | 库名 `django-vue3-admin`，密码来自 `${MYSQL_PASSWORD}` |
| `dvadmin3-celery` | `docker_env/celery/Dockerfile` | 无 | 177.10.0.14 | `celery -A application worker -B` |
| `dvadmin3-redis` | `redis:6.2.6-alpine` | `6379:6379` | 177.10.0.15 | 密码来自 `${REDIS_PASSWORD}` |

**密钥只走环境变量**：`${MYSQL_PASSWORD}`、`${REDIS_PASSWORD}`。不要在 `docker-compose.yml`、
Dockerfile 或任何跟踪文件里写明文口令。

## 构建链

存在两套 Dockerfile：

- `DockerfileBuild` —— 打**基础镜像**（预装依赖），推到私有仓库；
- `Dockerfile` —— 在基础镜像上 `COPY` 源码、装依赖、构建，产出实际镜像。

基础镜像地址：`registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/*`（阿里云私有仓库，需要登录）。

后端容器启动时会把 `conf/env.example.py` 复制成 `conf/env.py`，再用 `sed` 把
`DATABASE_HOST` / `REDIS_HOST` 改成 `177.10.0.1`（= 网段网关，不是 compose 里设的
`DATABASE_HOST=dvadmin3-mysql` 环境变量）。**别被 compose 的 environment 误导**，
容器里真正生效的是 `conf/env.py` 里的字面值。

## 与当前工程状态的不一致（真实现状，不是建议）

以下是读文件确认的，未修改：

1. **前端镜像用 yarn + Node 18，与项目约束冲突。** `docker_env/web/Dockerfile` 跑
   `yarn install`，基础镜像是 `18.20-alpine`；但 `web/package.json` 要求 Node `>=24 <25`
   且 `preinstall` 执行 `only-allow pnpm`——直接构建会失败。
2. **`DockerfileBuild` 用 `node:16.19-alpine`**，与上面 `Dockerfile` 的 `18.20-alpine` 不一致。
3. **后端基础镜像用 Python 3.10**（`DockerfileBuild`），项目要求 `>=3.11`。
4. **compose 的挂载源不存在**：`./backend/media`、`./logs/log`、`docker_env/mysql/data`、
   `docker_env/redis/data`、`docker_env/mysql/logs` 在本机都没有；`backend/logs/` 存在但
   compose 挂的是根级 `logs/log`。首次 `docker compose up` 会由 Docker 自动创建空目录。
5. **compose 里的 `version: "3"`** 在新版 Compose 中已废弃，会打印告警。

要真正跑起来，先按第 1–3 条对齐 Node/pnpm 与 Python 版本。**本机未执行过容器构建**，
以上均未经验证。

## nginx

`nginx/my.conf` 是站点配置（前端静态资源 + `/api` 反代）；`nginx/my-80.conf` 为 80 端口变体。
两者都通过 compose 的 volumes 挂进 `dvadmin3-web`。

## 验证（如果要在本机试）

```powershell
# 只校验编排语法，不启动
docker compose config

# 确认环境变量已注入（不要在终端历史里写明文密码）
docker compose config | Select-String "MYSQL_PASSWORD"
```
