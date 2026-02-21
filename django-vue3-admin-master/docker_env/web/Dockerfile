# 第一阶段 - 构建
FROM registry.cn-zhangjiakou.aliyuncs.com/dvadmin-pro/dvadmin3-base-web:18.20-alpine
WORKDIR /web/
COPY web/. .

# 清除所有代理设置并安装依赖
RUN unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy && \
    yarn config delete proxy 2>/dev/null || true && \
    yarn config delete https-proxy 2>/dev/null || true && \
    yarn install --registry=https://registry.npmmirror.com --network-timeout 600000 --ignore-engines

# 使用 ESM 模式构建
ENV NODE_OPTIONS="--experimental-vm-modules --no-warnings"
RUN yarn build

# 第二阶段 - 使用本地 nginx:alpine 镜像
FROM nginx:alpine
COPY ./docker_env/nginx/my.conf /etc/nginx/conf.d/my.conf
COPY --from=0 /web/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
