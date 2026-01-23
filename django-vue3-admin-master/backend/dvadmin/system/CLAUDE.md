[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../CLAUDE.md) > **system**

---

# System 系统模块

> 最后更新：2026-01-23 14:19:21

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-23 14:19:21 | 初始化模块文档 | Claude AI |

---

## 模块职责

系统核心模块，负责用户管理、角色管理、权限控制、菜单管理、部门管理、日志记录等基础功能。

---

## 入口与启动

### Django App 配置

- **App 配置**：`apps.py`
- **路由注册**：`urls.py`（注册到主路由 `/api/system/`）

---

## 对外接口

### ViewSet 列表

| ViewSet | 路径 | 功能 |
|---------|------|------|
| `UserViewSet` | `/api/system/user/` | 用户 CRUD、导入导出 |
| `RoleViewSet` | `/api/system/role/` | 角色 CRUD |
| `DeptViewSet` | `/api/system/dept/` | 部门 CRUD、树形结构 |
| `MenuViewSet` | `/api/system/menu/` | 菜单 CRUD、树形结构 |
| `MenuButtonViewSet` | `/api/system/menu_button/` | 菜单按钮权限 |
| `MenuFieldViewSet` | `/api/system/column/` | 列权限管理 |
| `DictionaryViewSet` | `/api/system/dictionary/` | 字典管理 |
| `AreaViewSet` | `/api/system/area/` | 地区管理 |
| `FileViewSet` | `/api/system/file/` | 文件管理 |
| `ApiWhiteListViewSet` | `/api/system/api_white_list/` | API 白名单 |
| `SystemConfigViewSet` | `/api/system/system_config/` | 系统配置 |
| `MessageCenterViewSet` | `/api/system/message_center/` | 消息中心 |
| `RoleMenuPermissionViewSet` | `/api/system/role_menu_permission/` | 角色菜单权限 |
| `RoleMenuButtonPermissionViewSet` | `/api/system/role_menu_button_permission/` | 角色按钮权限 |
| `LoginLogViewSet` | `/api/system/login_log/` | 登录日志 |
| `OperationLogViewSet` | `/api/system/operation_log/` | 操作日志 |
| `DownloadCenterViewSet` | `/api/system/download_center/` | 下载中心 |

### 特殊接口

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/login/` | POST | 用户登录 |
| `/api/logout/` | POST | 用户登出 |
| `/api/captcha/` | GET | 获取验证码 |
| `/api/token/` | POST | 获取 Token（测试用） |
| `/api/init/dictionary/` | GET | 初始化字典 |
| `/api/init/settings/` | GET | 初始化系统配置 |

---

## 关键依赖与配置

### Django App 注册

在 `application/settings.py` 中：

```python
INSTALLED_APPS = [
    # ...
    "dvadmin.system",
]
```

### 数据库表前缀

所有表使用前缀：`dvadmin_system_`

---

## 数据模型

### 核心模型

| 模型 | 表名 | 说明 |
|------|------|------|
| `Users` | `dvadmin_system_users` | 用户表 |
| `Role` | `dvadmin_system_role` | 角色表 |
| `Dept` | `dvadmin_system_dept` | 部门表 |
| `Menu` | `dvadmin_system_menu` | 菜单表 |
| `MenuButton` | `dvadmin_system_menu_button` | 菜单按钮表 |
| `MenuField` | `dvadmin_system_menu_field` | 菜单字段（列权限） |
| `Dictionary` | `dvadmin_system_dictionary` | 字典表 |
| `Area` | `dvadmin_system_area` | 地区表 |
| `FileList` | `dvadmin_system_file_list` | 文件表 |
| `ApiWhiteList` | `dvadmin_system_api_white_list` | API 白名单 |
| `SystemConfig` | `dvadmin_system_system_config` | 系统配置 |
| `LoginLog` | `dvadmin_system_login_log` | 登录日志 |
| `OperationLog` | `dvadmin_system_operation_log` | 操作日志 |
| `Post` | `dvadmin_system_post` | 岗位表 |
| `MessageCenter` | `dvadmin_system_message_center` | 消息中心 |

### 模型关系

```
Users (用户)
  ├── ManyToMany → Role (角色)
  ├── ManyToMany → Post (岗位)
  ├── ForeignKey → Dept (所属部门)
  └── ManyToMany → Dept (管理部门)

