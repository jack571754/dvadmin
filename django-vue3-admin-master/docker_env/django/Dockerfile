# DVAdmin 后端 Dockerfile
# Django 5.2.0 LTS 支持 ASGI 和 WebSocket

FROM registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-backend:latest

LABEL maintainer="DVAdmin Team"
LABEL version="2.0"
LABEL description="Django 后端，支持 ASGI WebSocket"

WORKDIR /backend

# 复制应用代码
COPY ./backend/ .

# 配置环境
RUN ls ./conf/
RUN awk 'BEGIN { cmd="cp -i ./conf/env.example.py ./conf/env.py "; print "n" |cmd; }'

# 更新数据库和 Redis 主机地址为 Docker 网络
RUN sed -i "s|DATABASE_HOST = '127.0.0.1'|DATABASE_HOST = 'dvadmin3-mysql'|g" ./conf/env.py
RUN sed -i "s|REDIS_HOST = '127.0.0.1'|REDIS_HOST = 'dvadmin3-redis'|g" ./conf/env.py

# 彻底清除所有代理设置并安装依赖
RUN unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy && \
    rm -f ~/.pip/pip.conf /etc/pip.conf 2>/dev/null || true && \
    python3 -m pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple/ -r requirements.txt

# 创建必要的目录
RUN mkdir -p /backend/logs /backend/media

# 暴露端口（ASGI 使用 9000）
EXPOSE 9000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9000/healthz/ || exit 1

# 启动脚本 - 支持 WSGI 和 ASGI
COPY docker_env/django/docker_start.sh /backend/docker_start.sh
RUN chmod +x /backend/docker_start.sh

# 使用 uvicorn 启动 ASGI 服务器（支持 WebSocket）
CMD ["sh", "/backend/docker_start.sh"]
