# DVAdmin 前端开发技能

> Vue 3.4.38 + TypeScript 4.9.4 + Element Plus 2.8.0
> 专注管理后台前端开发

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.38 | Composition API |
| TypeScript | 4.9.4 | 严格模式 |
| Element Plus | 2.8.0 | UI 组件库 |
| Pinia | 2.0.28 | 状态管理 |
| @fast-crud/fast-crud | 1.21.2 | 快速 CRUD |

---

## 组件规范

```vue
<template>
  <div class="page-container">
    <auth value="system:user:add">
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </auth>
    
    <el-table v-loading="loading" :data="tableData">
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-auth="'system:user:edit'" link @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="UserList">
import { ref, onMounted } from 'vue'
import { userApi } from '@/api/system/user'
import { hasPermi } from '@/utils/authFunction'

const loading = ref(false)
const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  const res = await userApi.getList()
  tableData.value = res.data.data
  loading.value = false
}

onMounted(() => fetchData())
</script>
```

---

## 权限控制

```vue
<!-- 组件方式 -->
<auth value="system:user:add">
  <el-button>添加</el-button>
</auth>

<!-- 指令方式 -->
<el-button v-auth="'system:user:edit'">编辑</el-button>

<!-- 函数方式 -->
<script setup>
import { hasPermi } from '@/utils/authFunction'
if (hasPermi('system:user:delete')) { /* ... */ }
</script>
```

---

## API 请求

```typescript
// src/api/blog/article.ts
import { request } from '@/utils/service'

export const articleApi = {
  getList: (params?) => request({ url: '/blog/article/', method: 'get', params }),
  create: (data) => request({ url: '/blog/article/', method: 'post', data }),
  update: (id, data) => request({ url: `/blog/article/${id}/`, method: 'put', data }),
  delete: (id) => request({ url: `/blog/article/${id}/`, method: 'delete' }),
}
```

---

## 状态管理

```typescript
// stores/blog.ts
import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  state: () => ({ articles: [] }),
  actions: {
    async fetchArticles() {
      const res = await articleApi.getList()
      this.articles = res.data.data
    },
  },
})
```

---

## Fast CRUD

```typescript
import { useCrud } from '@fast-crud/fast-crud'

const { crudBinding, crudRef } = useCrud({
  crudOptions: {
    request: {
      pageRequest: articleApi.getList,
      addRequest: ({ form }) => articleApi.create(form),
      editRequest: ({ form }) => articleApi.update(form.id, form),
      delRequest: ({ row }) => articleApi.delete(row.id),
    },
    columns: {
      title: { title: '标题', type: 'text', search: { show: true } },
      status: { title: '状态', type: 'dict-switch' },
    },
  },
})
```

---

## 主题系统

```typescript
import { applyThemePreset } from '@/utils/themePresets'

applyThemePreset('forest')  // 森之绿
applyThemePreset('dark')    // 深色模式
// 可用: serenity, forest, twilight, sunset, ocean, rose, lemon, graphite, dark
```

---

## 开发命令

```bash
cd django-vue3-admin-master/web
yarn install
yarn run dev      # http://localhost:8080
yarn run build    # 生产构建
```

---

## 注意事项

- 使用 `<script setup lang="ts">`
- 权限用 `<auth>` 或 `v-auth`
- 样式用 CSS 变量
- API 用 `@/utils/service`
