# DVAdmin 企业级权限管理系统开发技能

> 版本：v3.2.0
> 最后更新：2026-02-21
> 技术栈：Django 5.2.0 LTS + Vue 3.4.38 + TypeScript 4.9.4

---

## 项目概述

DVAdmin 是一个基于 RBAC（基于角色的访问控制）模型的企业级权限管理系统，权限粒度达到**列级别**（字段级显示权限）。采用前后端分离架构，包含管理后台和独立博客前端。

### 核心特性

- 列级别权限控制（字段级显示权限）
- 动态菜单权限系统
- 多种认证方式（JWT）
- 插件化架构
- WebSocket 实时消息
- Celery 异步任务
- 现代化主题系统（8 种预设主题）

---

## 项目结构

```
dvadmin/
├── django-vue3-admin-master/     # 主项目
│   ├── backend/                  # Django 后端
│   │   ├── application/          # Django 配置（settings/urls/asgi/wsgi）
│   │   ├── dvadmin/              # 核心业务模块
│   │   │   ├── system/           # 系统模块（用户/角色/菜单/权限）
│   │   │   ├── blog/             # 博客模块
│   │   │   ├── book/             # 图书模块
│   │   │   └── utils/            # 工具类（ViewSet/Model/Permission）
│   │   ├── plugins/              # 插件目录
│   │   │   └── dvadmin3_flow/    # 工作流审批插件
│   │   └── conf/                 # 环境配置
│   └── web/                      # Vue3 管理后台
│       └── src/
│           ├── api/              # API 接口定义
│           ├── components/       # 通用组件（auth/editor/fileSelector）
│           ├── layout/           # 布局组件
│           ├── views/            # 页面视图（system/plugins）
│           ├── stores/           # Pinia 状态管理
│           ├── router/           # 路由配置
│           ├── theme/            # 主题样式系统
│           └── utils/            # 工具函数
├── blog-frontend/                # 独立博客前端（纸间墨语设计）
└── .opencode/                    # OpenCode 配置
```

---

## 技术栈详情

### 后端 (Django)

| 依赖 | 版本 | 说明 |
|------|------|------|
| Django | 5.2.0 LTS | 核心框架 |
| djangorestframework | 3.16.0 | REST API |
| djangorestframework_simplejwt | 5.5.0 | JWT 认证 |
| drf-yasg | 1.21.7 | Swagger 文档 |
| channels | 4.1.0 | WebSocket |
| django-celery-beat | 2.8.1 | 定时任务 |
| django-celery-results | 2.5.1 | 任务结果存储 |

### 前端 (Vue3)

| 依赖 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.38 | 核心框架 |
| TypeScript | 4.9.4 | 类型系统 |
| Vite | 5.4.1 | 构建工具 |
| Element Plus | 2.8.0 | UI 组件库 |
| Pinia | 2.0.28 | 状态管理 |
| @fast-crud/fast-crud | 1.21.2 | 快速 CRUD |

---

## 开发命令

### 后端命令

```bash
cd django-vue3-admin-master/backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows: .\venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt
cp ./conf/env.example.py ./conf/env.py
python manage.py migrate
python manage.py init

# 启动（支持 WebSocket）
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload
```

### 前端命令

```bash
cd django-vue3-admin-master/web
yarn install
yarn run dev  # http://localhost:8080
```

### 博客前端

```bash
cd blog-frontend
yarn install
yarn run dev  # http://localhost:5173
```

---

## 代码风格

### Python (后端)

- 模型继承 `CoreModel`
- 视图集继承 `CustomModelViewSet`
- 字段必须有 `verbose_name` 和 `help_text`
- 表前缀使用 `table_prefix`

### TypeScript/Vue3 (前端)

- 使用 `<script setup lang="ts">`
- 权限控制使用 `<auth>` 组件或 `v-auth` 指令
- 使用 CSS 变量，避免硬编码值
- API 使用 `@/utils/service` 中的 `request`

---

## 权限控制

### 前端

```vue
<auth value="system:user:add">
  <el-button>添加</el-button>
</auth>

<el-button v-auth="'system:user:edit'">编辑</el-button>
```

### 后端

```python
class ArticleViewSet(CustomModelViewSet):
    permission_classes = [CustomPermission]
    filter_backends = [DataLevelPermissionMargeFilter]
```

---

## 重要配置

- 后端端口：**9000**（Windows 保留 8000）
- 前端端口：**8080**
- 博客前端：**5173**
- WebSocket 需要 uvicorn 启动
- 默认账号：`superadmin` / `admin123456`

---

## 相关资源

- 官方网站：https://www.django-vue-admin.com
- Gitee：https://gitee.com/huge-dream/django-vue3-admin
