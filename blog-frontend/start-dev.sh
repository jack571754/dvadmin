#!/bin/bash

echo "🔧 Blog Frontend 开发环境快速设置"
echo "=================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

echo ""
echo "🚀 启动开发服务器..."
echo ""
echo "📝 注意事项："
echo "1. 请确保后端服务运行在 http://localhost:10025"
echo "2. 前端服务将运行在 http://localhost:5173"
echo "3. API 代理：/api -> http://localhost:10025"
echo ""
echo "如果后端未启动，前端会显示连接状态页面"
echo ""

# 启动开发服务器
npm run dev