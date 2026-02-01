# 博客前端重新设计方案

> **纸间·墨语** — 东方美学与现代主义的融合

## 设计理念

本次重新设计旨在创建一个独特、令人难忘的博客体验，融合以下核心元素：

### 核心概念

- **纸 (Paper)**: 温暖、质感、留白 — 传达内容的庄重与沉思
- **墨 (Ink)**: 深邃、流动、对比 — 创造视觉层次与焦点
- **韵 (Rhythm)**: 节奏、呼吸、韵律 — 赋予交互以生命力

### 设计原则

1. **极简而不简单**: 每个元素都有其存在的意义
2. **细节决定品质**: 从字体选择到动画曲线都经过精心设计
3. **性能优先**: 流畅的体验是设计的基石
4. **无障碍友好**: 所有人都能优雅地使用

---

## 色彩系统

### 主色系 — 墨

| 色值 | 用途 |
|------|------|
| `#0d0d0d` (ink-900) | 浓墨 — 主要文本、标题 |
| `#1a1a1a` (ink-800) | 深墨 — 次要文本 |
| `#2d2d2d` (ink-700) | 中墨 — 强调文本 |
| `#404040` (ink-600) | 淡墨 — 辅助文本 |
| `#5a5a5a` (ink-500) | 灰墨 — 禁用状态 |

### 背景系 — 纸

| 色值 | 用途 |
|------|------|
| `#fafaf9` (paper-50) | 宣纸白 — 主背景 |
| `#f5f5f4` (paper-100) | 米白 — 次级背景 |
| `#e7e5e4` (paper-200) | 灰白 — 边框、分割线 |
| `#d6d3d1` (paper-300) | 雾白 — 悬浮状态 |

### 强调色 — 朱

| 色值 | 用途 |
|------|------|
| `#c8402e` | 朱砂红 — 主要强调色、链接、按钮 |
| `#fef2f1` | 朱砂浅 — 背景点缀 |
| `rgba(200, 64, 46, 0.08)` | 朱砂淡 — 悬浮背景 |

---

## 字体系统

### 字体家族

```
衬线: Noto Serif SC (中文标题)
无衬线: Outfit (英文/数字 UI)
等宽: JetBrains Mono (代码)
```

### 字号层次

```
6xl: 96px  — 超大标题
5xl: 72px  — 英雄标题
4xl: 56px  — 大标题
3xl: 40px  — 标题
2xl: 30px  — 副标题
xl:  24px  — 大号文本
lg:  20px  — 中号文本
base: 16px — 正文
sm:  14px  — 小号文本
xs:  12px  — 超小文本
```

---

## 动画系统

### 缓动函数

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* 优雅淡出 */
--ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);  /* 极速淡出 */
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 弹性 */
```

### 持续时间

```
instant: 100ms  — 即时响应
fast:    150ms  — 快速反馈
normal:  250ms  — 标准过渡
slow:    400ms  — 慢速动画
slower:  600ms  — 页面转场
slowest: 800ms  — 特殊效果
```

---

## 新增文件列表

### 样式系统

| 文件 | 描述 |
|------|------|
| `variables-new.css` | 新的设计系统变量（墨与纸） |
| `animations.css` | 动画库（韵律系统） |

### 页面组件

| 文件 | 描述 |
|------|------|
| `HomeNew.vue` | 首页 — 墨韵开篇，动态标题效果 |
| `ArticleDetailNew.vue` | 文章详情 — 沉浸式阅读体验 |
| `AppNew.vue` | 根组件 — 全局样式与 Toast 系统 |

### 布局组件

| 文件 | 描述 |
|------|------|
| `HeaderNew.vue` | 头部导航 — 毛玻璃效果 |
| `FooterNew.vue` | 页脚 — 品牌印章设计 |
| `ArticleCardNew.vue` | 文章卡片 — 编号装饰，悬停效果 |

### 其他

| 文件 | 描述 |
|------|------|
| `index-new.html` | HTML 模板 — SEO 优化 |

---

## 关键特性

### 1. 动态标题效果

首页标题使用逐字动画：
```css
.title-char {
  display: inline-block;
  opacity: 0;
  animation: charReveal 0.6s var(--ease-out-expo) forwards;
}
```

### 2. 墨韵进度条

文章阅读进度条：
```css
.progress-fill {
  background: linear-gradient(to right, var(--vermilion), #e85544);
}
```

### 3. 毛玻璃导航

滚动时头部导航背景：
```css
.site-header--scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}
```

### 4. 代码复制功能

代码块一键复制，带状态反馈：
```typescript
const handleCodeCopy = async (e: MouseEvent) => {
  // 复制逻辑 + 视觉反馈
}
```

### 5. 渐进式展现

列表项错落动画：
```css
.article-item {
  animation: articleReveal 0.6s var(--ease-out-expo) backwards;
  animation-delay: calc(index * 80ms);
}
```

---

## 迁移指南

### 步骤 1: 备份现有文件

```bash
# 备份旧文件
cp src/assets/styles/variables.css src/assets/styles/variables-old.css
cp src/views/Home.vue src/views/Home-old.vue
cp src/views/ArticleDetail.vue src/views/ArticleDetail-old.vue
cp src/components/Header.vue src/components/Header-old.vue
cp src/components/Footer.vue src/components/Footer-old.vue
cp src/components/ArticleCard.vue src/components/ArticleCard-old.vue
cp src/App.vue src/App-old.vue
cp index.html index-old.html
```

### 步骤 2: 替换为新文件

```bash
# 样式系统
mv src/assets/styles/variables-new.css src/assets/styles/variables.css
mv src/assets/styles/animations.css src/assets/styles/

# 页面组件
mv src/views/HomeNew.vue src/views/Home.vue
mv src/views/ArticleDetailNew.vue src/views/ArticleDetail.vue

# 布局组件
mv src/components/HeaderNew.vue src/components/Header.vue
mv src/components/FooterNew.vue src/components/Footer.vue
mv src/components/ArticleCardNew.vue src/components/ArticleCard.vue

# 根组件
mv src/AppNew.vue src/App.vue

# HTML 模板
mv index-new.html index.html
```

### 步骤 3: 更新 main.ts

确保在 `main.ts` 中导入新样式：

```typescript
import './assets/styles/variables.css'  // 新的设计系统
import './assets/styles/animations.css' // 动画库
```

### 步骤 4: 测试

```bash
# 开发模式测试
npm run dev

# 构建测试
npm run build
npm run preview
```

---

## 自定义配置

### 修改品牌色

在 `variables.css` 中修改：

```css
:root {
  --vermilion: #c8402e;  /* 改为你喜欢的颜色 */
  --vermilion-light: #fef2f1;
  --vermilion-dim: rgba(200, 64, 46, 0.08);
}
```

### 修改字体

在 HTML 和 `variables.css` 中更新字体 URL：

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet" />
```

```css
:root {
  --font-serif: 'Your Font', serif;
}
```

### 修改动画时长

```css
:root {
  --duration-normal: 250ms; /* 改为其他值 */
}
```

---

## 性能优化建议

1. **字体加载**: 考虑使用 `font-display: swap` 优化字体加载
2. **图片优化**: 使用 WebP 格式，添加懒加载
3. **代码分割**: 使用 Vue Router 的懒加载
4. **CSS 精简**: 生产环境移除未使用的 CSS

---

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

对于旧版浏览器，某些效果（如 backdrop-filter）会自动降级。

---

## 许可证

本设计系统基于 MIT 许可证开源。

---

**设计版本**: v2.0.0
**更新日期**: 2026-02-01
**设计者**: Claude AI
