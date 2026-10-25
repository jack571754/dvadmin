# system · 系统管理模块

> 导航：[仓库根](../../../CLAUDE.md) › [backend](../../CLAUDE.md) › **system 系统管理**
>
> 最后更新：2026-10-25 ｜ URL 前缀 `api/system/`

## 结构

```
system/
├── models.py            # 718 行，全部模型集中在这里（没有 models/ 包）
├── views/               # 19 个视图模块（**没有 serializers.py，序列化器就地定义在视图里**）
├── urls.py              # 56 行：router + 手工路由
├── fixtures/            # 9 个 init_*.json + initialize.py + initSerializer.py
├── migrations/          # 2 个 Python 迁移 + 2 个 .sql（需手工执行）
├── management/commands/ # init / init_area / generate_init_json / retire_custom_business
├── signals.py tasks.py  # 登录信号、异步导出任务
└── tests_parity.py      # 真正的回归测试（Django TestCase）
```

`tests.py` **不是测试**，是带 `django.setup()` 的手动脚本。`admin.py` 未注册任何模型。

## 数据模型（`models.py`）

全部继承 `utils/models.py:104` 的 `CoreModel`（审计字段 `creator/modifier/dept_belong_id/create_datetime/update_datetime`）。
**`CoreModel` 本身没有软删除字段**，本模块也没有任何模型继承 `SoftDeleteModel`。

| 模型 | 行 | 关键点 |
|------|----|--------|
| `Role` | 13 | `key` 唯一；`status` |
| `Users` | 40 | 继承 `CoreModel, AbstractUser`；`role` M2M + `current_role`；`dept`（PROTECT）；`manage_dept` M2M；`login_error_count`、`language` |
| `Post` | 113 | 岗位，`status` 0 离职 / 1 在职 |
| `Dept` | 130 | `key` 唯一，`parent` 自关联；`recursion_all_dept` / `recursion_all_parent_dept` 递归工具 |
| `Menu` | 213 | 三语名称 `name/name_en/name_zh_tw`；`web_path`、`component`、`is_catalog`、`visible`、`is_affix` |
| `MenuField` / `FieldPermission` | 272 / 283 | 字段级权限 `is_query/is_create/is_update` |
| `MenuButton` | 297 | `value` 唯一；`api` + `method`(0-3 = GET/POST/PUT/DELETE)，权限匹配键 |
| `RoleMenuPermission` / `RoleMenuButtonPermission` | 327 / 352 | 后者带 `data_range` 0-4 与 `dept` M2M，是数据权限来源 |
| `Dictionary` | 390 | `parent` 自关联；`save/delete` 触发 `dispatch.refresh_dictionary()` |
| `OperationLog` | 437 | 由 `ApiLoggingMiddleware` 写入 |
| `FileList` | 469 | `save` 时算 md5/size |
| `Area` | 510 | 行政区划，`code` 唯一，`pcode` 自关联 |
| `ApiWhiteList` | 539 | 接口白名单，`enable_datasource` 控制是否绕过数据权限 |
| `SystemConfig` | 559 | `value` 为 JSONField；`form_item_type` 0-15；`unique_together=(key, parent)` |
| `LoginLog` | 622 | 登录日志 |
| `MessageCenter` / `MessageCenterTargetUser` | 651 / 670 | 消息中心与已读状态 |
| `DownloadCenter` | 689 | 异步导出产物，`task_status` 0-3 |

**表名不统一**：多数是 `system_*`，但 `api_white_list`、`role_menu_permission`、
`role_menu_button_permission`、`message_center`、`message_center_target_user`、`download_center`
没有 `system_` 前缀。

## 视图与路由

`urls.py:23-40` 是 router 注册，`:43-55` 是手工路由。所有 ViewSet 继承
`CustomModelViewSet`（除 APIView 外），因此自带 `CustomPermission` + 数据权限过滤。

| URL 前缀 | ViewSet | 自定义 action |
|----------|---------|---------------|
| `menu/` | `MenuViewSet` | `web_router`、`get_all_menu`、`move_up`、`move_down` |
| `menu_button/` | `MenuButtonViewSet` | `menu_button_all_permission`、`batch_create`、`scan_get_apps`、`scan_viewset`、`scan_batch_create` |
| `role/` | `RoleViewSet`（+ `FastCrudMixin`、`FieldPermissionMixin`） | `set_role_users`、`get_role_users`、`remove_role_user`、`add_role_users` |
| `dept/` | `DeptViewSet` | `all_dept`、`move_up`、`move_down`、`dept_info` |
| `user/` | `UserViewSet`（+ `FieldPermissionMixin`） | `user_info`、`update_user_info`、`change_password`、`login_change_password`、`update_language`、`reset_password`、`reset_to_default_password` |
| `operation_log/` `login_log/` | 日志 | — |
| `dictionary/` | `DictionaryViewSet` | — |
| `area/` | `AreaViewSet` | — |
| `file/` | `FileViewSet` | `get_all` |
| `api_white_list/` | `ApiWhiteListViewSet` | — |
| `system_config/` | `SystemConfigViewSet` | `save_content`、`get_association_table`、`get_table_data`、`get_relation_info` |
| `message_center/` | `MessageCenterViewSet` | `get_self_receive`、`get_newest_msg`；`retrieve` 会标记已读 |
| `role_menu_permission/` | `RoleMenuPermissionViewSet` | `save_auth` |
| `role_menu_button_permission/` | `RoleMenuButtonPermissionViewSet` | `get_role_menu`、`set_role_menu`、`get_role_menu_btn_field`、`set_role_menu_field`、`batch_set_role_menu_btn`、`set_role_menu_btn`、`set_role_menu_btn_data_range`、`role_to_dept_all` |
| `column/` | `MenuFieldViewSet` | `get_models`、`auto_match_fields`（**前缀是 `column`，不是 `menu_field`**） |
| `download_center/` | `DownloadCenterViewSet` | — |

