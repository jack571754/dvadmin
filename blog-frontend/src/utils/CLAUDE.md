# 工具函数 - 模块文档

[项目根](../../../CLAUDE.md) > [blog-frontend](../../CLAUDE.md) > [src](../) > **utils**

---

## 模块职责

提供可复用的工具函数，包括日期格式化、错误处理等。

---

## 函数清单

### date.ts - 日期工具

#### formatDate(dateString: string): string

格式化日期为相对时间或完整日期。

```typescript
formatDate('2024-02-01')  // "今天" / "昨天" / "3 天前" / "2024年2月1日"
```

**规则：**
- 0 天 → "今天"
- 1 天 → "昨天"
- < 7 天 → "X 天前"
- < 30 天 → "X 周前"
- < 365 天 → "X 月前"
- 其他 → 完整日期

#### formatFullDate(dateString: string): string

格式化为完整日期字符串。

```typescript
formatFullDate('2024-02-01')  // "2024年2月1日"
```

#### calculateReadTime(content: string): number

计算文章阅读时间（分钟）。

```typescript
calculateReadTime('800字的文章')  // 1（按每分钟 200 字计算）
```

---

### errorHandler.ts - 错误处理

#### handleApiError(error: any): string

处理 API 错误，返回用户友好消息。

**HTTP 状态码映射：**

| 状态码 | 消息 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 请先登录 |
| 403 | 没有权限访问 |
| 404 | 请求的资源不存在 |
| 500 | 服务器错误，请稍后重试 |
| 502/503/504 | 服务暂时不可用，请稍后重试 |

**网络错误：**
- `ERR_NETWORK` → 网络连接失败
- `ECONNABORTED` → 请求超时

#### showError(message: string): void

显示错误提示（预留 UI 库集成）。

#### showSuccess(message: string): void

显示成功提示（预留 UI 库集成）。

---

## 相关文件清单

```
src/utils/
├── date.ts              # 日期工具（52 行）
└── errorHandler.ts      # 错误处理（91 行）
```

---

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-02-03 | 初始化模块文档 |
