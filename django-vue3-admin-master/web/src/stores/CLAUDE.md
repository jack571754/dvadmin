[根目录](../../../../CLAUDE.md) > [django-vue3-admin-master](../../../CLAUDE.md) > [web](../../CLAUDE.md) > **src/stores**

---

# Stores 状态管理

> 最后更新：2026-01-25 14:09:00

## 变更记录 (Changelog)

| 时间 | 变更内容 | 责任人 |
|------|----------|--------|
| 2026-01-25 14:09:00 | 初始化 stores 文档 | Claude AI |

---

## 模块职责

使用 Pinia 进行全局状态管理，管理用户信息、路由、权限、主题等应用状态。

---

## Store 列表

| Store 文件 | 说明 | 状态类型 |
|-----------|------|----------|
| `userInfo.ts` | 用户信息 | UserState |
| `routesList.ts` | 路由列表 | RouteState |
| `themeConfig.ts` | 主题配置 | ThemeConfigState |
| `btnPermission.ts` | 按钮权限 | PermissionState |
| `columnPermission.ts` | 列权限 | ColumnPermissionState |
| `dictionary.ts` | 字典数据 | DictionaryState |
| `frontendMenu.ts` | 前端菜单 | MenuState |
| `messageCenter.ts` | 消息中心 | MessageState |
| `systemConfig.ts` | 系统配置 | ConfigState |
| `keepAliveNames.ts` | 页面缓存 | KeepAliveState |
| `tagsViewRoutes.ts` | 标签页 | TagsViewState |

---

## 核心 Store

### userInfo.ts - 用户信息

**状态：**
```typescript
interface UserState {
  userInfos: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    roles: string[];
    deptId: number;
    // ...
  };
  token: string;
}
```

**Actions：**
- `setUserInfos` - 设置用户信息
- `setToken` - 设置 Token
- `clear` - 清除用户信息

### routesList.ts - 路由列表

**状态：**
```typescript
interface RouteState {
  routesList: RouteRecordRaw[];
  isColumnsMenuHover: boolean;
  isColumnsNavHover: boolean;
}
```

**Actions：**
- `setRoutesList` - 设置路由列表
- `setColumnsMenuHover` - 设置菜单悬停状态
- `setColumnsNavHover` - 设置导航悬停状态

### themeConfig.ts - 主题配置

**状态：**
```typescript
interface ThemeConfigState {
  themeConfig: {
    isDrawer: boolean;
    isFixedHeader: boolean;
    isShowsTag: boolean;
    // ...
  };
}
```

**Actions：**
- `setThemeConfig` - 设置主题配置

### btnPermission.ts - 按钮权限

**状态：**
```typescript
interface PermissionState {
  permission: {
    [key: string]: string[];
  };
}
```

**Actions：**
- `setPermission` - 设置权限数据

---

## 使用方式

### 在组件中使用

```typescript
import { useUserInfo } from '@/stores/userInfo';

export default {
  setup() {
    const userInfoStore = useUserInfo();

    // 获取状态
    const username = computed(() => userInfoStore.userInfos.username);

    // 调用 action
    const login = async () => {
      await userInfoStore.setUserInfos({
        userId: 1,
        username: 'admin'
      });
    };

    return { username, login };
  }
};
```

### 持久化存储

部分 Store 会自动持久化到 localStorage：

```typescript
export const useUserInfo = defineStore('userInfo', {
  state: () => ({...}),
  actions: {...},
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'userInfo',
        storage: localStorage,
      },
    ],
  },
});
```

---

## 状态流转

### 登录流程

1. 调用登录 API
2. 保存 Token 到 `userInfo`
3. 获取用户权限
4. 更新 `btnPermission`
5. 更新 `columnPermission`
6. 生成路由列表
7. 更新 `routesList`

### 权限检查

```typescript
import { useBtnPermission } from '@/stores/btnPermission';

const btnPermissionStore = useBtnPermission();
const hasPermission = btnPermissionStore.permission['system:user:add'];
```

---

## 常见问题 (FAQ)

### 1. 如何添加新的 Store？

```typescript
// stores/myStore.ts
import { defineStore } from 'pinia';

export const useMyStore = defineStore('myStore', {
  state: () => ({
    data: []
  }),
  actions: {
    setData(data: any[]) {
      this.data = data;
    }
  }
});
```

### 2. 如何持久化 Store？

使用 `pinia-plugin-persist`：

```typescript
persist: {
  enabled: true,
  strategies: [
    {
      key: 'myKey',
      storage: localStorage,
    },
  ],
}
```

### 3. 如何在 Store 中调用 API？

```typescript
import { loginApi } from '@/api/login';

actions: {
  async login(params: LoginParams) {
    const res = await loginApi(params);
    this.setToken(res.data.token);
  }
}
```

---

## 相关文件清单

### 核心 Store

| 文件 | 说明 |
|------|------|
| `userInfo.ts` | 用户信息 |
| `routesList.ts` | 路由列表 |
| `themeConfig.ts` | 主题配置 |
| `btnPermission.ts` | 按钮权限 |
| `columnPermission.ts` | 列权限 |
| `dictionary.ts` | 字典数据 |
| `frontendMenu.ts` | 前端菜单 |
| `messageCenter.ts` | 消息中心 |
| `systemConfig.ts` | 系统配置 |
| `keepAliveNames.ts` | 页面缓存 |
| `tagsViewRoutes.ts` | 标签页 |

---

## 面包屑导航

```
[根目录] (../../../../CLAUDE.md)
  └─ [django-vue3-admin-master] (../../../CLAUDE.md)
       └─ [web] (../../CLAUDE.md)
            └─ [src] (../CLAUDE.md)
                 └─ [stores] (./)
```
