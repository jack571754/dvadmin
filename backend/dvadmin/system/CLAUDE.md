[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../) > **system**

# System 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 MenuField/FieldPermission 在字段级权限中的作用机制、补充 management/commands 子目录说明、刷新 views/ 18 个文件清单 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

系统管理核心模块，提供 RBAC 权限体系的全部基础设施：用户管理、角色管理、菜单管理、部门管理、字段级权限、字典管理、操作日志、登录日志、文件管理、消息中心、地区管理、接口白名单、系统配置、下载中心。

本模块是整个 DVAdmin 的"权限中枢"，其他业务模块（design_order、dvadmin3_flow、dvadmin_portfolio）的字段级权限均依赖本模块的 `MenuField` + `FieldPermission` 表。

---

## 入口与启动

- **Apps 配置**：`apps.py` -- `SystemConfig`, name = `dvadmin.system`
- **URL 路由**：`urls.py` -- 注册了 17 个 ViewSet + 5 个独立路由
- **信号**：`signals.py` -- Django 信号处理
- **Celery 任务**：`tasks.py` -- 异步任务定义

---

## 对外接口

| 路由后缀 | ViewSet | 说明 |
|----------|---------|------|
| `menu/` | MenuViewSet | 菜单管理 |
| `menu_button/` | MenuButtonViewSet | 菜单按钮权限 |
| `column/` | MenuFieldViewSet | 字段权限定义（MenuField） |
| `role/` | RoleViewSet | 角色管理 |
| `dept/` | DeptViewSet | 部门管理 |
| `user/` | UserViewSet | 用户管理（含 import/export） |
| `operation_log/` | OperationLogViewSet | 操作日志 |
| `dictionary/` | DictionaryViewSet | 字典管理 |
| `area/` | AreaViewSet | 地区管理 |
| `file/` | FileViewSet | 文件管理 |
| `api_white_list/` | ApiWhiteListViewSet | 接口白名单 |
| `system_config/` | SystemConfigViewSet | 系统配置 |
| `message_center/` | MessageCenterViewSet | 消息中心 |
| `role_menu_button_permission/` | RoleMenuButtonPermissionViewSet | 角色按钮权限 |
| `role_menu_permission/` | RoleMenuPermissionViewSet | 角色菜单权限 |
| `login_log/` | LoginLogViewSet | 登录日志 |
| `download_center/` | DownloadCenterViewSet | 下载中心 |

额外路由：`user/export/`, `user/import/`, `system_config/save_content/`, `system_config/get_association_table/`, `system_config/get_table_data/<pk>/`, `system_config/get_relation_info/`, `clause/privacy.html`, `clause/terms_service.html`

每个 ViewSet 通过继承 `CustomModelViewSet` 自动获得 `multiple_delete/` 和 `get_by_ids/` 两个 action。

---

## 关键依赖与配置

- 继承 `CoreModel`（来自 `dvadmin.utils.models`）
- 使用 `CustomModelViewSet`（来自 `dvadmin.utils.viewset`）
- 字段级权限通过 `MenuField` + `FieldPermission` 表实现
- 数据权限通过 `RoleMenuButtonPermission.data_range` 字段实现（0=仅本人, 1=本部门及以下, 2=本部门, 3=全部, 4=自定义）

### 字段级权限工作机制

1. `MenuField` 记录某模型（如 `ProductArchive`、`ProductSpec`）下需要权限控制的字段名
2. `FieldPermission` 为每个角色 + 字段配置 `is_query` / `is_create` / `is_update` 三个布尔权限
3. `CustomModelViewSet.get_menu_field()` 在每次请求时查询当前用户可见的字段集合
4. 业务侧（如 `LoadProductSpecView`）通过查询 `FieldPermission.objects.filter(field__model=..., role__in=user_roles, is_query=True)` 获取可查询字段
5. 受限字段值替换为 `***`（在序列化层或自定义视图中处理）

---

## 数据模型

