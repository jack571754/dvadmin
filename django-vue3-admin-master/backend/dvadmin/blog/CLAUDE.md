[根目录](../../../../../CLAUDE.md) > [backend](../../../../CLAUDE.md) > [dvadmin](../../../CLAUDE.md) > **blog**

---

# Blog 博客模块

> 最后更新：2026-02-01

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-02-01 | 初始化博客模块，创建基础功能 | Claude AI |

---

## 模块职责

个人博客系统，提供文章发布、分类管理、标签管理、评论功能及用户注册功能。

---

## 功能特性

### 核心功能

- **文章管理**：支持 Markdown 编辑、草稿/发布状态、阅读量统计、点赞
- **分类管理**：文章分类、排序、启用/禁用
- **标签管理**：文章标签、颜色自定义
- **评论系统**：登录用户评论、楼中楼回复
- **用户注册**：公开注册接口，访客可自主注册账号

### 权限控制

| 功能 | 访客 | 登录用户 | 管理员 |
|------|------|----------|--------|
| 浏览文章 | ✅ | ✅ | ✅ |
| 浏览分类/标签 | ✅ | ✅ | ✅ |
| 发表评论 | ❌ | ✅ | ✅ |
| 用户注册 | ✅ | - | - |
| 文章管理 | ❌ | ❌ | ✅ |
| 评论管理 | ❌ | ❌ | ✅ |

---

## 入口与启动

### Django App 配置

- **App 配置**：`apps.py`
- **路由注册**：`urls.py` → `application/urls.py` → `/api/blog/`
- **注册位置**：`application/settings.py` → `INSTALLED_APPS`

---

## 对外接口

### ViewSet 列表

| ViewSet | 路径 | 功能 | 权限 |
|---------|------|------|------|
| `CategoryViewSet` | `/api/blog/categories/` | 分类 CRUD | 访客只读，管理员写 |
| `TagViewSet` | `/api/blog/tags/` | 标签 CRUD | 访客只读，管理员写 |
| `ArticleViewSet` | `/api/blog/articles/` | 文章 CRUD | 访客只读，管理员写 |
| `CommentViewSet` | `/api/blog/comments/` | 评论 CRUD | 登录可写，管理员删 |

### 特殊接口

| 路径 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/blog/register/` | POST | 用户注册 | 公开 |
| `/api/blog/articles/hot/` | GET | 热门文章 | 公开 |
| `/api/blog/articles/{id}/like/` | POST | 点赞文章 | 公开 |
| `/api/blog/articles/{id}/publish/` | POST | 发布文章 | 管理员 |
| `/api/blog/comments/by_article/` | GET | 文章评论 | 公开 |

---

## 数据模型

### 核心模型

| 模型 | 表名 | 说明 |
|------|------|------|
| `Category` | `dvadmin_blog_category` | 文章分类 |
| `Tag` | `dvadmin_blog_tag` | 文章标签 |
| `Article` | `dvadmin_blog_article` | 文章 |
| `Comment` | `dvadmin_blog_comment` | 评论 |

### 模型关系

```
Category (分类)
  └── OneToMany → Article (文章)

Tag (标签)
  └── ManyToMany → Article

Article (文章)
  ├── ForeignKey → Category
  ├── ManyToMany → Tag
  ├── ForeignKey → Users (creator)
  └── OneToMany → Comment

Comment (评论)
  ├── ForeignKey → Article
  ├── ForeignKey → Users
  └── ForeignKey → Comment (parent, 自评论)
```

### 模型字段详解

#### Category（分类）
```python
- name: CharField(max_length=50)          # 分类名称
- description: TextField()                 # 分类描述
- sort_order: IntegerField(default=0)     # 排序
- is_active: BooleanField(default=True)   # 是否启用
```

#### Tag（标签）
```python
- name: CharField(max_length=30, unique)  # 标签名称
- color: CharField(max_length=7)           # 标签颜色
```

#### Article（文章）
```python
- title: CharField(max_length=200)        # 文章标题
- content: TextField()                     # Markdown 内容
- summary: CharField(max_length=500)      # 摘要
- cover_image: CharField(max_length=500)  # 封面图 URL
- category: ForeignKey(Category)           # 分类
- tags: ManyToManyField(Tag)               # 标签
- status: CharField(choices=['draft', 'published'])  # 状态
- views_count: IntegerField(default=0)     # 阅读量
- likes_count: IntegerField(default=0)     # 点赞数
- is_top: BooleanField(default=False)      # 是否置顶
```

#### Comment（评论）
```python
- article: ForeignKey(Article)             # 关联文章
- content: TextField()                     # 评论内容
- user: ForeignKey(Users)                  # 评论用户
- parent: ForeignKey('self')               # 父评论（楼中楼）
- is_active: BooleanField(default=True)    # 是否显示
```

---

## 序列化器

| 序列化器 | 用途 |
|---------|------|
| `CategorySerializer` | 分类 CRUD |
| `TagSerializer` | 标签 CRUD |
| `ArticleListSerializer` | 文章列表 |
| `ArticleDetailSerializer` | 文章详情 |
| `ArticleCreateSerializer` | 文章创建/更新 |
| `CommentSerializer` | 评论列表/详情 |
| `CommentCreateSerializer` | 评论创建 |
| `RegisterSerializer` | 用户注册 |

---

## 过滤器

### ArticleFilter

支持过滤条件：
- `title`：标题模糊搜索
- `category`：分类 ID
- `tags`：标签 ID
- `status`：文章状态
- `is_top`：是否置顶
- `created_time_start`：创建时间起始
- `created_time_end`：创建时间结束

---

## 常见问题 (FAQ)

### 1. 如何发布文章？

1. 创建文章时 `status` 默认为 `draft`
2. 调用 `POST /api/blog/articles/{id}/publish/` 发布文章
3. 或在创建时直接设置 `status=published`

### 2. 如何注册用户？

```bash
POST /api/blog/register/
{
  "username": "testuser",
  "password": "password123",
  "confirm_password": "password123",
  "email": "test@example.com",
  "name": "测试用户"
}
```

### 3. 评论如何关联用户？

评论创建时自动使用当前登录用户（通过 `perform_create` 方法），无需手动传 `user` 字段。

### 4. 楼中楼回复如何实现？

评论时传入 `parent` 字段（父评论 ID），`parent` 为 `null` 则为顶级评论。

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `models.py` | 数据模型定义 |
| `views.py` | 视图集和注册接口 |
| `serializers.py` | 序列化器定义 |
| `urls.py` | 路由配置 |
| `filters.py` | 过滤器定义 |
| `admin.py` | Django Admin 配置 |
| `apps.py` | Django App 配置 |

---

## 面包屑导航

```
[根目录] (../../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../../CLAUDE.md)
       └─ [backend] (../../../../CLAUDE.md)
            └─ [dvadmin] (../../../CLAUDE.md)
                 └─ [blog] (./)
```
