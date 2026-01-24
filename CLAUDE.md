# DVAdmin 项目文档

> 最后更新：2026-01-24
> 项目路径：E:\project\dvadmin

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-24 | 初始化项目根文档，整合所有模块 | Claude AI |

---

## 项目概述

DVAdmin 是一个基于 RBAC（基于角色的访问控制）模型的企业级权限管理系统开发框架，采用前后端分离架构。本项目包含主项目（django-vue3-admin-master）和独立的审批流程模块（dvadmin_approval）。

**核心特性：**
- 列级别的权限控制（字段级显示权限）
- 前后端完全分离
- 支持多种认证方式
- 动态菜单权限系统
- 插件化架构支持
- 工作流审批引擎

---

## 项目结构

```
E:\project\dvadmin\
├── django-vue3-admin-master/     # 主项目（DVAdmin 框架）
│   ├── CLAUDE.md                 # 主项目文档
│   ├── backend/                  # Django 后端
│   ├── web/                      # Vue3 前端
│   └── docker_env/               # Docker 配置
│
└── dvadmin_approval/             # 审批流程模块（独立）
    └── CLAUDE.md                 # 审批模块文档
```

---

## 快速导航

### 项目文档

| 文档 | 描述 |
|------|------|
| [主项目文档](./django-vue3-admin-master/CLAUDE.md) | django-vue3-admin-master 完整文档 |
| [审批流程文档](./dvadmin_approval/CLAUDE.md) | dvadmin_approval 模块文档 |

### 核心模块

| 模块 | 路径 | 说明 |
|------|------|------|
| Backend | [backend/](./django-vue3-admin-master/backend/CLAUDE.md) | Django 后端服务 |
| Web | [web/](./django-vue3-admin-master/web/CLAUDE.md) | Vue3 前端应用 |
| System | [backend/dvadmin/system/](./django-vue3-admin-master/backend/dvadmin/system/CLAUDE.md) | 系统管理模块 |
| Utils | [backend/dvadmin/utils/](./django-vue3-admin-master/backend/dvadmin/utils/CLAUDE.md) | 工具类库 |
| Approval | [dvadmin_approval/](./dvadmin_approval/CLAUDE.md) | 审批流程模块 |

---

## 项目统计

### 代码量统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 后端 Python 文件 | 81 个 | django-vue3-admin-master/backend 目录 |
| 前端 Vue 文件 | 99 个 | django-vue3-admin-master/web/src 目录 |
| 前端 TypeScript 文件 | 113 个 | django-vue3-admin-master/web/src 目录 |
| 审批流程模块 | 19 个 | dvadmin_approval 目录 |
| **总计** | **312+** | 核心业务代码文件 |

### 模块覆盖

- ✅ 主项目根文档
- ✅ Backend 模块文档
- ✅ Web 前端文档
- ✅ System 系统模块文档
- ✅ Utils 工具模块文档
- ✅ Dvadmin 核心包文档
- ✅ Approval 审批流程文档

---

## 技术栈

### 后端技术

- **框架**：Django 4.2.14
- **API**：Django REST Framework 3.15.2
- **认证**：djangorestframework_simplejwt 5.4.0
- **文档**：drf-yasg 1.21.7
- **WebSocket**：channels 4.1.0
- **异步任务**：dvadmin3-celery 3.1.6

### 前端技术

- **框架**：Vue 3.4.38
- **语言**：TypeScript 4.9.4
- **构建**：Vite 5.4.1
- **UI 库**：Element Plus 2.8.0
- **状态管理**：Pinia 2.0.28
- **CRUD**：@fast-crud/fast-crud 1.21.2

### 数据库

- 默认：SQLite3
- 推荐：MySQL 8.0+
- 可选：PostgreSQL

---

## 环境要求

- Python >= 3.11.0（最低 3.9+）
- Node.js >= 16.0.0
- MySQL >= 8.0（可选，默认 SQLite3）
- Redis（可选）

---

## 快速开始

### 1. 后端启动

```bash
cd django-vue3-admin-master/backend

# 配置环境
cp ./conf/env.example.py ./conf/env.py

# 安装依赖
pip3 install -r requirements.txt

# 数据库迁移
python3 manage.py makemigrations
python3 manage.py migrate

# 初始化数据
python3 manage.py init

# 启动服务（支持 WebSocket）
# 注意：Windows 系统保留端口 7911-8010，8000 端口不可用
# 推荐使用 9000 端口，如遇端口冲突请更换其他端口
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload
```

