# 图书管理前端模块

> 基于文档 `backend/docs_architecture/06_图书管理系统开发教程.md` 创建的图书管理前端页面

## 模块结构

```
web/src/views/book/
├── README.md              # 本文档
├── api.ts                 # API 接口定义
├── index.vue              # 图书列表页面
├── crud.tsx               # 图书列表 CRUD 配置
├── category/              # 图书分类
│   ├── index.vue
│   └── crud.tsx
└── author/                # 图书作者
    ├── index.vue
    └── crud.tsx
```

## 功能列表

### 1. 图书管理 (`/book`)
- 图书列表查询
- 新增/编辑/删除图书
- 图书信息包括：ISBN、书名、副标题、分类、出版社、作者、出版日期、版次、页数、定价、库存等
- 支持按 ISBN、书名、分类、状态搜索
- 支持多对多关系：一个图书可以有多个作者

### 2. 图书分类管理 (`/book/category`)
- 分类列表查询
- 新增/编辑/删除分类
- 支持树形结构（父分类）
- 分类字段：名称、编码、排序、父分类、描述、状态

### 3. 图书作者管理 (`/book/author`)
- 作者列表查询
- 新增/编辑/删除作者
- 作者字段：姓名、笔名、性别、国籍、出生日期、逝世日期、简介

## 后端 API 对应

所有 API 接口定义在 `api.ts` 中，对应后端路由：

| 功能 | 前端路径 | 后端 API |
|------|----------|----------|
| 图书列表 | `/book` | `/api/book/book/` |
| 图书分类 | `/book/category` | `/api/book/category/` |
| 图书作者 | `/book/author` | `/api/book/author/` |
| 图书出版社 | - | `/api/book/publisher/` |
| 借阅记录 | - | `/api/book/borrow/` |
| 预约记录 | - | `/api/book/reservation/` |

## 菜单配置

### 在系统管理 -> 菜单管理 中添加以下菜单：

#### 1. 父菜单：图书管理
```
菜单名称: 图书管理
菜单类型: 目录(M)
路由地址: /book
组件路径: Layout
图标: book (或 Reading)
排序: 10
状态: 开启
```

#### 2. 子菜单：图书列表
```
菜单名称: 图书列表
父级菜单: 图书管理
菜单类型: 菜单(C)
路由地址: list
组件路径: views/book/index
权限标识: book:book:list
排序: 1
状态: 开启
```

#### 3. 子菜单：图书分类
```
菜单名称: 图书分类
父级菜单: 图书管理
菜单类型: 菜单(C)
路由地址: category
组件路径: views/book/category/index
权限标识: book:category:list
排序: 2
状态: 开启
```

#### 4. 子菜单：图书作者
```
菜单名称: 图书作者
父级菜单: 图书管理
菜单类型: 菜单(C)
路由地址: author
组件路径: views/book/author/index
权限标识: book:author:list
排序: 3
状态: 开启
```

#### 5. 按钮权限（可选）
```
名称: 新增图书
父级: 图书列表
类型: 按钮(F)
权限标识: book:book:add

名称: 编辑图书
父级: 图书列表
类型: 按钮(F)
权限标识: book:book:edit

名称: 删除图书
父级: 图书列表
类型: 按钮(F)
权限标识: book:book:delete

名称: 查询图书
父级: 图书列表
类型: 按钮(F)
权限标识: book:book:query
```

## 使用说明

### 1. 确保后端已启动

```bash
cd backend
uvicorn application.asgi:application --host 0.0.0.0 --port 9000 --reload
```

### 2. 启动前端

```bash
cd web
yarn install
yarn run dev
```

### 3. 访问系统

1. 打开浏览器访问 `http://localhost:8080`
2. 使用 `superadmin` / `admin123456` 登录
3. 进入"系统管理 -> 菜单管理"配置菜单（如上所示）
4. 刷新页面，即可看到"图书管理"菜单

## 数据模型说明

### Book（图书）
- isbn: ISBN编号（唯一）
- title: 书名
- subtitle: 副标题
- category: 所属分类（外键）
- publisher: 出版社（外键）
- authors: 作者（多对多）
- publish_date: 出版日期
- edition: 版次
- pages: 页数
- price: 定价
- total_quantity: 总册数
- available_quantity: 可借册数
- location: 存放位置
- status: 状态（0=上架, 1=下架, 2=遗失, 3=报废）
- language: 语言
- summary: 内容简介

### BookCategory（分类）
- name: 分类名称
- code: 分类编码（唯一）
- sort: 排序
- parent: 父分类（自关联外键）
- description: 分类描述
- status: 状态

### BookAuthor（作者）
- name: 作者姓名
- pen_name: 笔名
- gender: 性别（0=未知, 1=男, 2=女）
- country: 国籍
- birth_date: 出生日期
- death_date: 逝世日期
- biography: 作者简介

## 扩展功能

如需添加更多功能，可以参考以下模块：

### 出版社管理
参考 `author/` 目录创建 `publisher/` 目录

### 借阅记录管理
参考 `author/` 目录创建 `borrow/` 目录

### 预约记录管理
参考 `author/` 目录创建 `reservation/` 目录

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- fast-crud（快速 CRUD 框架）
- Axios（HTTP 请求）

## 注意事项

1. **组件路径**：菜单配置中的组件路径格式为 `views/xxx/index`，不需要 `.vue` 后缀
2. **权限标识**：确保与后端权限配置一致
3. **外键组件**：使用 `foreignKey` 组件处理外键关系
4. **多对多组件**：使用 `manyToMany` 组件处理多对多关系
5. **字典数据**：使用 `dict()` 函数获取动态数据

## 故障排查

### 问题1：页面无法访问
- 检查菜单配置中的组件路径是否正确
- 确认文件已创建在正确位置
- 检查浏览器控制台是否有报错

### 问题2：API 请求失败
- 确认后端服务已启动
- 检查 `.env.development` 中的 `VITE_API_URL` 配置
- 查看浏览器 Network 面板的请求详情

### 问题3：下拉框无数据
- 检查外键字段的 `dict.getData` 方法
- 确认后端接口返回数据格式正确
- 查看浏览器控制台是否有报错

## 开发参考

- [DVAdmin 官方文档](https://django-vue-admin.com)
- [fast-crud 文档](https://fast-crud.docmirror.cn/)
- [Element Plus 文档](https://element-plus.org/)
