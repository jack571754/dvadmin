# DVAdmin - Django Vue3 Admin

> 基于 Django 5.2 + Vue 3.5 的企业级后台管理系统

[![Django](https://img.shields.io/badge/Django-5.2.0-green.svg)](https://www.djangoproject.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.27-blue.svg)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13.2-409EFF.svg)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **最新技术栈** - Django 5.2 LTS + Vue 3.5 + Element Plus 2.13
- 🔐 **完善的权限系统** - RBAC 模型，支持按钮级、字段级权限控制
- 📡 **WebSocket 支持** - 实时消息推送，在线状态同步
- 🎨 **现代化 UI** - 基于 Element Plus，响应式设计
- 📦 **开箱即用** - 完整的用户、角色、菜单、部门管理
- 🔌 **插件化架构** - 支持动态加载插件，易于扩展
- 📝 **API 文档** - 集成 Swagger，自动生成 API 文档
- 🌍 **国际化** - 支持多语言切换

## 🚀 快速开始

### 环境要求

- Python >= 3.11.0
- Node.js >= 16.0.0
- MySQL >= 8.0（可选）

### 启动项目

```powershell
# 1. 后端启动
cd django-vue3-admin-master/backend
powershell -ExecutionPolicy Bypass -File start_daphne.ps1

# 2. 前端启动
cd django-vue3-admin-master/web
npm install
npm run dev
```

### 访问地址

- 管理后台：http://localhost:9001
- 后端 API：http://localhost:8001
- API 文档：http://localhost:8001/swagger/

### 默认账号

- 用户名：`superadmin`
- 密码：`admin123456`

## 📚 文档

- [快速启动指南](./START.md) - 详细的启动步骤
- [完整文档](./CLAUDE.md) - 项目架构和开发指南
- [后端架构文档](./django-vue3-admin-master/backend/docs_architecture/) - 后端详细说明

## 🛠️ 技术栈

### 后端

- **框架**：Django 5.2.0 LTS
- **API**：Django REST Framework 3.16.0
- **认证**：JWT (djangorestframework-simplejwt 5.5.0)
- **WebSocket**：Channels 4.1.0 + Daphne 4.2.1
- **任务队列**：Celery + Redis
- **文档**：drf-yasg 1.21.7

### 前端

- **框架**：Vue 3.5.27
- **UI 库**：Element Plus 2.13.2
- **构建工具**：Vite 5.4.1
- **状态管理**：Pinia 2.3.1
- **路由**：Vue Router 4.6.4
- **HTTP 客户端**：Axios 1.13.4
- **语言**：TypeScript 4.9.4

## 📦 核心功能

### 系统管理

- ✅ 用户管理 - 用户的增删改查、密码重置
- ✅ 角色管理 - 角色权限分配、数据权限
- ✅ 菜单管理 - 菜单配置、按钮权限
- ✅ 部门管理 - 组织架构管理
- ✅ 字典管理 - 系统字典配置
- ✅ 操作日志 - 用户操作记录
- ✅ 登录日志 - 登录历史记录

### 消息中心

- ✅ 消息推送 - WebSocket 实时推送
- ✅ 消息管理 - 消息的发送和接收
- ✅ 未读提醒 - 实时未读消息提醒

### 工作流（插件）

- ✅ 流程定义 - 可视化流程设计
- ✅ 流程实例 - 流程的提交和审批
- ✅ 审批记录 - 审批历史追踪

## 🎯 项目结构

```
dvadmin/
├── django-vue3-admin-master/    # 主项目
│   ├── backend/                 # Django 后端
│   │   ├── application/         # 项目配置
│   │   ├── dvadmin/            # 核心业务模块
│   │   │   ├── system/         # 系统管理
│   │   │   ├── book/           # 图书管理（示例）
│   │   │   └── utils/          # 工具类
│   │   └── plugins/            # 插件目录
│   └── web/                    # Vue3 前端
│       └── src/
│           ├── api/            # API 接口
│           ├── components/     # 组件
│           ├── views/          # 页面
│           └── stores/         # 状态管理
├── blog-frontend/              # 博客前端（可选）
├── START.md                    # 启动指南
└── CLAUDE.md                   # 完整文档
```

## 🔧 配置说明

### 后端配置

编辑 `backend/conf/env.py`：

```python
# 数据库配置
DATABASE_ENGINE = "django.db.backends.sqlite3"
DATABASE_NAME = "db.sqlite3"

# Redis 配置
REDIS_HOST = "127.0.0.1"
REDIS_PASSWORD = ""
```

### 前端配置

编辑 `web/.env.development`：

```env
# API 地址
VITE_API_URL = 'http://127.0.0.1:8001'
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](./LICENSE)

## 🔗 相关链接

- 官方网站：https://www.django-vue-admin.com
- 在线演示：https://demo.dvadmin.com
- 文档中心：https://django-vue-admin.com
- 社区论坛：https://bbs.django-vue-admin.com
- GitHub：https://github.com/huge-dream/django-vue3-admin
- Gitee：https://gitee.com/huge-dream/django-vue3-admin

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 Star ⭐

---

**最后更新：** 2026-02-03
