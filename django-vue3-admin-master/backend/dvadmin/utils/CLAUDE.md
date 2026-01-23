[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../CLAUDE.md) > **utils**

---

# Utils 工具模块

> 最后更新：2026-01-23 14:19:21

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-23 14:19:21 | 初始化模块文档 | Claude AI |

---

## 模块职责

提供后端开发的通用工具类、基础模型、权限控制、异常处理等功能。

---

## 入口与启动

工具模块不独立运行，被其他模块导入使用。

---

## 核心组件

### 1. 基础模型类 (models.py)

| 类 | 说明 |
|----|------|
| `CoreModel` | 所有业务模型的基类 |
| `SoftDeleteModel` | 软删除模型支持 |
| `SoftDeleteManager` | 软删除管理器 |
| `SoftDeleteQuerySet` | 软删除查询集 |

**CoreModel 提供字段：**
- `create_time`：创建时间
- `update_time`：更新时间
- `create_by`：创建人
- `update_by`：更新人
- `dept_belong_id`：所属部门

### 2. 自定义视图集 (viewset.py)

| 类 | 说明 |
|----|------|
| `CustomModelViewSet` | 自定义 ModelViewSet |

**功能特性：**
- 统一返回格式
- 支持不同序列化器（create/update/list/retrieve/destroy）
- 支持批量创建
- 自动列权限过滤
- 导入导出功能

### 3. 权限控制 (permission.py)

| 类/函数 | 说明 |
|---------|------|
| `CustomPermission` | 自定义权限类 |
| `has_permission` | 权限检查 |
| `check_permission` | 权限验证 |

**权限类型：**
- 菜单权限
- 按钮权限
- 列权限（字段级）
- 数据权限

### 4. 过滤器 (filters.py)

| 类 | 说明 |
|----|------|
| `CoreModelFilterBankend` | 核心模型过滤器 |
| `DataLevelPermissionMargeFilter` | 数据权限过滤器 |

### 5. 分页 (pagination.py)

| 类 | 说明 |
|----|------|
| `CustomPagination` | 自定义分页器 |

### 6. 序列化器 (serializers.py)

| 类/函数 | 说明 |
|---------|------|
| `CustomModelSerializer` | 自定义模型序列化器基类 |

### 7. 响应处理 (json_response.py)

| 类 | 说明 |
|----|------|
| `SuccessResponse` | 成功响应 |
| `ErrorResponse` | 错误响应 |
| `DetailResponse` | 详情响应 |

### 8. 异常处理 (exception.py)

| 类 | 说明 |
|----|------|
| `CustomExceptionHandler` | 自定义异常处理器 |

---

## 中间件 (middleware.py)

| 中间件 | 说明 |
|--------|------|
| `ApiLoggingMiddleware` | API 日志记录 |
| `HealthCheckMiddleware` | 健康检查 |

---

## 认证后端 (backends.py)

| 类 | 说明 |
|----|------|
| `CustomBackend` | 自定义认证后端 |

**支持认证方式：**
- 用户名密码
- 手机号
- 邮箱

---

## 字段权限 (field_permission.py)

列权限（字段级权限）控制。

---

## 导入导出 (import_export.py, import_export_mixin.py)

| 类 | 说明 |
|----|------|
| `ExportSerializerMixin` | 导出混入类 |
| `ImportSerializerMixin` | 导入混入类 |

**支持格式：**
- Excel (.xlsx)
- CSV

---

## CRUD 混入 (crud_mixin.py)

提供快速 CRUD 功能。

---

## 请求工具 (request_util.py)

请求处理工具函数。

---

## 字符串工具 (string_util.py)

字符串处理工具。

---

## 验证器 (validator.py)

自定义验证器。

---

## Swagger (swagger.py)

| 类 | 说明 |
|----|------|
| `CustomSwaggerAutoSchema` | 自定义 Swagger 自动生成 |
| `CustomOpenAPISchemaGenerator` | 自定义 OpenAPI 生成器 |

---

## 云存储

| 文件 | 说明 |
|------|------|
| `aliyunoss.py` | 阿里云 OSS |
| `tencentcos.py` | 腾讯云 COS |

---

## Git 工具 (git_utils.py)

Git 相关操作。

---

## 核心初始化 (core_initialize.py)

系统核心初始化逻辑。

---

## 常见问题 (FAQ)

### 1. 如何使用 CustomModelViewSet？

```python
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.models import CoreModel

class MyModel(CoreModel):
    name = models.CharField(max_length=100)

class MyViewSet(CustomModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
```

### 2. 如何添加列权限？

在 `MenuField` 中配置，视图集会自动过滤。

### 3. 如何使用导入导出？

```python
class MyViewSet(CustomModelViewSet):
    import_field_dict = {'field1': '字段1'}
    export_field_label = {'field1': '字段1'}
```

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `models.py` | 基础模型 |
| `viewset.py` | 视图集基类 |
| `permission.py` | 权限控制 |
| `filters.py` | 过滤器 |
| `pagination.py` | 分页 |
| `serializers.py` | 序列化器 |
| `json_response.py` | 响应处理 |
| `exception.py` | 异常处理 |
| `middleware.py` | 中间件 |
| `backends.py` | 认证后端 |
| `import_export_mixin.py` | 导入导出 |
