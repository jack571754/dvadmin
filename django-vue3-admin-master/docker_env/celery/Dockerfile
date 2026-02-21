FROM registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-backend:latest

WORKDIR /backend
COPY ./backend/ .
RUN awk 'BEGIN { cmd="cp -i ./conf/env.example.py   ./conf/env.py "; print "n" |cmd; }'

# 彻底清除所有代理设置并安装依赖
RUN unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy && \
    rm -f ~/.pip/pip.conf /etc/pip.conf 2>/dev/null || true && \
    python3 -m pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple/ -r requirements.txt
CMD ["celery", "-A", "application", "worker", "-B", "--loglevel=info"]

  