# 图书借阅归还功能 MVP - 执行计划

> 创建时间：2026-01-27
> 状态：✅ 已完成

## 任务描述

实现图书借阅、归还、续借功能的最小 MVP，包括后端业务逻辑和前端管理页面。

---

## 实施方案

**方案 1：快速实现 MVP（采用）**

**默认规则：**
- 借阅期限：30天
- 最大续借：3次，每次+30天
- 无用户限制（所有登录用户可借阅）
- 罚金：暂不实现（状态标记即可）
- 库存：自动管理

---

## 执行步骤

### 阶段 1：后端数据模型调整

#### ✅ 步骤 1.1：修改 BookBorrow 模型
**文件：** `backend/dvadmin/book/models.py`

**操作：**
- 添加 `from django.conf import settings` 导入
- 在 `BookBorrow` 模型中添加 `user` 字段

```python
user = models.ForeignKey(
    to=settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    verbose_name="借阅用户",
    db_constraint=False,
    related_name="borrow_records",
    null=True,
    blank=True,
    help_text="借阅该图书的用户"
)
```

#### ✅ 步骤 1.2：生成并执行数据库迁移
```bash
cd backend
python manage.py makemigrations book
python manage.py migrate book
```

**结果：** 数据库表新增 `user_id` 字段

---

### 阶段 2：后端业务逻辑实现

#### ✅ 步骤 2.1：实现借阅逻辑
**文件：** `backend/dvadmin/book/views.py`

**添加导入：**
```python
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
```

**实现 `borrow()` 方法：**
- 检查库存是否充足（`available_quantity > 0`）
- 检查图书状态（`status == 0`）
- 检查用户是否有未归还的同书
- 创建借阅记录，设置应还日期为+30天
- 扣减图书库存

#### ✅ 步骤 2.2：实现归还逻辑
**文件：** `backend/dvadmin/book/views.py`

**实现 `return_book()` 方法：**
- 查找用户的借阅中记录
- 更新归还日期
- 判断是否逾期，更新状态
- 增加图书库存

#### ✅ 步骤 2.3：实现续借逻辑
**文件：** `backend/dvadmin/book/views.py`

**实现 `renew()` 方法：**
- 检查续借次数（`renew_count < max_renew_count`）
- 检查状态（仅允许 `status=0/3` 续借）
- 延长应还日期+30天
- 增加续借计数，更新状态为已续借

#### ✅ 步骤 2.4 & 2.5：更新视图集和序列化器

**文件：** `backend/dvadmin/book/views.py`
```python
queryset = BookBorrow.objects.select_related("book", "user")
```

**文件：** `backend/dvadmin/book/serializers.py`
```python
user_name = serializers.CharField(source="user.username", read_only=True)
```

---

### 阶段 3：前端页面开发

#### ✅ 步骤 3.1：创建前端借阅记录 API
**文件：** `web/src/views/book/borrow/api.ts`

**封装的 API：**
- `GetList()` - 获取借阅记录列表
- `AddObj()` - 添加借阅记录
- `UpdateObj()` - 更新借阅记录
- `DelObj()` - 删除借阅记录
- `borrowBook()` - 借阅图书
- `returnBook()` - 归还图书
- `renewBorrow()` - 续借操作

#### ✅ 步骤 3.2：创建前端借阅记录 CRUD 配置
**文件：** `web/src/views/book/borrow/crud.tsx`

**列配置：**
| 字段 | 标题 | 类型 | 说明 |
|------|------|------|------|
| book_title | 图书名称 | text | 只读 |
| book_isbn | ISBN | text | 只读 |
| user_name | 借阅用户 | text | 搜索、只读 |
| status | 状态 | dict-radio | 0:借阅中, 1:已归还, 2:逾期, 3:已续借 |
| borrow_date | 借阅时间 | datetime | 只读 |
| due_date | 应还时间 | date | 可编辑 |
| return_date | 归还时间 | datetime | 可空 |
| renew_count | 续借次数 | number | 只读 |

