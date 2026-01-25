[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/views**

---

# Views 页面视图

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 views 文档 | Claude AI |

---

## 模块职责

存放所有页面视图组件，包括系统管理页面和插件页面。

---

## 目录结构

```
views/
├── login/               # 登录页
├── home/                # 首页
├── system/              # 系统管理页面
│   ├── user/           # 用户管理
│   ├── role/           # 角色管理
│   ├── dept/           # 部门管理
│   ├── menu/           # 菜单管理
│   ├── dictionary/     # 字典管理
│   ├── areas/          # 地区管理
│   ├── fileList/       # 文件管理
│   ├── config/         # 系统配置
│   ├── columns/        # 列权限管理
│   ├── messageCenter/  # 消息中心
│   ├── personal/       # 个人中心
│   └── log/            # 日志管理
└── plugins/            # 插件页面
```

---

## 系统页面

### 登录页 (login/)

**功能：**
- 用户登录
- 验证码验证
- 记住密码
- 忘记密码

**文件：**
- `index.vue` - 登录主页面
- `components/` - 登录相关组件

### 首页 (home/)

**功能：**
- 数据概览
- 快捷操作
- 统计图表

**文件：**
- `index.vue` - 首页主组件

### 用户管理 (system/user/)

**功能：**
- 用户列表
- 用户新增/编辑/删除
- 用户导入/导出
- 密码重置
- 角色分配

**文件：**
- `index.vue` - 用户管理页面
- `components/` - 用户相关组件
- `api.ts` - 用户 API

### 角色管理 (system/role/)

**功能：**
- 角色列表
- 角色新增/编辑/删除
- 菜单权限分配
- 数据权限分配

**文件：**
- `index.vue` - 角色管理页面
- `components/` - 角色相关组件
- `api.ts` - 角色 API

### 部门管理 (system/dept/)

**功能：**
- 部门树形结构
- 部门新增/编辑/删除
- 部门排序

**文件：**
- `index.vue` - 部门管理页面
- `api.ts` - 部门 API

### 菜单管理 (system/menu/)

**功能：**
- 菜单树形结构
- 菜单新增/编辑/删除
- 菜单排序
- 按钮权限配置
- 字段权限配置

**文件：**
- `index.vue` - 菜单管理页面
- `components/` - 菜单相关组件
- `api.ts` - 菜单 API

### 字典管理 (system/dictionary/)

**功能：**
- 字典类型管理
- 字典数据管理
- 字典缓存刷新

**文件：**
- `index.vue` - 字典管理页面
- `api.ts` - 字典 API

### 地区管理 (system/areas/)

**功能：**
- 省市区数据管理
- 地区数据导入

**文件：**
- `index.vue` - 地区管理页面
- `api.ts` - 地区 API

### 文件管理 (system/fileList/)

**功能：**
- 文件列表
- 文件上传
- 文件删除
- 文件预览

**文件：**
- `index.vue` - 文件管理页面
- `api.ts` - 文件 API

### 系统配置 (system/config/)

**功能：**
- 系统参数配置
- 配置项管理

**文件：**
- `index.vue` - 系统配置页面
- `api.ts` - 配置 API

### 列权限管理 (system/columns/)

**功能：**
- 字段权限配置
- 列显示控制

**文件：**
- `index.vue` - 列权限管理页面
- `api.ts` - 列权限 API

### 消息中心 (system/messageCenter/)

**功能：**
- 消息列表
- 消息详情
- 消息标记
- 实时推送

**文件：**
- `index.vue` - 消息中心页面
- `components/` - 消息相关组件
- `api.ts` - 消息 API

### 个人中心 (system/personal/)

**功能：**
- 个人信息
- 修改密码
- 头像上传

**文件：**
- `index.vue` - 个人中心页面
- `components/` - 个人相关组件
- `api.ts` - 个人 API

### 日志管理 (system/log/)

**功能：**
- 登录日志
- 操作日志
- 日志查询
- 日志导出

**文件：**
- `loginLog.vue` - 登录日志页面
- `operationLog.vue` - 操作日志页面
- `api.ts` - 日志 API

---

## 插件页面 (plugins/)

**功能：**
- 动态加载插件页面
- 插件路由匹配

**说明：** 插件页面由后端动态配置，前端根据路由动态加载。

---

## 页面开发规范

### 文件结构

```
pageName/
├── index.vue           # 主页面
├── components/         # 页面组件
│   └── ...
└── api.ts             # 页面 API
```

### 页面模板

```vue
<template>
  <div class="page-container">
    <!-- 页面内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as api from './api';

const dataList = ref([]);

onMounted(async () => {
  const res = await api.getList();
  dataList.value = res.data;
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}
</style>
```

---

## CRUD 快速开发

### 使用 fast-crud

```vue
<template>
  <fs-crud ref="crudRef" v-bind="crudBinding">
    <template #actionbar="scope">
      <!-- 工具栏 -->
    </template>
  </fs-crud>
</template>

<script setup>
import { useCrud, useFs } from '@fast-crud/fast-crud';
import * as api from './api';

const { crudBinding, crudRef, crudExpose } = useFs({
  crudOptions: {
    request: {
      pageRequest: api.getList,
      addRequest: api.add,
      editRequest: api.edit,
      delRequest: api.del,
    },
    columns: {
      // 列配置
    },
  },
});
</script>
```

---

## 常见问题 (FAQ)

### 1. 如何创建新页面？

1. 在 `views/` 下创建页面目录
2. 创建 `index.vue` 文件
3. 在路由中注册

### 2. 如何使用权限控制？

```vue
<auth value="system:user:add">
  <el-button>添加用户</el-button>
</auth>
```

### 3. 如何调用 API？

```typescript
import * as api from './api';

const getList = async () => {
  const res = await api.getList({ page: 1, pageSize: 10 });
};
```

### 4. 如何使用表格组件？

使用 `fast-crud` 或 Element Plus Table：

```vue
<el-table :data="dataList">
  <el-table-column prop="name" label="名称"></el-table-column>
</el-table>
```

---

## 相关文件清单

### 页面目录

| 目录 | 说明 |
|------|------|
| `login/` | 登录页 |
| `home/` | 首页 |
| `system/` | 系统管理页面 |
| `plugins/` | 插件页面 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [views] (./)
```
