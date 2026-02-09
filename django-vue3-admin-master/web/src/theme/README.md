# DVAdmin 现代化主题集成指南

> 最后更新：2026-02-08
> 适用于：DVAdmin v3.2.0+

---

## 快速开始

### 方式一：完全替换（推荐）

1. **备份原有文件**
```bash
# 备份原有的 index.scss
cp web/src/theme/index.scss web/src/theme/index.scss.backup
```

2. **替换主题入口文件**
```bash
# 将 index-new.scss 复制为 index.scss
cp web/src/theme/index-new.scss web/src/theme/index.scss
```

3. **重启开发服务器**
```bash
cd web
yarn run dev
```

### 方式二：手动集成

编辑 `web/src/theme/index.scss`，在文件最顶部添加：

```scss
// ===== 现代化主题系统 =====
@use './presets.scss';
@use './modern.scss';
@use './layout-theme.scss';

// ===== 原有样式 =====
@use './app.scss';
@use './common/transition.scss';
@use './other.scss';
@use './element.scss';
@use './media/media.scss';
@use './waves.scss';
@use './dark.scss';
@use './fa/css/font-awesome.min.css';
```

---

## 使用主题设置组件

### 1. 在顶栏工具栏添加主题设置按钮

编辑 `web/src/layout/navBars/index.vue` 或相关文件：

```vue
<template>
  <div class="layout-navbars-tools">
    <!-- 其他工具按钮 -->

    <!-- 主题设置按钮 -->
    <el-tooltip content="主题设置" placement="bottom">
      <div class="tools-item" @click="openThemeSettings">
        <el-icon><Setting /></el-icon>
      </div>
    </el-tooltip>
  </div>

  <!-- 主题设置抽屉 -->
  <theme-settings v-model="themeSettingsVisible" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from '@element-plus/icons-vue';
import ThemeSettings from '@/components/ThemeSettings/index.vue';

const themeSettingsVisible = ref(false);

const openThemeSettings = () => {
  themeSettingsVisible.value = true;
};
</script>
```

### 2. 在设置面板中集成

如果你的项目有设置面板，可以直接使用主题预设选择器：

```vue
<template>
  <div class="settings-panel">
    <div class="settings-section">
      <h3>外观设置</h3>
      <theme-preset-selector
        v-model="currentTheme"
        @change="handleThemeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThemePresetSelector from '@/components/ThemePresetSelector/index.vue';

const currentTheme = ref('serenity');

const handleThemeChange = (preset) => {
  console.log('主题已切换:', preset);
};
</script>
```

---

## 可用的组件

### ThemePresetSelector - 主题预设选择器

```vue
<theme-preset-selector
  v-model="currentTheme"
  title="选择主题"
  description="快速切换整体外观"
  :show-dark="true"
  @change="handleChange"
/>
```

**Props:**
- `v-model`: 当前选中的预设键名
- `title`: 标题
- `description`: 描述
- `showDark`: 是否显示深色模式预设

### ThemeColorPicker - 颜色选择器

```vue
<theme-color-picker
  v-model="primaryColor"
  title="主题颜色"
  description="自定义主色调"
  :presets="['#2563eb', '#059669', '#7c3aed']"
  @change="handleColorChange"
/>
```

**Props:**
- `v-model`: 当前颜色值
- `title`: 标题
- `description`: 描述
- `presets`: 预设颜色数组
- `maxHistory`: 最大历史记录数

### ThemeSettings - 主题设置面板

```vue
<theme-settings
  v-model="visible"
  @change="handleSettingsChange"
/>
```

**Props:**
- `v-model`: 抽屉显示状态

---

## 编程式使用

### 切换主题预设

```typescript
import { applyThemePreset } from '@/utils/themePresets';

// 切换到森之绿主题
applyThemePreset('forest');

// 切换到深色模式
applyThemePreset('dark');
```

### 设置自定义颜色

```typescript
const root = document.documentElement;

// 设置主色
root.style.setProperty('--primary-base', '#ff6b6b');

// 切换深色模式
root.setAttribute('data-theme', 'dark');
root.removeAttribute('data-theme'); // 关闭深色模式
```

### 获取当前主题

```typescript
import { getCurrentPresetKey } from '@/utils/themePresets';

const currentPreset = getCurrentPresetKey();
console.log('当前主题:', currentPreset); // 'serenity', 'forest', etc.
```

---

## CSS 变量速查

### 主色调
```scss
--primary-base      /* 主色 #2563eb */
--primary-hover     /* 悬浮 #1d4ed8 */
--primary-active    /* 激活 #1e40af */
--primary-light     /* 浅色 #3b82f6 */
```

### 背景色
```scss
--bg-page       /* 页面背景 */
--bg-surface    /* 表面背景 */
--bg-hover      /* 悬浮背景 */
--bg-active     /* 激活背景 */
```

### 文字色
```scss
--text-primary    /* 主要文字 */
--text-secondary  /* 次要文字 */
--text-muted      /* 静音文字 */
```

### 间距
```scss
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-6: 24px
```

### 圆角
```scss
--radius-md: 6px
--radius-lg: 8px
--radius-xl: 12px
```

### 阴影
```scss
--shadow-sm
--shadow-md
--shadow-lg
--shadow-focus
```

---

## 主题预设列表

| 键名 | 名称 | 主色 |
|------|------|------|
| `serenity` | 静谧蓝 | #2563eb |
| `forest` | 森之绿 | #059669 |
| `twilight` | 暮光紫 | #7c3aed |
| `sunset` | 日落橙 | #ea580c |
| `ocean` | 海洋青 | #0891b2 |
| `rose` | 玫瑰红 | #e11d48 |
| `lemon` | 柠檬黄 | #ca8a04 |
| `graphite` | 石墨灰 | #374151 |
| `dark` | 深色模式 | - |

---

## 故障排除

### 问题 1: 样式没有生效

**解决方案:**
1. 确保按照正确的顺序引入样式文件
2. 清除浏览器缓存并强制刷新 (Ctrl+Shift+R)
3. 检查 `presets.scss` 是否在 `element.scss` 之前引入

### 问题 2: 深色模式下样式异常

**解决方案:**
1. 确保 `dark.scss` 在最后引入
2. 检查是否有其他样式覆盖了深色模式变量
3. 尝试在浏览器开发者工具中检查 `data-theme` 属性

### 问题 3: 组件样式与预期不符

**解决方案:**
1. 检查 Element Plus 版本是否为 2.8.0+
2. 确认 `modern.scss` 已正确引入
3. 使用浏览器开发者工具检查 CSS 变量值

### 问题 4: 想回滚到原有样式

**解决方案:**
```bash
# 恢复备份
cp web/src/theme/index.scss.backup web/src/theme/index.scss

# 或者手动编辑 index.scss，移除新增的引入
```

---

## 更新日志

### v1.0.0 (2026-02-08)

- 🎉 初始版本发布
- ✨ 新增主题预设系统
- ✨ 新增 8 种预设主题
- ✨ 新增现代化组件样式覆盖
- ✨ 新增布局主题样式
- ✨ 新增主题设置组件
- ✨ 支持深色模式
- ✨ 支持自定义颜色
- ✨ 支持配置导入导出

---

## 支持

如有问题或建议，请访问：
- 项目文档: `E:\project\dvadmin\.claude\plan\前端样式与配色实施方案.md`
- 设计方案: `E:\project\dvadmin\.claude\plan\前端样式与配色优化方案.md`
