[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../CLAUDE.md) > **book**

---

# Book 图书管理模块

> 最后更新：2026-01-25 19:11:17

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 19:11:17 | 初始化 book 模块文档 | Claude AI |

---

## 模块职责

图书管理系统示例模块，演示如何基于 DVAdmin 框架开发完整的业务功能。

**核心功能：**
- 图书信息管理
- 图书分类管理
- 图书作者管理
- 图书出版社管理
- 图书借阅管理
- 图书预约管理

---

## 数据模型

### 核心模型

| 模型类 | 说明 | 主要字段 |
|--------|------|----------|
| `BookCategory` | 图书分类 | name, code, sort, parent |
| `BookPublisher` | 图书出版社 | name, code, address, contact |
| `BookAuthor` | 图书作者 | name, pen_name, gender, biography |
| `Book` | 图书信息 | isbn, title, category, publisher, authors |
| `BookBorrow` | 图书借阅记录 | book, status, borrow_date, due_date |
| `BookReservation` | 图书预约记录 | book, status, reservation_date, priority |

### 关系图

```
BookCategory (分类)
    ↓ 1:N
Book (图书)
    ↓ N:1
BookPublisher (出版社)

Book (图书)
    ↓ N:M
BookAuthor (作者)

Book (图书)
    ↓ 1:N
BookBorrow (借阅记录)
BookReservation (预约记录)
```

---

## 对外接口

### API 路由

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/book/` | GET/POST | 图书列表/创建 |
| `/api/book/{id}/` | GET/PUT/DELETE | 图书详情/更新/删除 |
| `/api/book/category/` | GET/POST | 分类列表/创建 |
| `/api/book/author/` | GET/POST | 作者列表/创建 |
| `/api/book/publisher/` | GET/POST | 出版社列表/创建 |
| `/api/book/borrow/` | GET/POST | 借阅记录/创建 |
| `/api/book/reservation/` | GET/POST | 预约记录/创建 |

---

## 视图集

### 视图文件

| 文件 | 说明 |
|------|------|
| `views.py` | 所有视图集定义 |

### 视图集继承

所有视图集继承自 `CustomModelViewSet`，自动获得：
- 权限控制
- 日志记录
- 数据验证
- 导入导出

---

## 序列化器

### 序列化器文件

| 文件 | 说明 |
|------|------|
| `serializers.py` | 所有序列化器定义 |

### 序列化器功能

- 数据验证
- 字段转换
- 嵌套序列化（如 Book 包含 Category、Publisher、Authors）
- 自定义验证逻辑

---

## 业务逻辑

### 借阅流程

1. 用户查询图书可借数量
2. 创建借阅记录（`BookBorrow`）
3. 自动扣减可借数量（`available_quantity`）
4. 设置应还时间（`due_date`）
5. 归还时更新记录和可借数量

### 预约流程

1. 图书不可借时创建预约（`BookReservation`）
2. 设置预约过期时间
3. 图书归还后通知预约用户
4. 按优先级分配图书

### 状态管理

**图书状态：**
- 0: 上架
- 1: 下架
- 2: 遗失
- 3: 报废

**借阅状态：**
- 0: 借阅中
- 1: 已归还
- 2: 逾期未还
- 3: 已续借

**预约状态：**
- 0: 等待中
- 1: 已取消
- 2: 已完成
- 3: 已过期

---

## 权限控制

### 按钮权限

| 权限标识 | 说明 |
|----------|------|
| `book:book:add` | 添加图书 |
| `book:book:edit` | 编辑图书 |
| `book:book:delete` | 删除图书 |
| `book:book:export` | 导出图书 |
| `book:book:import` | 导入图书 |

### 字段权限

支持列级别的字段权限控制，可限制用户查看特定字段。

---

## 依赖关系

### 依赖模块

- Django Core
- dvadmin.utils（基础模型和视图集）
- dvadmin.system（用户、部门等）
- application（Django 应用配置）

### 被依赖方

- 前端 `web/src/views/book/`（如果有）

---

## 配置说明

### INSTALLED_APPS

已在 `application/settings.py` 中注册：

```python
INSTALLED_APPS = [
    # ...
    "dvadmin.book",
]
```

### URL 配置

已在 `application/urls.py` 中包含：

```python
urlpatterns += [
    path("api/book/", include("dvadmin.book.urls")),
]
```

---

## 数据库迁移

### 迁移文件

| 文件 | 说明 |
|------|------|
| `migrations/0001_initial.py` | 初始迁移 |
| `migrations/0002_book_book_type.py` | 添加图书类型字段 |

### 执行迁移

```bash
python manage.py makemigrations book
python manage.py migrate book
```

---

## 常见问题 (FAQ)

### 1. 如何添加新的图书模型字段？

1. 在 `models.py` 中添加字段
2. 生成迁移：`python manage.py makemigrations book`
3. 执行迁移：`python manage.py migrate book`
4. 更新序列化器（`serializers.py`）

### 2. 如何自定义借阅规则？

在 `views.py` 中重写 `create` 方法：

```python
def create(self, request, *args, **kwargs):
    # 自定义借阅逻辑
    return super().create(request, *args, **kwargs)
