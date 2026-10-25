# Django-Vue3-Admin i18n 多语言配置指南

## 目录

1. [概述](#1-概述)
2. [技术架构](#2-技术架构)
3. [后端国际化配置](#3-后端国际化配置)
4. [前端国际化架构](#4-前端国际化架构)
5. [翻译文件结构](#5-翻译文件结构)
6. [快速上手：3步添加新页面翻译](#6-快速上手3步添加新页面翻译)
7. [菜单多语言配置](#7-菜单多语言配置)
8. [语言切换机制](#8-语言切换机制)
9. [后端 API 国际化](#9-后端-api-国际化)
10. [常见问题](#10-常见问题)

---

## 1. 概述

Django-Vue3-Admin 内置了完整的多语言（i18n）支持，覆盖前端和后端两个层面：

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| 前端 | vue-i18n 9.x | Vue 3 组件翻译、模板翻译 |
| 前端组件 | Element Plus 内置 i18n | UI 组件语言适配 |
| 前端 CRUD | @fast-crud 国际化 | 表格搜索/重置/分页等 |
| 后端 | Django gettext | Python 字符串国际化 |
| 后端模型 | 数据库字段 | 菜单/按钮多语言名称存储 |

**支持的语言：**

| 语言 | 前端代码 | Django 语言代码 |
|------|----------|-----------------|
| 简体中文 | `zh-cn` | `zh-hans` |
| English | `en` | `en` |
| 繁体中文 | `zh-tw` | `zh-hant` |

---

## 2. 技术架构

### 2.1 前端架构

```
web/src/i18n/
├── index.ts          # vue-i18n 初始化配置
├── lang/             # 全局通用翻译（顶栏、页脚、路由等）
│   ├── zh-cn.ts
│   ├── en.ts
│   └── zh-tw.ts
├── pages/            # 页面级翻译（按模块划分）
│   ├── login/
│   ├── user/
│   ├── role/
│   ├── menu/
│   ├── taskManage/   # 任务调度
│   ├── taskLog/      # 任务日志
│   └── ...
└── fs/               # fast-crud 繁体中文补充
    └── zh-tw.ts
```

**自动加载机制：** `web/src/i18n/index.ts` 使用 Vite 的 `import.meta.glob` 自动扫描 `lang/` 和 `pages/` 下所有 `.ts` 文件，按文件名（`zh-cn`、`en`、`zh-tw`）自动归类合并，无需手动 import。

### 2.2 后端架构

```
backend/
├── application/settings.py    # Django i18n 配置（LANGUAGES, LOCALE_PATHS）
├── dvadmin/locale/           # .po/.mo 翻译文件（需手动编译）
│   ├── zh-hans/LC_MESSAGES/django.po
│   ├── en/LC_MESSAGES/django.po
│   └── zh-hant/LC_MESSAGES/django.po
└── dvadmin/**/models.py      # 菜单/按钮模型含 name_en/name_zh_tw 字段
```

---

## 3. 后端国际化配置

### 3.1 Django Settings

参考 `backend/application/settings.py`：

```python
# Internationalization
LANGUAGE_CODE = "zh-hans"  # 默认语言

USE_I18N = True

# 支持的语言列表 — 前端代码映射到 Django locale 名
LANGUAGES = [
    ('zh-hans', 'Simplified Chinese'),
    ('en', 'English'),
    ('zh-hant', 'Traditional Chinese'),
]

# .po/.mo 翻译文件路径
LOCALE_PATHS = [
    os.path.join(BASE_DIR, "locale"),
]
```

### 3.2 中间件

在 `MIDDLEWARE` 中添加 `LocaleMiddleware`：

```python
MIDDLEWARE = [
    # ... 其他中间件
    "dvadmin.utils.middleware.LocaleMiddleware",
]
```

此中间件根据请求头 `Accept-Language` 或用户语言偏好自动设置当前语言。

---

## 4. 前端国际化架构

`web/src/i18n/index.ts` 是整个前端 i18n 的核心：

```typescript
import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
    legacy: false,           // 使用 Composition API 模式
    locale: themeConfig.value.globalI18n,   // 当前语言
    fallbackLocale: ['zh-CN', 'en', 'zh-TW'],  # 回退链
    messages,                // 自动加载合并的消息对象
});
```

### 翻译 key 命名规范

统一采用 **命名空间嵌套** 模式，层级为：

```
message.pages.<module>.<section>.<key>
```

| 层级 | 示例 | 说明 |
|------|------|------|
| `message` | `message.*` | 顶层命名空间 |
| `pages` | `message.pages.*` | 页面级翻译 |
| `<module>` | `message.pages.user.*` | 按功能模块划分 |
| `<section>` | `message.pages.user.form.*` | 表单、表格、按钮等 |
| `<key>` | `message.pages.user.form.name` | 具体翻译 key |

---

## 5. 翻译文件结构

### 5.1 全局翻译（lang/）

`web/src/i18n/lang/zh-cn.ts` 存放全局通用翻译，供所有页面共享：

```typescript
export default {
    message: {
        router: {
            home: '首页',
            system: '系统管理',
            systemUser: '用户管理',
        },
        common: {
            logoutPrompt: '你已被登出，请重新登录',
            networkError: '网络连接错误',
            weekday: {
                sunday: '日', monday: '一', /* ... */
            },
        },
        components: {
            table: {
                noData: '暂无数据',
                delete: '删除',
            },
            fileSelector: {
                image: '图片',
                upload: '上传{type}',
            },
        },
    },
};
```

### 5.2 页面级翻译（pages/）

每个页面/模块有自己独立的翻译文件目录：

```
web/src/i18n/pages/<module>/
├── zh-cn.ts    # 简体中文
├── en.ts       # 英文
└── zh-tw.ts    # 繁体中文
```

示例：`web/src/i18n/pages/menu/zh-cn.ts`

```typescript
export default {
    message: {
        pages: {
            menu: {
                table: {
                    columns: {
                        menuName: '菜单名称',
                        icon: '图标',
                    },
                },
                form: {
                    menuName: '菜单名称',
                    menuNameZhCn: '简体中文',
                    menuNameEn: '英文名称',
                    menuNameZhTw: '繁体中文',
                    menuNameZhCnPlaceholder: '请输入简体中文名称（必填）',
                    menuNameEnPlaceholder: '请输入英文名称（选填）',
                    menuNameZhTwPlaceholder: '请输入繁体中文名称（选填）',
                    path: '路由地址',
                    enabled: '启用',
                    disabled: '禁用',
                },
                buttons: {
                    save: '保存',
                    cancel: '取消',
                },
            },
        },
    },
};
```

---

## 6. 快速上手：3步添加新页面翻译

假设要为新模块 `product`（商品管理）添加 i18n 支持：

### 第 1 步：创建翻译文件

```bash
mkdir -p web/src/i18n/pages/product
```

创建 `web/src/i18n/pages/product/zh-cn.ts`：

```typescript
export default {
    message: {
        pages: {
            product: {
                table: {
                    columns: {
                        name: '商品名称',
                        price: '价格',
                        stock: '库存',
                    },
                },
                form: {
                    name: '商品名称',
                    price: '价格',
                    namePlaceholder: '请输入商品名称',
                },
                buttons: {
                    add: '新增',
                    edit: '编辑',
                    delete: '删除',
                },
                messages: {
                    addSuccess: '新增成功',
                    deleteSuccess: '删除成功',
                },
            },
        },
    },
};
```

复制为 `en.ts` 和 `zh-tw.ts`，替换翻译值。

### 第 2 步：在 Vue 组件中引入

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <el-table :data="tableData">
        <el-table-column :label="t('message.pages.product.table.columns.name')" prop="name" />
        <el-table-column :label="t('message.pages.product.table.columns.price')" prop="price" />
    </el-table>
</template>
```

### 第 3 步：使用 Fast-Crud 时在 crud.tsx 中引入

```typescript
// src/views/product/crud.tsx
import { useI18n } from 'vue-i18n';

export const createCrudOptions = function ({ crudExpose }): CreateCrudOptionsRet {
    const { t } = useI18n();

    return {
        columns: {
            name: {
                title: t('message.pages.product.table.columns.name'),
                search: { show: true },
                type: 'input',
            },
        },
    };
};
```

> **自动加载：** 翻译文件创建后，无需在 `index.ts` 中手动 import。Vite 的 `import.meta.glob` 会自动扫描并按文件名归类合并。重启开发服务器后生效。

---

## 7. 菜单多语言配置

### 7.1 数据模型

`Menu` 和 `MenuButton` 模型支持三个语言字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | CharField | 默认语言名称（中文） |
| `name_en` | CharField | 英文名称（可选） |
| `name_zh_tw` | CharField | 繁体中文名称（可选） |

数据库迁移已完成（`0002_add_menu_i18n_fields`、`0004_add_menubutton_i18n_fields`）。

### 7.2 菜单表单

`web/src/views/system/menu/components/MenuFormCom/index.vue` 提供了 **Tab 界面**配置三种语言的菜单名称：![image-20260408112840773](https://images-warehouse.oss-cn-hangzhou.aliyuncs.com/img/202604081128029.png)

编辑现有菜单时，已保存的 `name_en` / `name_zh_tw` 会自动回填到对应 Tab。

### 7.3 后端序列化

`MenuCreateSerializer` 和 `MenuSerializer` 均通过 `fields = "__all__"` 自动包含 `name_en` / `name_zh_tw` 字段，API 接口无需额外修改。

### 7.4 前端渲染

`WebRouterSerializer` 的 `get_title()` 方法根据当前语言自动返回对应名称：

```python
def get_title(self, obj):
    lang = getattr(self.request, 'language', None)
    if lang == 'en':
        return obj.name_en or obj.name
    elif lang in ('zh-hant', 'zh-TW'):
        return obj.name_zh_tw or obj.name
    return obj.name
```

---

## 8. 语言切换机制

### 8.1 切换流程

```
用户点击顶栏语言下拉
        ↓
前端更新 localStorage('themeConfig').globalI18n
        ↓
调用 PUT /api/system/user/update_language/ 同步到后端（可选）
        ↓
前端刷新 i18n locale → 页面自动重新渲染
```

### 8.2 API 接口

```
PUT /api/system/user/update_language/
Content-Type: application/json

{
    "language": "en"
}
```

后端保存到用户记录，前端请求时带上 `Accept-Language` 头，后端中间件自动识别。

### 8.3 顶栏切换组件

语言切换下拉在 `web/src/layout/navBars/breadcrumb/user.vue`，使用 `message.user.langZhCn` / `langEn` / `langTw` 等 i18n key 显示语言选项名称。

---

## 9. 后端 API 国际化

### 9.1 gettext 基本用法

```python
from django.utils.translation import gettext_lazy as _

class MySerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        return {
            'message': _('Operation successful'),  # 将被翻译
        }
```

### 9.2 翻译文件工作流

```bash
# 1. 在 Python 代码中使用 gettext_lazy
# _() 包裹需要翻译的字符串

# 2. 提取翻译字符串到 .po 文件
django-admin makemessages -l en

# 3. 编辑 .po 文件，填写翻译
# web/src/locale/en/LC_MESSAGES/django.po

# 4. 编译 .mo 文件（Django 运行时读取 .mo）
django-admin compilemessages
```

### 9.3 .po 文件位置

```
backend/dvadmin/locale/
├── zh-hans/LC_MESSAGES/django.po
├── en/LC_MESSAGES/django.po
└── zh-hant/LC_MESSAGES/django.po
```

### 9.4 DRF 错误消息国际化

DRF 的验证错误消息可通过 `rest_framework.views.exception_handler` 统一处理，返回翻译后的消息。

---

## 10. 常见问题

### Q1: 新建的翻译文件没有生效？

**原因：** Vite 开发服务器需要重启才能扫描新增文件。

**解决：** 重启前端开发服务器（`pnpm dev`）。

### Q2: 某个页面的翻译 key 报 `missingWarn` 警告？

**原因：** 翻译 key 尚无对应翻译值（当前语言或其他语言文件中缺失）。

**解决：** 在 `web/src/i18n/pages/<module>/` 下三个语言文件中都添加该 key。

### Q3: 语言切换后部分内容仍是旧语言？

**原因：** 可能是组件使用了纯 JavaScript 字符串（非 t() 调用），或 Pinia store 中的数据未随 i18n 刷新。

**解决：** 确保所有用户可见文本都通过 `t()` 函数获取，动态内容使用 `watch` 监听 `globalI18n` 变化重新加载。

### Q4: 后端 .po 文件修改后需要重启吗？

**不需要。** 只要编译了 .mo 文件（`django-admin compilemessages`），Django 运行时直接读取 .mo，无需重启服务。

### Q5: 如何添加第四种语言？

1. **后端：** 在 `settings.py` 的 `LANGUAGES` 列表中添加语言代码，在 `backend/dvadmin/locale/` 下创建对应目录和 `.po` 文件
2. **前端：** 在 `web/src/i18n/` 下创建对应的翻译文件，在 `i18n/index.ts` 的 `import.meta.glob` 自动归类逻辑中添加该语言的 Element Plus locale
3. **顶栏下拉：** 在 `web/src/layout/navBars/breadcrumb/user.vue` 中添加语言选项

### Q6: 数据库迁移报错找不到 `name_en` / `name_zh_tw` 列？

**原因：** 数据库迁移未执行。

**解决：**

```bash
cd backend
python manage.py migrate system 0002_add_menu_i18n_fields      # 菜单表
python manage.py migrate system 0004_add_menubutton_i18n_fields  # 按钮表
```

---

## 相关文件索引

| 文件 | 说明 |
|------|------|
| `web/src/i18n/index.ts` | vue-i18n 初始化，自动加载翻译文件 |
| `web/src/i18n/lang/zh-cn.ts` | 全局中文翻译 |
| `web/src/i18n/lang/en.ts` | 全局英文翻译 |
| `web/src/i18n/lang/zh-tw.ts` | 全局繁体翻译 |
| `web/src/i18n/pages/` | 各页面独立翻译文件目录 |
| `web/src/views/system/menu/components/MenuFormCom/` | 菜单多语言表单组件 |
| `backend/application/settings.py` | Django i18n 配置（LANGUAGES、LOCALE_PATHS） |
| `backend/dvadmin/system/models.py` | Menu/MenuButton 模型，含 name_en/name_zh_tw 字段 |
| `backend/dvadmin/system/views/menu.py` | MenuSerializer、WebRouterSerializer（含语言感知 title） |
| `backend/dvadmin/system/views/user.py` | update_language API 端点 |
| `backend/dvadmin/locale/` | Django .po/.mo 翻译文件目录 |
| `web/src/layout/navBars/breadcrumb/user.vue` | 语言切换下拉组件 |