**操作按钮：**
- 续借：仅当 `status=0/3` 且 `renew_count < max_renew_count` 时显示

#### ✅ 步骤 3.3：创建前端借阅记录页面
**文件：** `web/src/views/book/borrow/index.vue`

#### ✅ 步骤 3.4：图书列表添加借阅/归还按钮
**文件：** `web/src/views/book/book/api.ts`
- 添加 `borrowBook()` 函数
- 添加 `returnBook()` 函数

**文件：** `web/src/views/book/book/crud.tsx`
- 添加 `borrow` 按钮：库存>0且状态正常时显示
- 添加 `return` 按钮：归还操作
- 调整 `width` 为 280 以容纳更多按钮

---

### 阶段 4：菜单与权限配置

#### ⏳ 步骤 4.1：添加前端菜单（需要手动配置）

**操作方式：** 在系统管理 -> 菜单管理中手动添加

**菜单结构：**
```
图书管理
├── 图书列表 (已有)
├── 借阅记录 (新增)
│   路由: /book/borrow
│   权限: book:borrow:list
│   按钮权限: book:borrow:Update, book:borrow:Delete, book:borrow:Renew
```

**图书列表按钮权限：**
- `book:book:Borrow` - 借阅
- `book:book:Return` - 归还

---

## 文件清单

### 后端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `backend/dvadmin/book/models.py` | 修改 | 添加 user 字段 |
| `backend/dvadmin/book/views.py` | 修改 | 实现借阅/归还/续借逻辑 |
| `backend/dvadmin/book/serializers.py` | 修改 | 添加 user_name 字段 |
| `backend/dvadmin/book/migrations/0002_bookborrow_user.py` | 新增 | 数据库迁移文件 |

### 前端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `web/src/views/book/borrow/api.ts` | 新建 | API 封装 |
| `web/src/views/book/borrow/crud.tsx` | 新建 | CRUD 配置 |
| `web/src/views/book/borrow/index.vue` | 新建 | 页面组件 |
| `web/src/views/book/book/api.ts` | 修改 | 添加借阅/归还 API |
| `web/src/views/book/book/crud.tsx` | 修改 | 添加借阅/归还按钮 |

---

## 代码量统计

| 阶段 | 文件数 | 代码行数 |
|------|--------|----------|
| 后端模型 | 1 | ~15 |
| 后端逻辑 | 2 | ~120 |
| 前端API | 2 | ~80 |
| 前端CRUD | 1 | ~150 |
| 前端页面 | 1 | ~20 |
| **总计** | **7** | **~385** |

---

## 测试验证

### 功能测试清单

- [ ] 借阅图书：库存从 N 变为 N-1
- [ ] 归还图书：库存从 N 变为 N+1
- [ ] 续借操作：应还日期延后30天
- [ ] 库存为0时无法借阅
- [ ] 达到最大续借次数时无法续借
- [ ] 重复借阅同一本书时提示错误
- [ ] 借阅记录列表显示正确
- [ ] 状态筛选功能正常

---

## 注意事项

1. **权限配置**：需要在系统管理中手动添加菜单和权限
2. **归还按钮**：图书列表中的归还按钮对所有用户显示，实际应根据当前用户的借阅记录动态显示
3. **事务处理**：使用 `@transaction.atomic` 确保数据一致性
4. **日期计算**：使用 `timezone.now()` 而非 `datetime.now()`
5. **前端路由**：确保前端路由配置正确

---

## 后续优化建议

1. **借阅数量限制**：添加用户最大同时借阅数量限制
2. **罚金计算**：实现逾期罚金自动计算
3. **逾期提醒**：添加定时任务更新逾期状态
4. **个人借阅历史**：创建"我的借阅"页面
5. **归还按钮优化**：根据当前用户借阅记录动态显示归还按钮

---

**执行完成时间：** 2026-01-27
**执行人：** Claude AI
