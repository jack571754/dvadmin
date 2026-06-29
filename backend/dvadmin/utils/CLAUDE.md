[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../) > **utils**

# Utils 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 CustomModelViewSet 完整实现（继承 ImportSerializerMixin/ExportSerializerMixin/QueryArgumentsMixin、含 multiple_delete/get_by_ids action、get_menu_field 字段权限查询）、刷新 CoreModel 字段表（含 is_deleted 软删除 + all_objects 管理器）、补全中间件与工具模块说明 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

通用工具类库，为所有后端模块提供基础设施：模型基类、视图集基类、序列化器基类、权限控制、过滤器、分页、异常处理、中间件、云存储、导入导出等。

本模块是 DVAdmin 的"工具集底座"，所有业务模块（system、design_order、dvadmin3_flow、dvadmin_portfolio）的模型和视图均直接继承本模块的基类。

---

## 入口与启动

- 无独立启动入口，作为 `dvadmin.utils` 包被其他模块导入使用

---

## 对外接口

### 核心基类

| 类名 | 文件 | 说明 |
|------|------|------|
| CoreModel | models.py | 所有业务模型的基类，含 create_datetime/update_datetime/creator/modifier/dept_belong_id/is_deleted，含 `all_objects` 软删除管理器 |
| CustomModelViewSet | viewset.py | 视图集基类，集成权限/过滤/导入导出/批量删除/get_by_ids/字段权限查询 |
| CustomModelSerializer | serializers.py | 序列化器基类 |
| CustomPermission | permission.py | 自定义权限类 |
| FieldPermissionMixin | field_permission.py | 字段级权限 Mixin |
| DataLevelPermissionMargeFilter | filters.py | 数据级权限过滤器 |
| CoreModelFilterBankend | filters.py | 核心模型过滤器后端 |
| CustomDjangoFilterBackend | filters.py | 自定义 Django 过滤器后端 |
| CustomPagination | pagination.py | 分页器 |
| CustomExceptionHandler | exception.py | 全局异常处理器 |

### CustomModelViewSet 继承链与能力

```python
class CustomModelViewSet(
    ModelViewSet,
    ImportSerializerMixin,    # 导入功能
    ExportSerializerMixin,    # 导出功能
    QueryArgumentsMixin       # django-restql 动态字段查询
):
    values_queryset = None              # 性能优化：使用 values 形式
    ordering_fields = '__all__'
    create_serializer_class = None      # 新增时使用的序列化器
    update_serializer_class = None      # 更新时使用的序列化器
    filter_fields = '__all__'           # 默认全部字段可查询
    search_fields = ()
    extra_filter_class = [
        CoreModelFilterBankend,
        DataLevelPermissionMargeFilter
    ]
    permission_classes = [CustomPermission]
```

默认提供的 action：
- `multiple_delete/` (DELETE)：批量删除，请求体 `{"keys": [...]}`
- `get_by_ids/` (POST)：按 ID 列表查询，请求体 `{"ids": [...]}`

每个请求自动调用 `get_menu_field()` 查询当前用户可见的字段集合（基于 `FieldPermission`），结果存入 `request.permission_fields` 供序列化器使用。

### 中间件

| 中间件 | 说明 |
|--------|------|
| ApiLoggingMiddleware | API 日志记录（记录到 OperationLog） |
| HealthCheckMiddleware | 健康检查端点 |
| LocaleMiddleware | 国际化（Django i18n 集成） |

### 工具模块

| 模块 | 说明 |
|------|------|
| aliyunoss.py | 阿里云 OSS 上传 |
| tencentcos.py | 腾讯云 COS 上传 |
| backends.py | 自定义认证后端（CustomBackend，支持用户名/手机号登录） |
| import_export.py | 数据导入导出 |
| import_export_mixin.py | 导入导出 Mixin |
| crud_mixin.py | CRUD Mixin |
| json_response.py | 统一响应格式（DetailResponse/SuccessResponse/ErrorResponse） |
| request_util.py | 请求工具 |
| string_util.py | 字符串工具 |
| validator.py | 验证器 |
| swagger.py | Swagger 自定义 Schema（CustomSwaggerAutoSchema） |
| git_utils.py | Git 工具 |
| core_initialize.py | 核心初始化 |

---

## 关键依赖与配置

