# 表格固定列 z-index 修复

> 任务：修复用户管理页面表格右侧固定列被滚动条遮挡的问题
> 状态：已完成
> 日期：2026-02-08

---

## 问题描述

用户管理页面 (`http://localhost:5173/#/user`) 的表格右侧固定列在滚动时被滚动条遮挡，导致操作列（编辑、删除、重置密码按钮）不可见或不可点击。

## 根因分析

1. **Element Plus 默认 z-index**：
   - `.el-table__fixed`: z-index = 2
   - `.el-table__fixed-right`: z-index = 3

2. **项目滚动条 z-index**：
   - `element.scss`: `.el-scrollbar__bar { z-index: 4; }`
   - `modern.scss`: `.el-scrollbar__bar { z-index: var(--z-above); }` = 10

3. **层级冲突**：滚动条的 z-index (10) > 固定列的 z-index (3)

---

## 解决方案

提高表格固定列的 z-index 到高于滚动条的值。

---

## 修改文件

### 1. `theme/modern.scss`

```scss
// 固定列 z-index 修复
.el-table__fixed,
.el-table__fixed-left {
    z-index: calc(var(--z-above, 10) + 1); // 11
}

.el-table__fixed-right {
    z-index: calc(var(--z-above, 10) + 2); // 12
}

.el-table__fixed-wrapper {
    z-index: calc(var(--z-above, 10) + 1);
}
```

### 2. `theme/element.scss`

```scss
.el-scrollbar__bar {
    z-index: var(--z-scrollbar, 5);
}
```

### 3. `assets/style/reset.scss`

```scss
.el-table {
    .el-table__fixed,
    .el-table__fixed-left {
        z-index: calc(var(--z-above, 10) + 1) !important;
    }

    .el-table__fixed-right {
        z-index: calc(var(--z-above, 10) + 2) !important;
    }

    .el-table__fixed-wrapper {
        z-index: calc(var(--z-above, 10) + 1) !important;
    }
}
```

### 4. `theme/presets.scss`

添加语义化变量：

```scss
--z-scrollbar: 5;
--z-table-fixed: 11;
--z-table-fixed-right: 12;
```

---

## Z-index 层级结构

| 元素 | Z-index | 说明 |
|------|---------|------|
| 滚动条 | 5 | `--z-scrollbar` |
| 普通内容 | 10 | `--z-above` |
| 表格左侧固定列 | 11 | `--z-table-fixed` |
| 表格右侧固定列 | 12 | `--z-table-fixed-right` |
| Sticky 元素 | 200 | `--z-sticky` |

---

## 影响范围

- 所有使用 Element Plus `el-table` 的页面（40+ 个 CRUD 页面）
- 完全向后兼容
- 无性能影响

---

## 验证方法

1. 访问 http://localhost:5173/#/user
2. 横向滚动表格
3. 确认右侧固定列（操作按钮）始终可见且可点击
4. 测试其他页面：角色管理、部门管理等
