# dvadmin/utils · 后端通用层

> 导航：[仓库根](../../../CLAUDE.md) › [backend](../../CLAUDE.md) › **utils 通用层**
>
> 最后更新：2026-10-25

## 这一层负责什么

所有业务 ViewSet 的地基：统一 CRUD、鉴权、数据权限、过滤、响应包装、软删除、导入导出。
**新增业务模块不需要自己写这些**，继承即可。

## 一个 ViewSet 白拿了什么

`CustomModelViewSet`（[viewset.py:30](./viewset.py)）= `ModelViewSet` + `ImportSerializerMixin` +
`ExportSerializerMixin` + `QueryArgumentsMixin`。

| 能力 | 位置 | 说明 |
|------|------|------|
| 统一 CRUD 响应 | viewset.py:104-140 | `create/list/retrieve/update/destroy` 全部包成 `DetailResponse` / `SuccessResponse` |
| 按 action 换序列化器 | :61-66 | `serializer_class` / `create_serializer_class` / `update_serializer_class` |
| 字段权限 | :69-88 | `get_serializer` 读菜单字段权限，list 支持批量创建事务 |
| 过滤 | :40-49 | `filter_fields='__all__'`、`ordering_fields='__all__'`、`extra_filter_class` 默认带 `CoreModelFilterBankend` + `DataLevelPermissionMargeFilter` |
| 权限 | :44 | `permission_classes = [CustomPermission]` |
| 批量删除 | :143-156 | `DELETE` + body `keys`，即 `multiple_delete` |
| 按 id 批量取 | :158-166 | `get_by_ids` |
| 导入/导出 | `import_export_mixin.py:66/164/299` | `import_data` / `update_template` / `export_data`，字段映射用 `import_field_dict`、`export_field_label` |

分页：`CustomPagination`（[pagination.py:18](./pagination.py)），默认 10 条、`limit` 参数、上限 999，
返回 `code/msg/page/limit/total/is_next/is_previous/data`。

**该 ViewSet 没有缓存封装**，需要缓存自己用 `cache.lock`（参考 `backend/util/currency.py:14`）。

## 鉴权：`CustomPermission`

[permission.py:91-128](./permission.py) 的判定顺序：

1. 匿名 → 拒绝（:95-96）
2. 超级管理员 → 放行（:98-99）
3. 命中 `ApiWhiteList`（接口白名单）→ 放行（:106-109）
4. 否则取当前用户所有角色的 `RoleMenuButtonPermission` 授权接口，用 `path + method` 正则匹配（:111-127）

配套：`AnonymousUserPermission`(:36)、`SuperuserPermission`(:47)、`AdminPermission`(:60)。
登录后端 `CustomBackend` 在 [backends.py:16-40](./backends.py)，密码校验失败会回退 MD5 比对（兼容老数据）。

## 数据权限：两套过滤器串联

[filters.py](./filters.py)：

| 类 | 行 | 作用 |
|----|----|------|
| `DataLevelPermissionsFilter` | 79-205 | 按角色 `data_range` 过滤：0 仅本人 / 1 本部门及以下 / 2 本部门 / 3 全部 / 4 自定义部门 |
| `DataLevelPermissionsSubFilter` | 208-280 | "管理部门"场景：用户管理部门递归 ∩ 本部门，并保留本人创建的数据 |
| `DataLevelPermissionMargeFilter` | 283-286 | **合并器**：父类过滤后把结果交给 SubFilter 串联，这就是"数据权限合并" |

放行规则：接口在白名单且 `enable_datasource=False`（:104-120）；超管（:125）；无部门返回空（:133-135）；
模型没有 `dept_belong_id` 字段（:138）。

`CustomDjangoFilterBackend`（:289-517）是**自定义过滤后端**，比 Django 原生强：

- 前缀映射：`^` 精确、`@` 模糊、`$` 排除、`~` …（:290-296）
- 字符串默认 `icontains`（:437-443）
- 排除 JSON / TimeZone / File 字段（:432）
- 双值参数自动转 `__range`（:504-507）

`CoreModelFilterBankend`（:29-58）解析 `create_datetime_after/before`、`update_datetime_after/before`。

## 中间件

[middleware.py](./middleware.py)：

| 中间件 | 行 | 说明 |
|--------|----|------|
| `HealthCheckMiddleware` | 105-157 | `/healthz`、`/readiness`；**必须在 MIDDLEWARE 第一位**，因为不碰数据库 |
| `LocaleMiddleware` | 160-208 | Accept-Language 优先，用户偏好兜底 |
| `ApiLoggingMiddleware` | 19-102 | 按 `API_LOG_METHODS` 写 `OperationLog`；**必须在最后**，否则拿不到响应 |

## 响应与异常

- [json_response.py](./json_response.py)：`SuccessResponse`(:14)、`DetailResponse`(:33)、`ErrorResponse`(:49)。
  惯例是 **HTTP 200 + body 里的 `code`** 区分成败——前端 `shared/api/errors.ts` 依赖这个约定识别业务错误。
- [exception.py](./exception.py)：`CustomExceptionHandler`(:28-71) 把 401/404/DRF/`ProtectedError`/未知异常
  统一转成 `ErrorResponse`。

**不要**在视图中自己拼错误 JSON，也不要直接 `raise Http404` 了事。

## 模型基类

[models.py](./models.py)：

- `CoreModel`(:104) —— 业务模型基类，带 `creator` / `modifier` / `dept_belong_id` / 创建更新时间，以及软删除。
- `SoftDeleteModel`(:47) —— 软删除 + 级联。
- `CoreModelManager`(:84) —— 默认过滤已删除记录。
- `get_custom_app_models`(:273) —— 枚举自有 app 的模型，权限扫描用。

[serializers.py](./serializers.py)：`CustomModelSerializer`(:20)，动态字段 + 审计字段。

## 其他工具

| 文件 | 内容 |
|------|------|
| `crud_mixin.py` | `FastCrudMixin`(:8)，给 fast-crud 前端返回列配置 |
| `field_permission.py` | `FieldPermissionMixin`(:25)，字段级权限 |
| `swagger.py` | 文档辅助（:20/:35） |
| `validator.py` | 校验器（:15/:38） |
| `request_util.py` | 请求辅助（:17-205） |
| `import_export.py` | 导入导出底层（:13） |
| `aliyunoss.py` / `tencentcos.py` | 对象存储（:17 / :16） |
| `string_util.py` | 字符串工具（:18） |
| `core_initialize.py` | `CoreInitialize.init_base`，供各 app 的 `fixtures/initialize.py` 使用 |
| `git_utils.py` | git 辅助（:6） |
| `tests/` | 目前只有 `test_i18n.py`（登录错误信息中英文断言） |

## 硬规则

1. **新 ViewSet 一律继承 `CustomModelViewSet`**，否则拿不到权限、数据权限、统一响应。
2. 模型继承 `CoreModel`；需要软删除别自己造轮子。
3. 查询参数走 `CustomDjangoFilterBackend` 的前缀语法，不要重复实现 `?field=value` 的解析。
4. 改 `permission.py` / `filters.py` 的判定顺序 = 改全站安全边界，务必跑回归。
5. `path + method` 是权限的匹配键，新增接口后要同步 `menu_button` 权限数据（见
   [docs/auto-permission-scan.md](../../../docs/auto-permission-scan.md)）。