导入/导出不在 ViewSet 里，来自 `ImportSerializerMixin` / `ExportSerializerMixin`，
由 `urls.py:44-45` 手工绑定。导出走 Celery 异步任务并写 `DownloadCenter` 记录。

登录相关（`CaptchaView`、`LoginView`、`LoginTokenView`、`LogoutView`、`ApiLogin`）挂在
`application/urls.py:105-117`，不在本模块的 urls.py。隐私政策/服务条款 `clause.py` 在 `urls.py:53-54`。

**页面级权限**：现有接口的按钮权限数据来自 fixtures，新增接口后要同步 `menu_button` 记录，
否则非超管访问会被 `CustomPermission` 拒绝。扫描工具有 `scan_viewset` 与
[docs/auto-permission-scan.md](../../../docs/auto-permission-scan.md)。

## 初始化（`manage.py init`）

`management/commands/init.py:33-43` 遍历 `INSTALLED_APPS`，对每个 app 执行
`{app}.fixtures.initialize.Initialize(reset=..., app=...).run()`。

`fixtures/initialize.py:74-83` 的执行顺序：
dept → role → users → menu → role_menu → role_menu_button → api_white_list → dictionary → system_config。

- JSON 文件名必须匹配 `init_{model_name}.json`（`utils/core_initialize.py:33-35`），否则静默跳过。
- `-y` 置 `reset=True`（**会覆盖既有初始化数据，慎用**）；`-n` 为 False；`-app xxx` 只跑指定 app。
- 导入时 `except ModuleNotFoundError: pass` 会吞掉 app 内部的真实导入错误（`init.py:39-55`），
  初始化"什么都没发生"时先怀疑这里。
- `CustomUserManager.create_superuser` 依赖 `Role.objects.get(name="管理员")`（`models.py:28-37`），
  角色不存在会删用户并抛 `ValidationError` —— **必须先 `init` 再建超管**。

## 其他命令

| 命令 | 作用 |
|------|------|
| `init_area` | 导入 `util/pca-code.json` 行政区划（docstring 里误写成 `init`） |
| `generate_init_json` | 从库反生成 `init_*.json`，但写到仓库根目录而不是 `fixtures/`（`generate_init_json.py:34-35`），生成后要手工搬 |
| `retire_custom_business` | 删除退役业务模块的菜单并下线相关流程；硬依赖 `dvadmin3_flow.FlowInfo`；`--apply` 必须配 `--backup-dir` 且仅支持 SQLite |

## 测试

```powershell
cd backend
python manage.py test dvadmin.system.tests_parity
```

`tests_parity.py` 有 `UserRelationParityTests`、`MenuOrderingPermissionTests` 两个类、5 个用例。
`pytest.ini` 的 `testpaths` 只指向 `dvadmin/utils/tests`，**pytest 默认收不到这里的测试**。

## 必须知道的坑

按"踩中的代价"排序：

1. **密码哈希口径有四种写法**（`models.py:97-99`、`views/user.py:344/360/407`、`:334-343` 的
   三重回退校验）。改密码相关逻辑务必四种都验证一遍，否则会出现"改完登录不上"。
   `UserProfileImportSerializer.save`（`views/user.py:205-211`）会双重 MD5。
2. **多个端点主动关掉了按钮级权限**：`dept_info`（`views/dept.py:165-166`）无鉴权即可读部门人数/性别统计；
   `web_router`、`get_all_menu`（`views/menu.py:144/160`）靠函数内判断兜底；
   `FileViewSet` 换成 `[IsAuthenticated]`（`views/file_list.py:114`）；
   `DownloadCenterViewSet` 是 `permission_classes = []`（`views/download_center.py:47`）。
   改动这些接口前先确认这是不是有意的。
3. **`MessageCenterViewSet.extra_filter_backends = []`**（`views/message_center.py:208`）是无效配置——
   基类消费的键是 `extra_filter_class`，所以数据权限过滤**仍在生效**。
4. **迁移编号有断档**：`0001_add_users_language.py`、`0002_*.py`，**没有 0003**；而
   `0002_fill_menu_i18n.sql`、`0004_fill_menubutton_i18n.sql` 不是 Django 迁移，要手工
   `dbshell <` 执行。新增迁移时不要被编号误导。
5. **`SystemConfigViewSet.get_table_data` 能按配置读任意模型全表**（`views/system_config.py:223-238`），
   只靠默认 `CustomPermission` 保护。
6. `utils/viewset.py:26` 反向 import 本模块的 `MenuField/FieldPermission`，所以 `dvadmin.utils`
   不能脱离 `dvadmin.system` 使用。
7. `apps.py` 的 AppConfig 类叫 `SystemConfig`，与模型 `SystemConfig` 同名（不同模块），import 时注意路径。
