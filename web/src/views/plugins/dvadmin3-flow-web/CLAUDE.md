# dvadmin3-flow-web · 工作流审批前端

> 导航：[仓库根](../../../../../CLAUDE.md) › [web](../../../../CLAUDE.md) › [plugins](../) › **dvadmin3-flow-web**
>
> 最后更新：2026-10-26 ｜ 后端见 [backend/plugins/dvadmin3_flow/CLAUDE.md](../../../../../backend/plugins/dvadmin3_flow/CLAUDE.md)

## 模块职责

工作流审批插件的**前端**：流程定义与可视化设计器、流程实例列表、待办/已办/我发起/抄送、
动态表单渲染与 H5 预览。共 113 个文件，**没有独立 `package.json`**，随主工程 Vite 构建。

后端接口前缀 `/api/dvadmin3_flow/`。页面通过后端菜单加载，菜单 `component` 形如
`plugins/dvadmin3-flow-web/src/flowTodo/index`（见插件 `fixtures/init_menu.json`）。

## 入口与加载

| 入口 | 位置 | 说明 |
|------|------|------|
| 插件入口 | [index.ts](./index.ts) | 被 `views/plugins/index.ts` 自动扫描并 `app.use`，但 `install()` **是空实现**，实际不做全局组件注册，只引入 `src/assets/global.css` |
| 7 个菜单页 | `src/flowManagement|flowList|flowData|flowTodo|flowIdo|flowSubmitted|flowCC/index.vue` | 由后端菜单 `component` 映射，`backEnd.ts` 的 glob 命中的是 `src/` 下真实路径 |
| H5 注册 | [src/flowH5/index.ts](./src/flowH5/index.ts) | 引入 Vant 4 + `@meetjs/vant4-kit` 及 CSS；用 `import.meta.glob('./components/**/index.vue')` 注册 `FileUploader`、`orgPicker` 等 |
| README | [README.md](./README.md) | 仅一行标题，没有有效说明 |

## 页面清单

| 菜单路径 | 目录 | 职责 | 主要接口 |
|----------|------|------|----------|
| `/workflow` | — | 目录节点，无组件 | — |
| `/flowManagement` | `src/flowManagement/` | 流程定义 CRUD；打开流程设计器与流程图；状态切换 `put_status/` | `/api/dvadmin3_flow/flow_info/` |
| `/flowList` | `src/flowList/` | 可发起的流程卡片；弹窗填表发起 | `flow_info/flow_list/`、`flow_data/` |
| `/flowData` | `src/flowData/` | 全部审批数据（管理视角） | `flow_data/get_all_flow_data/` |
| `/flowTodo` | `src/flowTodo/` | 待我处理 | `flow_data/handle_to_me/?handle_status=0` |
| `/flowIdo` | `src/flowIdo/` | 已办 | `flow_data/handle_completed/?handle_status=1` |
| `/flowSubmitted` | `src/flowSubmitted/` | 我发起的 | `flow_data/handle_my_submit/` |
| `/flowCC` | `src/flowCC/` | 抄送我的 | `flow_data/cc_to_me/` |
| —（非菜单） | `src/flowH5/` | H5 预览与动态表单渲染 | 业务端 `app_flow_*` |

`flowManagement/index.vue` 里嵌两个大组件：`components/flowProcess.vue`（查看流程图/记录）与
`components/flowDesigner.vue`（流程设计器入口）。

## 两条请求栈（容易踩）

| 使用范围 | 客户端 | 特点 |
|----------|--------|------|
| `src/flowList/index.vue` 等少数页面 | [src/api/request.js](./src/api/request.js) | 独立 axios 实例，`baseURL = getBaseURL()`，`Authorization: JWT <Session token>`，**只认 `code === 2000`**，401 用 `ElMessageBox` 提示 |
| 各页面 `api.ts` + `flowList/components/dialogCrud/api.ts` | `/@/utils/service` | 走主工程请求栈（token 注入、401 清会话、空参数剔除） |

新增页面优先用 `/@/utils/service`；不要在同一页面混用两套客户端，否则错误处理与登出行为不一致。

## 设计器（`src/wflow/`，66 个文件）

流程设计器是内嵌的第三方风格模块，分四层：

| 目录 | 内容 | 说明 |
|------|------|------|
| `admin/` | `ProcessDesigner.vue`、`FormProcessDesigner.vue`、`BaseSetting.vue`、`PlusSetting.vue`、`config/FormPermConf.vue`、`config/orgConfig.ts` | 设计器外壳与基础设置（名称、图标、权限、组织范围） |
| `design/process/` | `NodeMixin.js`、`ProcessNodes.js`、`ProcessRender.vue`、`config/{Start,Approval,Cc,End,Exclusive}.vue`、`config/common/ConditionGroupConfig.vue` | 节点树与节点属性面板；节点类型与后端 `FlowNode.node_type` 对应 |
| `design/form/` | `FormComponents.js`、`FormDesigner.vue`、`FormRender.vue`、`FormComponentMixin.js`、`FormInterface.js`、`component/`（15 个控件）、`config/`（16 个属性面板） | 动态表单设计器与渲染器；控件含文本、数值、日期、人员、部门、图片、附件、评分、表格等 |
| `common/` | `WDialog.vue`、`WOrgPicker.vue`、`WOrgTags.vue` | 通用弹窗与组织选择 |

