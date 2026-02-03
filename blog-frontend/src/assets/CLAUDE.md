# 样式资源 - 模块文档

[根目录](../../CLAUDE.md) > [src](../) > **assets**

---

## 模块职责

提供全局样式、设计系统变量和动画定义。

---

## 文件清单

| 文件 | 说明 |
|------|------|
| styles/variables.css | 设计系统变量（墨与纸） |
| styles/animations.css | 动画定义 |
| styles/global.css | 全局样式 |

---

## variables.css - 设计系统

### 设计理念：「纸间·墨语」

- **纸**：温暖、质感、留白
- **墨**：深邃、流动、对比
- **韵**：节奏、呼吸、韵律

### 色彩系统

#### 墨色系

```css
--ink-900: #0d0d0d      /* 浓墨 */
--ink-800: #1a1a1a      /* 深墨 */
--ink-700: #2d2d2d      /* 中墨 */
--ink-600: #404040      /* 淡墨 */
--ink-500: #5a5a5a      /* 灰墨 */
```

#### 纸张系

```css
--paper-50: #fafaf9     /* 宣纸白 */
--paper-100: #f5f5f4    /* 米白 */
--paper-200: #e7e5e4    /* 灰白 */
--paper-300: #d6d3d1    /* 雾白 */
```

#### 强调色

```css
--vermilion: #c8402e    /* 朱砂红 */
--vermilion-light: #fef2f1
--vermilion-dim: rgba(200, 64, 46, 0.08)
```

#### 辅助色

```css
--indigo: #4a5fa0       /* 靛蓝 */
--indigo-light: #f0f2fa
--indigo-dim: rgba(74, 95, 160, 0.08)
```

### 字体系统

```css
--font-serif: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
--font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;
```

### 字号系统（黄金比例）

```css
--font-size-xs: 0.75rem      /* 12px */
--font-size-sm: 0.875rem     /* 14px */
--font-size-base: 1rem       /* 16px */
--font-size-lg: 1.25rem      /* 20px */
--font-size-xl: 1.5rem       /* 24px */
--font-size-2xl: 1.875rem    /* 30px */
--font-size-3xl: 2.5rem      /* 40px */
--font-size-4xl: 3.5rem      /* 56px */
--font-size-5xl: 4.5rem      /* 72px */
--font-size-6xl: 6rem        /* 96px */
```

### 间距系统（4px 基准）

```css
--space-1: 0.25rem       /* 4px */
--space-2: 0.5rem        /* 8px */
--space-3: 0.75rem       /* 12px */
--space-4: 1rem          /* 16px */
--space-6: 1.5rem        /* 24px */
--space-8: 2rem          /* 32px */
--space-12: 3rem         /* 48px */
--space-16: 4rem         /* 64px */
--space-24: 6rem         /* 96px */
--space-32: 8rem         /* 128px */
```

### 动画韵律

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
```

### 阴影系统

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
--shadow-ink: 0 2px 8px rgba(13, 13, 13, 0.08);
--shadow-ink-lg: 0 4px 16px rgba(13, 13, 13, 0.1);
```

### 边框圆角

```css
--radius-sm: 0.125rem     /* 2px */
--radius-base: 0.25rem    /* 4px */
--radius-lg: 0.5rem       /* 8px */
--radius-xl: 0.75rem      /* 12px */
--radius-full: 9999px;
```

### Z-Index 层级

```css
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-tooltip: 700;
```

### 容器宽度

```css
--container-sm: 24rem     /* 384px */
--container-md: 28rem     /* 448px */
--container-lg: 32rem     /* 512px */
--container-xl: 36rem     /* 576px */
--container-2xl: 42rem    /* 672px */
--container-7xl: 80rem    /* 1280px */
```

---

## animations.css - 动画定义

### 预定义动画

```css
@keyframes fadeInUp        /* 淡入上升 */
@keyframes fadeIn          /* 淡入 */
@keyframes elegantScale    /* 优雅缩放 */
@keyframes slideInRight    /* 滑入 */
@keyframes pulse           /* 脉冲 */
@keyframes inkSpread       /* 墨迹扩散 */
@keyframes breathe         /* 呼吸 */
```

---

## global.css - 全局样式

### 基础重置

- 盒模型重置
- 字体平滑渲染
- 文本渲染优化

### 基础样式

- 链接样式
- 按钮样式
- 选择高亮（朱砂红）
- 焦点样式
- 滚动条样式

---

## 相关文件清单

```
src/assets/
└── styles/
    ├── variables.css      # 设计系统变量（503 行）
    ├── animations.css     # 动画定义
    └── global.css         # 全局样式
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