Role (角色)
  └── ManyToMany → Menu (菜单)
    └── MenuButton (按钮权限)
    └── MenuField (字段权限)

Menu (菜单)
  ├── ForeignKey → Menu (父菜单)
  └── OneToMany → MenuButton/MenuField

Dept (部门)
  └── ForeignKey → Dept (父部门)
```

---

## 视图层 (views/)

### 目录结构

```
views/
├── __init__.py
├── login.py              # 登录视图
├── user.py               # 用户管理
├── role.py               # 角色管理
├── dept.py               # 部门管理
├── menu.py               # 菜单管理
├── menu_button.py        # 按钮权限
├── menu_field.py         # 字段权限
├── dictionary.py         # 字典管理
├── area.py               # 地区管理
├── file_list.py          # 文件管理
├── api_white_list.py     # API 白名单
├── system_config.py      # 系统配置
├── message_center.py     # 消息中心
├── login_log.py          # 登录日志
├── operation_log.py      # 操作日志
├── download_center.py    # 下载中心
├── role_menu.py          # 角色菜单关联
├── role_menu_button_permission.py
└── clause.py             # 隐私条款
```

### 视图基类

所有视图继承自 `CustomModelViewSet`（`dvadmin/utils/viewset.py`），自动获得：
- CRUD 标准接口
- 权限控制
- 导入导出功能
- 分页过滤
- 列权限控制

---

## 序列化器

序列化器通常与视图同名，位于 `views/` 目录下或独立的 `serializers.py`。

---

## 管理命令

### 自定义命令 (management/commands/)

| 命令 | 说明 |
|------|------|
| `init` | 初始化系统数据 |
| `init_area` | 初始化省市区数据 |
| `generate_init_json` | 生成初始化 JSON 数据 |

### 使用方式

```bash
python3 manage.py init
python3 manage.py init_area
```

---

## 初始化数据 (fixtures/)

| 文件 | 说明 |
|------|------|
| `init_users.json` | 初始用户数据 |
| `init_role.json` | 初始角色数据 |
| `init_dept.json` | 初始部门数据 |
| `init_menu.json` | 初始菜单数据 |
| `init_dictionary.json` | 初始字典数据 |
| `init_systemconfig.json` | 初始系统配置 |
| `init_rolemenupermission.json` | 角色菜单权限 |
| `init_rolemenubuttonpermission.json` | 角色按钮权限 |
| `init_apiwhitelist.json` | API 白名单 |

### 初始化逻辑

- `fixtures/initialize.py`：初始化入口
- `fixtures/initSerializer.py`：初始化序列化器

---

## 信号与任务

| 文件 | 说明 |
|------|------|
| `signals.py` | Django 信号处理 |
| `tasks.py` | 异步任务（Celery） |

---

## 测试

| 文件 | 说明 |
|------|------|
| `tests.py` | 系统模块测试 |

---

## 工具类 (util/)

| 文件 | 说明 |
|------|------|
| `pca-code.json` | 省市区编码数据 |

---

## 常见问题 (FAQ)

### 1. 如何添加新的业务模块？

1. 创建模型（继承 `CoreModel`）
2. 创建序列化器
3. 创建视图集（继承 `CustomModelViewSet`）
4. 配置 URL

### 2. 权限控制如何实现？

- 视图集自动继承 `CustomPermission`
- 使用 `@permission_classes([CustomPermission])`
- 前端通过按钮权限和列权限控制

### 3. 列权限如何使用？

- 在 `MenuField` 中配置字段权限
- 视图集自动过滤未授权字段
- 前端根据权限显示/隐藏列

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `models.py` | 数据模型定义 |
| `urls.py` | 路由配置 |
| `views/` | 视图层 |
| `fixtures/` | 初始化数据 |
| `management/commands/` | 管理命令 |