- `CoreModel` 定义了 `table_prefix` 全局表前缀
- `CoreModel` 包含软删除管理器 `all_objects`（包含已删除记录）
- `CustomModelViewSet` 默认集成 `DataLevelPermissionMargeFilter` + `CoreModelFilterBankend`
- `get_custom_app_models()` 工具函数返回所有自定义应用模型，用于判断是否需要应用字段权限

### 统一响应格式

```python
DetailResponse(data=..., msg=...)    # 单对象详情
SuccessResponse(data=..., msg=...)   # 列表/成功
ErrorResponse(msg=..., status=400)   # 错误
```

---

## 数据模型

CoreModel 本身是抽象模型（abstract=True），定义字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| create_datetime | DateTimeField(auto_now_add=True) | 创建时间 |
| update_datetime | DateTimeField(auto_now=True) | 更新时间 |
| creator | ForeignKey(Users, null=True, on_delete=SET_NULL, related_name='+') | 创建人 |
| modifier | ForeignKey(Users, null=True, on_delete=SET_NULL, related_name='+') | 修改人 |
| dept_belong_id | IntegerField(null=True, blank=True) | 所属部门 ID（数据权限用） |
| is_deleted | BooleanField(default=False) | 软删除标记 |

`objects` 管理器默认过滤 `is_deleted=False`，`all_objects` 包含所有记录。

---

## 测试与质量

- `tests/test_i18n.py`：国际化测试（唯一的自动化测试）
- **缺口**（优先级高）：
  - `CustomModelViewSet.get_menu_field` 字段权限查询逻辑需覆盖超管/普通用户/匿名用户
  - `DataLevelPermissionMargeFilter` 5 种 data_range 数据权限过滤
  - `FieldPermissionMixin` 字段遮罩行为
  - `CustomExceptionHandler` 异常响应格式
  - `CustomBackend` 多种登录方式

---

## 常见问题 (FAQ)

**Q: 自定义 APIView 如何使用字段权限？**
A: 直接查询 `FieldPermission.objects.filter(field__model='ModelName', role__in=user.role..., is_query=True).values_list('field__field_name', flat=True)`，然后对受限字段值替换为 `***`。参考 `design_order/views.py` 中的 `LoadProductSpecView`。

**Q: 如何让视图集使用不同的序列化器？**
A: 在 ViewSet 中定义 `create_serializer_class` / `update_serializer_class` / `list_serializer_class` / `retrieve_serializer_class` / `destroy_serializer_class`，`get_serializer_class()` 会自动根据 `self.action` 选择。

**Q: 软删除如何工作？**
A: `CoreModel.is_deleted` 默认 False，`objects` 管理器自动过滤。要查询包含已删除记录，使用 `Model.all_objects.filter(...)`。

**Q: 如何扩展批量操作？**
A: `CustomModelViewSet` 已提供 `multiple_delete` 和 `get_by_ids`。其他批量操作可通过 `@action(methods=['post'], detail=False)` 添加自定义 action。

---

## 相关文件清单

```
backend/dvadmin/utils/
  __init__.py
  models.py              # CoreModel 基类 + get_custom_app_models
  viewset.py             # CustomModelViewSet（已确认实现）
  serializers.py         # CustomModelSerializer
  permission.py          # CustomPermission
  field_permission.py    # FieldPermissionMixin
  filters.py             # CustomDjangoFilterBackend, DataLevelPermissionMargeFilter, CoreModelFilterBankend
  pagination.py          # CustomPagination
  exception.py           # CustomExceptionHandler
  middleware.py          # 3 个中间件
  json_response.py       # 统一响应格式
  backends.py            # CustomBackend 认证后端
  aliyunoss.py           # 阿里云 OSS
  tencentcos.py          # 腾讯云 COS
  import_export.py       # 导入导出
  import_export_mixin.py # 导入导出 Mixin
  crud_mixin.py          # CRUD Mixin
  request_util.py        # 请求工具
  string_util.py         # 字符串工具
  validator.py           # 验证器
  swagger.py             # Swagger Schema（CustomSwaggerAutoSchema）
  git_utils.py           # Git 工具
  core_initialize.py     # 核心初始化
  tests/
    __init__.py
    test_i18n.py         # 国际化测试（唯一）
```
