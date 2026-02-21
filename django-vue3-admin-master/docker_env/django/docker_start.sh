#!/bin/bash
# DVAdmin 后端 Docker 启动脚本
# 支持 WSGI 和 ASGI 两种模式
#
# 环境变量：
#   DJANGO_SERVER_MODE: wsgi 或 asgi（默认：asgi）
#   DJANGO_WORKERS: Worker 数量（默认：4）

set -e

echo "=========================================="
echo "DVAdmin 后端启动中..."
echo "模式: ${DJANGO_SERVER_MODE:-asgi}"
echo "Worker数: ${DJANGO_WORKERS:-4}"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 等待数据库
echo "等待数据库连接..."
while ! nc -z ${DATABASE_HOST:-dvadmin3-mysql} ${DATABASE_PORT:-3306}; do
  sleep 1
done
echo "数据库已就绪！"

# 等待 Redis
echo "等待 Redis 连接..."
while ! nc -z ${REDIS_HOST:-dvadmin3-redis} 6379; do
  sleep 1
done
echo "Redis 已就绪！"

# 执行数据库迁移
echo "执行数据库迁移..."
python3 manage.py migrate --noinput

# 收集静态文件
echo "收集静态文件..."
python3 manage.py collectstatic --noinput

# 启动服务器
if [ "${DJANGO_SERVER_MODE}" = "wsgi" ]; then
    echo "启动 Gunicorn（WSGI 模式 - 不支持 WebSocket）..."
    exec gunicorn application.wsgi:application \
        --bind 0.0.0.0:9000 \
        --workers ${DJANGO_WORKERS:-4} \
        --threads 2 \
        --timeout 120 \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "启动 Uvicorn（ASGI 模式 - 支持 WebSocket）..."
    exec uvicorn application.asgi:application \
        --host 0.0.0.0 \
        --port 9000 \
        --workers ${DJANGO_WORKERS:-4} \
        --log-level info \
        --access-log
fi