| 模型 | 核心字段 | 说明 |
|------|----------|------|
| Users | username, name, email, mobile, avatar, gender, dept, role, post, language | 用户表，继承 AbstractUser + CoreModel |
| Role | name, key, sort, status | 角色表 |
| Dept | name, key, sort, parent, owner, status | 部门表（树形） |
| Menu | name, name_en, name_zh_tw, parent, icon, web_path, component, sort, is_link, is_catalog, visible | 菜单表（支持多语言，控制前端路由） |
| MenuButton | menu, name, name_en, name_zh_tw, value, api, method | 菜单按钮权限 |
| MenuField | model, menu, field_name, title | 字段权限定义 |
| FieldPermission | role, field, is_query, is_create, is_update | 字段级权限配置 |
| Dictionary | label, value, parent, type, color, sort | 字典表（树形） |
| OperationLog | request_modular, request_path, request_method, request_body, request_msg, request_ip | 操作日志 |
| LoginLog | username, ip, browser, os, city, login_type | 登录日志 |
| FileList | name, url, file_url, engine, mime_type, size, md5sum | 文件管理 |
| Area | name, code, level, pinyin, pcode | 地区表（树形） |
| ApiWhiteList | url, method, enable_datasource | 接口白名单 |
| SystemConfig | parent, title, key, value, form_item_type, rule | 系统配置（树形） |
| MessageCenter | title, content, target_type, target_user/dept/role | 消息中心 |
| DownloadCenter | task_name, task_status, file_name, url, size | 下载中心 |

---

## 测试与质量

- `tests.py`：空文件，无自动化测试
- **缺口**（优先级中）：
  - 字段级权限查询逻辑（`get_menu_field`）需覆盖超管/普通用户/匿名用户分支
  - 数据权限过滤（`DataLevelPermissionMargeFilter`）需覆盖 5 种 data_range
  - 用户导入导出逻辑需覆盖

---

## 常见问题 (FAQ)

**Q: 如何新增字段级权限？**
A: 在 `MenuField` 中定义模型和字段名（如 `model='ProductArchive', field_name='retail_price'`），然后在 `FieldPermission` 中为角色分配权限（`is_query`/`is_create`/`is_update`）。前端通过 `GetPermission()` API 获取权限字典，并在 `crud.tsx` 中根据权限隐藏/遮罩列。

**Q: 密码存储方式？**
A: `Users.set_password()` 使用 MD5 哈希后传给 Django 的 `set_password`（会再进行 PBKDF2 哈希）。

**Q: 菜单如何控制前端路由？**
A: `Menu.web_path` 是前端 URL 路径，`Menu.component` 是 Vue 组件相对路径（如 `system/user/index`）。前端 `backEnd.ts` 中的 `dynamicImport()` 根据 component 路径动态导入 Vue 文件。

**Q: 操作日志如何记录？**
A: 通过 `dvadmin.utils.middleware.ApiLoggingMiddleware` 中间件，对所有 `API_LOG_METHODS` 中配置的方法（默认 POST/UPDATE/DELETE/PUT）记录到 `OperationLog` 表。`API_MODEL_MAP` 用于将 URL 路径映射到中文模块名。

---

## 相关文件清单

```
backend/dvadmin/system/
  __init__.py
  apps.py
  admin.py
  models.py              # 16 个模型定义
  signals.py             # Django 信号
  tasks.py               # Celery 任务
  tests.py               # 空测试文件
  urls.py                # 路由注册
  views/
    __init__.py
    api_white_list.py
    area.py
    clause.py            # 隐私政策/服务条款 HTML
    dept.py
    dictionary.py
    download_center.py
    file_list.py
    login.py             # 登录/登出/验证码
    login_log.py
    menu.py
    menu_button.py
    menu_field.py        # MenuField 字段权限定义
    message_center.py
    operation_log.py
    role.py
    role_menu.py
    role_menu_button_permission.py
    system_config.py
    user.py              # 含 import/export
  fixtures/
    initialize.py         # 初始化数据（菜单/角色/字段权限等）
    initSerializer.py     # 初始化序列化器
  management/
    commands/
      init.py             # 管理命令：python manage.py init
      init_area.py        # 管理命令：初始化地区数据
      generate_init_json.py
  migrations/
```
