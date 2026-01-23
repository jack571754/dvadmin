# WebSocket 部署修复 - 执行计划

## 任务概述

修复 Django-Vue3-Admin 的 WebSocket 部署问题，使消息中心实时推送功能正常工作。

## 问题诊断

### 根本原因
- 使用 `python manage.py runserver` 启动（WSGI 服务器）
- WSGI 不支持 WebSocket 协议
- WebSocket 连接返回 404 错误

### 技术栈
- Django 4.2.14
- Django Channels 4.1.0
- Uvicorn 0.30.3（已安装）

## 执行步骤

### 1. 停止 WSGI 服务器 ✅
终止 `python manage.py runserver` 进程

### 2. 创建启动脚本 ✅

**开发环境脚本：**
- `backend/start_dev_asgi.bat` (Windows)
- `backend/start_dev_asgi.sh` (Linux/Mac)

**生产环境脚本：**
- `backend/start_prod_asgi.bat`

### 3. 启动 ASGI 服务器 ✅
```bash
uvicorn application.asgi:application --host 0.0.0.0 --port 8000 --reload
```

### 4. 验证 WebSocket 连接
- 前端登录系统
- 检查 WebSocket 状态（应为"已连接"）
- 后端日志应显示 101 Switching Protocols

### 5. 更新文档 ✅
- 更新 `backend/CLAUDE.md`
- 添加 WebSocket 相关说明
- 添加常见问题解决方案

## 文件变更清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `backend/start_dev_asgi.bat` | ✅ 新建 | Windows 开发环境启动脚本 |
| `backend/start_dev_asgi.sh` | ✅ 新建 | Linux/Mac 开发环境启动脚本 |
| `backend/start_prod_asgi.bat` | ✅ 新建 | Windows 生产环境启动脚本 |
| `backend/CLAUDE.md` | ✅ 修改 | 添加 WebSocket 和 ASGI 说明 |

## 验证标准

- [x] Uvicorn ASGI 服务器成功启动
- [x] 服务器监听 0.0.0.0:8000
- [ ] WebSocket 连接返回 101（需前端验证）
- [ ] 消息中心功能正常（需前端验证）

## 后续建议

1. **生产环境**：配置 Redis 作为 CHANNEL_LAYERS 后端
2. **反向代理**：Nginx 配置 WebSocket 转发
3. **监控**：添加 WebSocket 连接监控

## 执行时间

- 开始时间：2026-01-23 15:35
- 完成时间：2026-01-23 15:40
- 执行者：Claude AI

---

**状态：已完成（等待用户验证）**
