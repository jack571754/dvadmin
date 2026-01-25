[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/api**

---

# API 接口层

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 API 层文档 | Claude AI |

---

## 模块职责

定义前端 API 接口，封装后端 API 调用，提供类型安全的接口函数。

---

## 目录结构

```
api/
├── login/              # 登录相关 API
│   └── index.ts
├── menu/               # 菜单相关 API
│   └── index.ts
└── (其他模块 API)
```

---

## 接口定义

### 登录接口 (login/index.ts)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `loginApi` | POST | `/api/login/` | 用户登录 |
| `captchaApi` | GET | `/api/captcha/` | 获取验证码 |
| `logoutApi` | POST | `/api/logout/` | 用户登出 |
| `getTokenApi` | POST | `/api/token/` | 获取 Token |

### 菜单接口 (menu/index.ts)

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `getMenuList` | GET | `/api/system/menu/` | 获取菜单列表 |
| `getRouterList` | GET | `/api/system/menu/router/` | 获取路由列表 |

---

## 请求配置

### 基础配置

- **基础 URL**：通过环境变量配置
- **请求拦截器**：添加 JWT Token
- **响应拦截器**：统一错误处理
- **超时时间**：30 秒

### 请求工具

位置：`utils/request.ts`

```typescript
import { request } from '@/utils/request';

// 使用示例
export const getUserList = (params: any) => {
  return request({
    url: '/api/system/user/',
    method: 'get',
    params
  });
};
```

---

## 类型定义

### 请求参数类型

使用 TypeScript 接口定义：

```typescript
interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
}

interface PageParams {
  page: number;
  pageSize: number;
}
```

### 响应数据类型

```typescript
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

interface PageResponse<T = any> {
  count: number;
  results: T[];
}
```

---

## 接口规范

### 命名规范

- 函数名：`xxxApi`（如 `loginApi`）
- 文件名：小写，使用 `-` 分隔
- 参数名：驼峰命名

### 统一返回格式

```typescript
{
  code: 200,      // 状态码
  msg: "success", // 消息
  data: {}        // 数据
}
```

---

## 常见问题 (FAQ)

### 1. 如何添加新的 API？

创建对应的 API 文件并导出函数：

```typescript
// api/user/index.ts
import { request } from '@/utils/request';

export const getUserList = (params: any) => {
  return request({
    url: '/api/system/user/',
    method: 'get',
    params
  });
};
```

### 2. 如何处理文件上传？

```typescript
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/system/file/',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### 3. 如何处理分页？

```typescript
export const getPageData = (page: number, pageSize: number) => {
  return request({
    url: '/api/system/user/',
    method: 'get',
    params: { page, page_size: pageSize }
  });
};
```

---

## 相关文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| `login/index.ts` | 登录接口 |
| `menu/index.ts` | 菜单接口 |

### 工具文件

| 文件 | 说明 |
|------|------|
| `../utils/request.ts` | Axios 封装 |
| `../utils/baseUrl.ts` | 基础 URL 配置 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [api] (./)
```
