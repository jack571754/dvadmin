#!/bin/bash
# DVAdmin Docker 快速启动脚本
# 
# 使用方法：
#   ./docker-quick-start.sh [命令]
#
# 命令说明：
#   start       - 启动所有服务
#   stop        - 停止所有服务
#   restart     - 重启所有服务
#   build       - 构建所有镜像
#   logs        - 查看日志
#   init        - 初始化数据库
#   backup      - 备份数据库
#   status      - 查看服务状态
#   clean       - 清理容器和卷

set -e

# 输出颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 配置
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD="docker-compose.prod.yml"
ENV_FILE=".env"

# 打印横幅
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║         DVAdmin Docker 管理器            ║"
    echo "║         版本 2.0 - 2026-02-21            ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查环境配置
check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}环境配置文件不存在，正在从模板创建...${NC}"
        if [ -f ".env.dev.example" ]; then
            cp .env.dev.example .env
            echo -e "${GREEN}已从 .env.dev.example 创建 .env${NC}"
        else
            echo -e "${RED}错误：找不到 .env.dev.example${NC}"
            exit 1
        fi
    fi
}

# 启动服务
start_services() {
    echo -e "${GREEN}正在启动 DVAdmin 服务...${NC}"
    check_env
    
    if [ "$1" = "prod" ]; then
        echo -e "${YELLOW}以生产模式启动...${NC}"
        docker-compose -f $COMPOSE_PROD up -d
    else
        echo -e "${YELLOW}以开发模式启动...${NC}"
        docker-compose -f $COMPOSE_FILE up -d
    fi
    
    echo -e "${GREEN}服务已启动！${NC}"
    echo -e "${BLUE}访问地址：${NC}"
    echo -e "  管理后台:  ${GREEN}http://localhost:8080${NC}"
    echo -e "  博客前端:  ${GREEN}http://localhost:5173${NC}"
    echo -e "  API接口:   ${GREEN}http://localhost:9000/api${NC}"
    echo -e "  Swagger文档: ${GREEN}http://localhost:9000/swagger${NC}"
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}正在停止 DVAdmin 服务...${NC}"
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_PROD down 2>/dev/null || true
    echo -e "${GREEN}服务已停止。${NC}"
}

# 重启服务
restart_services() {
    stop_services
    start_services "$1"
}

# 构建镜像
build_images() {
    echo -e "${GREEN}正在构建 Docker 镜像...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}构建完成。${NC}"
}

# 查看日志
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose -f $COMPOSE_FILE logs -f
    else
        docker-compose -f $COMPOSE_FILE logs -f $service
    fi
}

# 初始化数据库
init_database() {
    echo -e "${GREEN}正在初始化数据库...${NC}"
    
    # 等待 MySQL 就绪
    echo -e "${YELLOW}等待 MySQL 启动...${NC}"
    sleep 10
    
    # 执行迁移和初始化命令
    docker exec -it dvadmin3-django bash -c "
        python3 manage.py migrate --noinput && \
        python3 manage.py init && \
        python3 manage.py init_area
    "
    
    echo -e "${GREEN}数据库初始化完成。${NC}"
    echo -e "${BLUE}默认管理员账号：${NC}"
    echo -e "  用户名: ${GREEN}superadmin${NC}"
    echo -e "  密码: ${GREEN}admin123456${NC}"
}

# 备份数据库
backup_database() {
    local backup_dir="./backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${backup_dir}/dvadmin_${timestamp}.sql"
    
    mkdir -p $backup_dir
    
    echo -e "${GREEN}正在备份数据库到 ${backup_file}...${NC}"
    
    docker exec dvadmin3-mysql mysqldump \
        -u root \
        -p${MYSQL_PASSWORD:-DVADMIN3} \
        --single-transaction \
        --routines \
        --triggers \
        django-vue3-admin > $backup_file
    
    # 压缩备份文件
    gzip $backup_file
    
    echo -e "${GREEN}备份完成：${backup_file}.gz${NC}"
}

# 查看状态
show_status() {
    echo -e "${GREEN}DVAdmin 服务状态：${NC}"
    docker-compose -f $COMPOSE_FILE ps
}

# 清理
clean_up() {
    echo -e "${RED}警告：此操作将删除所有容器、卷和网络。${NC}"
    read -p "确定要继续吗？(y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo -e "${YELLOW}正在清理...${NC}"
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker-compose -f $COMPOSE_PROD down -v --remove-orphans 2>/dev/null || true
        docker system prune -f
        echo -e "${GREEN}清理完成。${NC}"
    else
        echo -e "${YELLOW}已取消。${NC}"
    fi
}

# 主脚本
print_banner

case "$1" in
    start)
        start_services "$2"
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services "$2"
        ;;
    build)
        build_images
        ;;
    logs)
        show_logs "$2"
        ;;
    init)
        init_database
        ;;
    backup)
        backup_database
        ;;
    status)
        show_status
        ;;
    clean)
        clean_up
        ;;
    *)
        echo "使用方法: $0 {start|stop|restart|build|logs|init|backup|status|clean}"
        echo ""
        echo "命令说明："
        echo "  start [prod]  - 启动服务（开发或生产模式）"
        echo "  stop          - 停止所有服务"
        echo "  restart [prod]- 重启所有服务"
        echo "  build         - 构建所有 Docker 镜像"
        echo "  logs [service]- 查看日志（可选：指定服务名）"
        echo "  init          - 初始化数据库"
        echo "  backup        - 备份数据库"
        echo "  status        - 查看服务状态"
        echo "  clean         - 删除所有容器和卷"
        exit 1
        ;;
esac