### 2. 前端启动

```bash
cd django-vue3-admin-master/web

# 安装依赖
yarn install --registry=https://registry.npm.taobao.org

# 启动开发服务器
yarn run dev
# 访问 http://localhost:8080
```

### 3. 审批模块安装

在 `backend/application/settings.py` 中添加：

```python
INSTALLED_APPS = [
    # ...
    "dvadmin_approval",
]
```

在 `application/urls.py` 中包含路由：

```python
urlpatterns += [
    path('api/workflow/', include('dvadmin_approval.urls')),
]
```

---

## 默认账号

- 用户名：`superadmin`
- 密码：`admin123456`

---

## 核心功能

### 系统管理

1. 菜单管理：配置系统菜单、操作权限、按钮权限
2. 部门管理：配置系统组织结构
3. 角色管理：角色菜单权限分配、数据权限分配
4. 用户管理：系统用户配置
5. 权限控制：按钮权限、字段列权限、数据权限

### 审批流程

1. 流程定义：设计审批流程
2. 流程实例：提交和管理审批
3. 审批记录：跟踪审批历史
4. 动态表单：支持灵活的表单配置

---

## API 文档

- Swagger UI：http://localhost:9000/
- ReDoc：http://localhost:9000/redoc/

---

## 相关资源

- 官方网站：https://www.django-vue-admin.com
- 在线演示：https://demo.dvadmin.com
- 文档中心：https://django-vue-admin.com
- 插件市场：https://bbs.django-vue-admin.com/plugMarket.html
- 社区论坛：https://bbs.django-vue-admin.com
- Gitee：https://gitee.com/huge-dream/django-vue3-admin
- GitHub：https://github.com/huge-dream/django-vue3-admin

---

## 面包屑导航

```
[根目录] (./)
  └─ [django-vue3-admin-master] (./django-vue3-admin-master/)
       ├─ [backend] (./django-vue3-admin-master/backend/)
       │    ├─ [application] (./django-vue3-admin-master/backend/application/)
       │    └─ [dvadmin] (./django-vue3-admin-master/backend/dvadmin/)
       │         ├─ [system] (./django-vue3-admin-master/backend/dvadmin/system/)
       │         └─ [utils] (./django-vue3-admin-master/backend/dvadmin/utils/)
       ├─ [web] (./django-vue3-admin-master/web/)
       └─ [docker_env] (./django-vue3-admin-master/docker_env/)
  └─ [dvadmin_approval] (./dvadmin_approval/)
```

---

## 开发指南

### 新增业务模块

**后端：**

1. 在 `backend/dvadmin/` 下创建新应用目录
2. 创建 `models.py` 定义数据模型（继承 `CoreModel`）
3. 创建 `views.py` 定义视图集（继承 `CustomModelViewSet`）
4. 创建 `serializers.py` 定义序列化器
5. 创建 `urls.py` 定义路由
6. 在 `application/settings.py` 的 `INSTALLED_APPS` 中注册

**前端：**

1. 在 `web/src/views/` 下创建页面组件
2. 在 `web/src/api/` 下创建 API 接口文件
3. 配置路由（`web/src/router/`）
4. 使用 `fast-crud` 快速构建 CRUD 页面

### 权限控制

**后端：**

- 视图集继承 `CustomModelViewSet` 自动获得权限控制
- 使用 `@permission_classes([CustomPermission])` 装饰器
- 数据权限通过 `DataLevelPermissionMargeFilter` 实现

**前端：**

- 使用 `<auth>` 组件控制按钮显示
- 使用 `v-auth` 指令控制元素显示
- 使用 `hasPermi()` 函数判断权限

---

## 待办事项

- [ ] 添加更多前端子模块文档
- [ ] 完善 API 接口文档
- [ ] 添加单元测试文档
- [ ] 补充部署指南
- [ ] 添加性能优化指南

---

## 文档维护

本文档由 Claude AI 自动生成和维护，如有问题请联系项目维护者。

**文档版本：** v1.0.0
**生成时间：** 2026-01-24
**文档路径：** E:\project\dvadmin\CLAUDE.md
