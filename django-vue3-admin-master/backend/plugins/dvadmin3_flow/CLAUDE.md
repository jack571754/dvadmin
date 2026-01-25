[根目录](../CLAUDE.md) > **dvadmin_approval**

---

# Dvadmin Approval 审批流程模块

> 最后更新：2026-01-24

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-24 | 初始化审批流程模块文档 | Claude AI |

---

## 模块职责

审批流程管理模块，提供工作流引擎、流程定义、流程实例、审批节点等功能。支持动态表单和数据库表两种模式。

---

## 入口与启动

### Django App 配置

- **App 配置**：`apps.py`
- **路由注册**：`urls.py`（注册到主路由，需在 `application/settings.py` 中添加）

### 安装配置

在 `backend/application/settings.py` 的 `INSTALLED_APPS` 中添加：

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

## 对外接口

### ViewSet 列表

| ViewSet | 路径 | 功能 |
|---------|------|------|
| `FlowInfoViewSet` | `/api/workflow/flow_info/` | 流程定义 CRUD |
| `FlowDataViewSet` | `/api/workflow/flow_data/` | 流程实例数据 CRUD |
| `AppFlowInfoViewSet` | `/api/workflow/app_flow_info/` | 移动端流程接口 |
| `AppFlowDataViewSet` | `/api/workflow/app_flow_data/` | 移动端流程数据接口 |

### 页面路由

| 路径 | 功能 |
|------|------|
| `/api/workflow/flow_form_page/` | 流程表单页面 |
| `/api/workflow/flow_list_page/` | 流程列表页面 |
| `/api/workflow/flow_data_page/` | 流程数据页面 |
| `/api/workflow/flow_data_detail_page/` | 流程详情页面 |

---

## 关键依赖与配置

### 依赖模块

- Django Core
- dvadmin.utils（基础模型和工具类）
- django.contrib.contenttypes（内容类型框架）

### 配置项

在 `settings.py` 中：

```python
# 审批流程配置
from dvadmin_approval.settings import *
```

---

## 数据模型

### 核心模型

| 模型 | 表名 | 说明 |
|------|------|------|
| `FlowInfo` | `workflow_flow_info` | 流程定义 |
| `FlowNode` | `workflow_flow_node` | 流程节点 |
| `FlowLine` | `workflow_flow_line` | 流程连线 |
| `FlowData` | `workflow_flow_data` | 流程实例数据 |
| `FlowRecord` | `workflow_flow_record` | 审批记录 |

### 模型关系

```
FlowInfo (流程定义)
  ├── OneToMany → FlowNode (节点)
  │     └── OneToMany → FlowLine (连线)
  └── OneToMany → FlowData (实例)
        └── OneToMany → FlowRecord (审批记录)
```

### 枚举类型

**审核状态 (AUDIT_STATUS)：**
- `0`: 进行中
- `1`: 审核通过
- `2`: 审核驳回
- `3`: 审核撤销

**流程类型 (FLOW_TYPE)：**
- `0`: 数据库表
- `1`: 动态表单

**流程状态：**
- `0`: 待发布
- `1`: 正常
- `2`: 下架

**节点类型：**
- `Start`: 开始节点
- `Approval`: 审批中
- `Cc`: 抄送
- `End`: 结束节点

---

## 视图层 (views/)

### 目录结构

```
views/
├── __init__.py
├── flow_info.py      # 流程定义管理
└── flow_data.py      # 流程数据管理

app_views/            # 移动端视图
├── __init__.py
├── flow_info.py
└── flow_data.py
```

---

## 基础模型 (base_model.py)

提供审批流程的基础模型类和工具函数。

---

## 装饰器 (decorator.py)

提供审批流程相关的装饰器。

---

## 初始化数据 (fixtures/)

| 文件 | 说明 |
|------|------|
| `initialize.py` | 初始化入口 |

---

## 模板 (templates/)

审批流程相关页面模板。

---

## 静态文件 (static/)

审批流程相关静态资源。

---

## 数据库迁移

### 已有迁移

| 迁移文件 | 说明 |
|---------|------|
| `0001_initial.py` | 初始迁移 |
| `0002_alter_flowinfo_form_conf_alter_flowinfo_icon.py` | 修改字段 |

### 创建新迁移

```bash
python3 manage.py makemigrations dvadmin_approval
python3 manage.py migrate dvadmin_approval
```

---

## 常见问题 (FAQ)

### 1. 如何创建新的审批流程？

1. 在 `FlowInfo` 中创建流程定义
2. 添加 `FlowNode` 节点
3. 配置 `FlowLine` 连线
4. 发布流程

### 2. 如何提交审批？

创建 `FlowData` 实例，系统会自动根据流程定义创建审批记录。

### 3. 如何审批流程？

更新 `FlowRecord` 的审批状态，系统会自动流转到下一节点。

### 4. 支持哪些审批模式？

- 串行审批（按顺序审批）
- 并行审批（同时审批）
- 会签（所有审批人都通过）
- 或签（任一审批人通过）

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `models.py` | 数据模型定义 |
| `urls.py` | 路由配置 |
| `views/` | 后端视图 |
| `app_views/` | 移动端视图 |
| `base_model.py` | 基础模型 |
| `decorator.py` | 装饰器 |
| `settings.py` | 模块配置 |

### 数据库

- 表前缀：`workflow_`
- 主要表：5 张（FlowInfo, FlowNode, FlowLine, FlowData, FlowRecord）

---

## API 示例

### 创建流程定义

```json
POST /api/workflow/flow_info/
{
  "name": "请假审批",
  "operation": "leave",
  "icon": {},
  "form_conf": {},
  "status": 1
}
```

### 提交审批

```json
POST /api/workflow/flow_data/
{
  "flow_info": 1,
  "data": {
    "reason": "事假",
    "days": 3
  }
}
```

### 审批流程

```json
PUT /api/workflow/flow_record/{id}/
{
  "audit_status": 1,
  "audit_comment": "同意"
}
```

---

## 待办事项

- [ ] 添加流程版本管理
- [ ] 支持条件分支
- [ ] 支持抄送功能
- [ ] 添加流程监控
- [ ] 优化移动端界面