`wflow` 的拖拽/连线依赖 `jsplumb`（已在 `dependencies`）。**不要**把这里当成可以随便升级的组件库：
节点/控件的数据结构要与后端 `FlowNode` / `FlowInfo` 的 JSON 保持一致，改字段名会直接破坏已发布流程。

## 共享组件与工具

| 路径 | 内容 |
|------|------|
| `src/components/auditButton/` | 业务页复用的"发起审批/查看进度"按钮 |
| `src/components/flowDialog/` | 审批弹窗、流程记录、变更前后对比 |
| `src/components/conditionConfig/` | 分支条件配置（与后端 `eval` 条件字符串对应） |
| `src/utils/ProcessUtil.js` | 节点查找/流程推进辅助 |
| `src/utils/ConditionCompare.js` | 条件比较（前端侧） |
| `src/utils/GlobalFunc.js` | 全局函数（弹窗、消息等） |
| `src/api/org.js` | 组织/人员选择接口 |

## 与其他模块的边界

- 后端是**站点目录插件** `backend/plugins/dvadmin3_flow/`，不是 PyPI 包；前端也没有包边界，
  直接引用主工程的 `utils/service`、`utils/baseUrl`、`utils/storage`。
- 样式只靠主工程令牌继承：`src/assets/global.css`、`src/assets/theme.less` 是插件自带样式，
  未纳入 V2 视觉推广范围，视觉上会比系统管理页旧。
- 审批中涉及业务模型的页面（`FlowBaseModel` 子类）会把 `auditButton` / `flowDialog` 嵌到业务页里，
  改这两个组件要同时回归对应业务模块。

## 测试与验证

- **没有专用单测/E2E**：`web/scripts/tests/` 与 `web/tests/` 都不覆盖本目录；Playwright smoke/i18n 也没有流程页用例。
- 改动后的最小验证：
  ```powershell
  cd web
  pnpm lint          # 与基线比较
  pnpm build         # 设计器依赖多，构建是最有效的兜底
  ```
- 功能验证需要登录后依次走：流程管理新建/发布 → 流程列表发起 → 待办审批通过/驳回 → 已办/我发起/抄送。
  这套路径依赖后端 `dvadmin3_flow` 与真实组织数据，建议在隔离 E2E 环境手工走一遍。

## 常见问题（FAQ）

1. **菜单点开空白**：`component_name` 与页面 `name` 不一致，或 `component` 路径与 `src/` 实际路径不符；
   本目录路径带 `src/` 一层，和系统管理页的写法不同。
2. **接口 403/401 表现不一致**：页面用了 `request.js`，它不会像主请求栈那样清会话；统一改回 `/@/utils/service`。
3. **设计器拖不动/连线错位**：先确认 `jsplumb` 已安装、容器有明确宽高；`ProcessRender` 依赖父容器尺寸。
4. **保存后节点丢失**：`FlowNode` 是树结构（`parent` 自关联），前端提交的是扁平数组 + `parent` 关系；
   丢节点通常是父节点 id 没回填，检查 `ProcessNodes.js` 的 id 生成。
5. **条件不生效**：后端用 `eval` 执行条件字符串（见后端文档"已知缺陷"），前端 `conditionConfig` 的变量名
   必须与表单字段 key 完全一致。
6. **H5 预览样式穿透到主站**：`flowH5/index.ts` 全局引入了 Vant CSS；在 PC 端同时使用时要确认没有污染 Element 样式。

## 相关文件清单

```text
dvadmin3-flow-web/
├── index.ts                 # 插件入口（install 为空）
├── README.md                # 占位
└── src/
    ├── api/                 # request.js（独立 axios）、org.js
    ├── assets/              # global.css、theme.less
    ├── components/          # auditButton、conditionConfig、flowDialog
    ├── flowManagement/      # 流程定义 + 设计器入口 + flowProcess
    ├── flowList/            # 可发起流程 + dialogForm/dialogCrud/flowH5Preview
    ├── flowData/ flowTodo/ flowIdo/ flowSubmitted/ flowCC/   # 5 个实例列表页
    ├── flowH5/              # Vant H5 预览与动态表单渲染
    ├── utils/               # ProcessUtil、ConditionCompare、GlobalFunc
    └── wflow/               # 设计器：admin/、design/process/、design/form/、common/
```

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-10-26 | 首次生成模块文档：7 个菜单页、两条请求栈、wflow 设计器分层、无测试覆盖的验证方式、6 条 FAQ。 |
