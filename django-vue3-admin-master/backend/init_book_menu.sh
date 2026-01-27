#!/bin/bash
# ====================================
# 图书管理菜单初始化脚本
# ====================================

echo ""
echo "===================================="
echo " 图书管理菜单初始化工具"
echo "===================================="
echo ""

cd "$(dirname "$0")"

echo "正在检查 Python 环境..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python，请先安装 Python 3.9+"
    exit 1
fi

echo ""
echo "正在初始化图书管理菜单..."
echo ""

python3 manage.py init_book_menu

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================="
    echo " 菜单初始化完成！"
    echo "===================================="
    echo ""
    echo "请刷新前端页面查看"图书管理"菜单"
    echo ""
else
    echo ""
    echo "[失败] 菜单初始化失败"
    exit 1
fi
