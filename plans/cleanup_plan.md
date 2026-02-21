# 项目脚本清理计划

## 一、当前脚本分析

### Blog模块 (`dvadmin/blog/management/commands/`)

| 文件 | 功能 | 状态 | 建议 |
|------|------|------|------|
| `init_blog_menu.py` | 初始化博客菜单 | 冗余 | **删除** - 功能已由 `fixtures/initialize.py` 替代 |
| `generate_blog_data.py` | 生成博客测试数据 | 保留 | 核心功能 |
| `generate_test_data.py` | 生成测试数据 | 冗余 | **删除** - 与 generate_blog_data.py 重复 |
| `init_course_data.py` | 初始化课程数据 | 可选 | **删除** - 非核心功能 |

### Book模块 (`dvadmin/book/management/commands/`)

| 文件 | 功能 | 状态 | 建议 |
|------|------|------|------|
| `init_book_menu.py` | 初始化图书菜单 | 冗余 | **删除** - 功能已由 `fixtures/initialize.py` 替代 |
| `generate_book_data.py` | 生成图书测试数据 | 保留 | 核心功能 |

### System模块 (`dvadmin/system/management/commands/`)

| 文件 | 功能 | 状态 | 建议 |
|------|------|------|------|
| `init_all.py` | 统一初始化命令 | 新增 | **保留** - 统一入口 |
| `init_celery_task_menu.py` | Celery任务菜单 | 保留 | 系统功能 |
| `init_flow_menu.py` | 流程菜单 | 保留 | 系统功能 |

---

## 二、清理后的目录结构

```
backend/dvadmin/
├── blog/
│   ├── fixtures/
│   │   ├── __init__.py
│   │   ├── init_blog_menu.json        # 菜单配置
│   │   ├── init_blog_dictionary.json  # 字典配置
│   │   └── initialize.py              # 初始化脚本
│   └── management/commands/
│       ├── __init__.py
│       └── generate_blog_data.py      # 测试数据生成
│
├── book/
│   ├── fixtures/
│   │   ├── __init__.py
│   │   ├── init_book_menu.json        # 菜单配置
│   │   ├── init_book_dictionary.json  # 字典配置
│   │   └── initialize.py              # 初始化脚本
│   └── management/commands/
│       ├── __init__.py
│       └── generate_book_data.py      # 测试数据生成
│
└── system/
    ├── fixtures/
    │   ├── init_menu.json
    │   ├── init_dictionary.json
    │   ├── init_role.json
    │   ├── init_users.json
    │   ├── ... (其他系统配置)
    │   └── initialize.py
    └── management/commands/
        ├── __init__.py
        ├── init_all.py                # 统一初始化入口
        ├── init_celery_task_menu.py
        └── init_flow_menu.py
```

---

## 三、待删除文件列表

1. `dvadmin/blog/management/commands/init_blog_menu.py`
2. `dvadmin/blog/management/commands/generate_test_data.py`
3. `dvadmin/blog/management/commands/init_course_data.py`
4. `dvadmin/book/management/commands/init_book_menu.py`

---

## 四、使用方式（清理后）

### 初始化所有模块
```bash
python manage.py init_all
```

### 初始化单个模块
```bash
# 方式一：通过 init_all 指定模块
python manage.py init_all --modules blog book

# 方式二：直接运行 fixtures 脚本
python -m dvadmin.blog.fixtures.initialize
python -m dvadmin.book.fixtures.initialize
```

### 生成测试数据
```bash
python manage.py generate_blog_data
python manage.py generate_book_data
```

---

## 五、执行步骤

1. 删除冗余的 management commands
2. 验证 init_all 命令正常工作
3. 更新相关文档

