[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/components**

---

# Components 通用组件

> 最后更新：2026-01-25 19:50:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 19:50:00 | 深度分析组件库架构，更新文档 | Claude AI |
| 2026-01-25 14:09:00 | 初始化 components 文档 | Claude AI |

---

## 模块职责

提供通用的 Vue 组件，包括权限控制、表单控件、文件上传、编辑器等可复用组件。

---

## 组件列表

### 权限组件 (auth/)

| 组件 | 说明 | 使用方式 |
|------|------|----------|
| `auth.vue` | 权限控制组件 | `<auth value="system:user:add">` |
| `v-auth` | 权限指令 | `v-auth="'system:user:edit'"` |

**功能：** 根据用户权限显示/隐藏元素

### 头像选择器 (avatarSelector/)

| 组件 | 说明 |
|------|------|
| `avatarSelector.vue` | 头像上传与裁剪组件 |

### 日历组件 (calendar/)

| 组件 | 说明 |
|------|------|
| `calendar.vue` | 日历选择组件 |

### 裁剪组件 (cropper/)

| 组件 | 说明 |
|------|------|
| `cropper.vue` | 图片裁剪组件 |

### 部门格式化 (dept-format/)

| 组件 | 说明 |
|------|------|
| `dept-format.vue` | 部门信息格式化显示 |

### 选择器组件 (dvaSelect/)

| 组件 | 说明 |
|------|------|
| `dva-select.vue` | 通用下拉选择器 |

### 编辑器组件 (editor/)

| 组件 | 说明 |
|------|------|
| `editor.vue` | 富文本编辑器（WangEditor） |

### 文件选择器 (fileSelector/)

| 组件 | 说明 |
|------|------|
| `fileSelector.vue` | 文件上传选择组件 |

### 外键选择器 (foreignKey/)

| 组件 | 说明 |
|------|------|
| `foreignKey.vue` | 外键关联选择器 |

### 图标选择器 (iconSelector/)

| 组件 | 说明 |
|------|------|
| `iconSelector.vue` | 图标选择组件 |

### Excel 导入 (importExcel/)

| 组件 | 说明 |
|------|------|
| `importExcel.vue` | Excel 导入组件 |

### 表格组件 (table/)

| 组件 | 说明 |
|------|------|
| `table.vue` | 通用表格组件 |

---

## 核心组件详解

### auth 权限组件

**使用方式：**

```vue
<!-- 组件方式 -->
<auth value="system:user:add">
  <el-button>添加用户</el-button>
</auth>

<!-- 指令方式 -->
<el-button v-auth="'system:user:edit'">编辑</el-button>

<!-- 函数方式 -->
<el-button v-if="hasPermi('system:user:delete')">删除</el-button>
```

**权限标识格式：** `模块:功能:操作`

### editor 富文本编辑器

**功能：**
- 基于 WangEditor
- 支持图片上传
- 支持代码高亮
- 支持表格编辑

**使用方式：**

```vue
<editor v-model="content" :height="300" />
```

### fileSelector 文件选择器

**功能：**
- 支持多文件上传
- 支持文件类型限制
- 支持文件大小限制
- 支持拖拽上传

**使用方式：**

```vue
<file-selector
  v-model="fileList"
  :multiple="true"
  :accept="['image/*', '.pdf']"
/>
```

---

## 组件使用规范

### 全局注册

部分组件已在全局注册，可直接使用：

```vue
<template>
  <auth value="user:add">
    <el-button>添加</el-button>
  </auth>
</template>
```

### 局部注册

未全局注册的组件需要手动导入：

```vue
<script setup>
import FileSelector from '@/components/fileSelector/index.vue';
</script>

<template>
  <FileSelector v-model="files" />
</template>
```

---

## 组件通信

### Props

```typescript
interface Props {
  modelValue: any;
  disabled?: boolean;
  placeholder?: string;
}
```

### Emits

```typescript
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();
```

---

## 常见问题 (FAQ)

### 1. 如何创建新的组件？

```vue
<!-- components/myComponent/index.vue -->
<template>
  <div class="my-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}
const props = defineProps<Props>();
</script>
```

### 2. 如何实现双向绑定？

```vue
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const updateValue = (value: any) => {
  emit('update:modelValue', value);
};
</script>
```

### 3. 如何使用插槽？

```vue
<!-- 组件定义 -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<!-- 使用组件 -->
<my-component>
  <template #header>头部</template>
  默认内容
  <template #footer>底部</template>
</my-component>
```

---

## 相关文件清单

### 组件目录

| 目录 | 说明 |
|------|------|
| `auth/` | 权限组件 |
| `editor/` | 编辑器组件 |
| `fileSelector/` | 文件选择器 |
| `iconSelector/` | 图标选择器 |
| `importExcel/` | Excel 导入 |
| `table/` | 表格组件 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [components] (./)
```