```

### 3. 如何实现图书推荐？

使用 `Book` 模型的查询：

```python
# 基于分类推荐
related_books = Book.objects.filter(category=book.category).exclude(id=book.id)[:5]

# 基于作者推荐
author_books = Book.objects.filter(authors__in=book.authors.all()).distinct()[:5]
```

### 4. 如何处理逾期罚金？

在 `BookBorrow` 模型中已有罚金字段 `fine`，可通过定时任务计算：

```python
from celery import shared_task

@shared_task
def calculate_overdue_fines():
    overdue_records = BookBorrow.objects.filter(
        status=0,
        due_date__lt=timezone.now()
    )
    for record in overdue_records:
        # 计算罚金
        days = (timezone.now() - record.due_date).days
        record.fine = days * 0.5  # 每天罚金
        record.status = 2  # 标记为逾期
        record.save()
```

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `models.py` | 数据模型定义 |
| `views.py` | 视图集定义 |
| `serializers.py` | 序列化器定义 |
| `urls.py` | 路由配置 |
| `apps.py` | Django App 配置 |
| `admin.py` | Django Admin 配置 |

### 迁移文件

| 目录 | 说明 |
|------|------|
| `migrations/` | 数据库迁移文件 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [backend] (../../CLAUDE.md)
            └─ [dvadmin] (../CLAUDE.md)
                 └─ [book] (./)
```

---

## 示例代码

### 创建图书

```python
from dvadmin.book.models import Book, BookCategory, BookAuthor

# 创建分类
category = BookCategory.objects.create(
    name="计算机科学",
    code="CS001"
)

# 创建作者
author = BookAuthor.objects.create(
    name="张三",
    pen_name="技术达人"
)

# 创建图书
book = Book.objects.create(
    isbn="9787111111111",
    title="Python 编程从入门到精通",
    category=category,
    publisher=publisher,
    price=89.00,
    total_quantity=10,
    available_quantity=10
)
book.authors.add(author)
```

### 借阅图书

```python
from dvadmin.book.models import Book, BookBorrow
from django.utils import timezone

book = Book.objects.get(id=1)
borrow = BookBorrow.objects.create(
    book=book,
    user_id=request.user.id,
    status=0,
    due_date=timezone.now() + timezone.timedelta(days=30)
)
# 扣减可借数量
book.available_quantity -= 1
book.save()
```

### 查询可借图书

```python
# 查询所有可借图书
available_books = Book.objects.filter(
    available_quantity__gt=0,
    status=0
)

# 按分类查询
category_books = Book.objects.filter(
    category__name="计算机科学",
    available_quantity__gt=0
)

# 搜索图书
search_books = Book.objects.filter(
    title__icontains="Python"
)
```

---

## 开发建议

1. **性能优化：**
   - 为常用查询字段添加索引（如 `isbn`, `title`, `category`）
   - 使用 `select_related` 和 `prefetch_related` 优化关联查询
   - 启用 Django 缓存

2. **数据验证：**
   - 在 `clean()` 方法中添加自定义验证
   - 使用 `validators` 参数添加字段级验证
   - 在序列化器中添加自定义验证方法

3. **安全建议：**
   - 借阅操作需要用户登录
   - 删除图书需要管理员权限
   - 敏感操作添加操作日志

4. **扩展功能：**
   - 添加图书评价功能
   - 实现图书推荐算法
   - 添加图书封面图片上传
   - 集成第三方图书 API（如豆瓣、豆瓣读书）
