[根目录](../../../CLAUDE.md) > [django-vue3-admin-master](../../CLAUDE.md) > [backend](../CLAUDE.md) > **plugins**

---

# Plugins 插件目录

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 plugins 目录文档 | Claude AI |

---

## 模块职责

存放 DVAdmin 插件，支持热插拔和动态加载。

---

## 插件列表

| 插件 | 说明 | 文档 |
|------|------|------|
| [dvadmin3_flow](./dvadmin3_flow/CLAUDE.md) | 工作流审批插件 | [查看文档](./dvadmin3_flow/CLAUDE.md) |

---

## 插件机制

### 自动加载

Django 启动时自动扫描 `plugins/` 目录：

```python
# application/settings.py
PLUGINS_PATH = os.path.join(BASE_DIR, "plugins")
sys.path.insert(0, os.path.join(PLUGINS_PATH))

[
    sys.path.insert(0, os.path.join(PLUGINS_PATH, ele))
    for ele in os.listdir(PLUGINS_PATH)
    if os.path.isdir(os.path.join(PLUGINS_PATH, ele)) and not ele.startswith("__")
]
```

### 插件注册

在 `application/settings.py` 的 `INSTALLED_APPS` 中注册：

```python
INSTALLED_APPS = [
    # ...
    "dvadmin3_flow",
]
```

---

## 插件开发规范

### 目录结构

```
pluginName/
├── __init__.py
├── apps.py
├── models.py
├── urls.py
├── views/
├── templates/
├── static/
├── fixtures/
├── migrations/
└── CLAUDE.md
```

### 必需文件

- `__init__.py` - 包初始化文件
- `apps.py` - Django App 配置
- `models.py` - 数据模型
- `urls.py` - 路由配置

---

## 常见问题 (FAQ)

### 1. 如何创建新插件？

1. 在 `plugins/` 下创建目录
2. 初始化 Django App
3. 在 `settings.py` 中注册
4. 配置路由

### 2. 如何更新插件？

插件会自动重新加载，无需额外配置。

---

## 面包屑导航

```
[根目录] (../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../CLAUDE.md)
       └─ [backend] (../CLAUDE.md)
            └─ [plugins] (./)
```
