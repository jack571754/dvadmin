# dvadmin3_flow · 工作流审批插件

> 导航：[仓库根](../../../CLAUDE.md) › [backend](../../CLAUDE.md) › **dvadmin3_flow 工作流插件**
>
> 最后更新：2026-10-25 ｜ 路由前缀 `api/dvadmin3_flow/` ｜ 前端在 `web/src/views/plugins/dvadmin3-flow-web/`

## 它是什么

一套自带的审批引擎：流程定义（含可视化节点树）→ 发起流程实例 → 逐节点流转 → 待办/已办/抄送。
业务模型继承 `FlowBaseModel` 后，保存时按规则自动发起流程。

**没有独立 PyPI 包。** `application/settings.py:38-45` 把 `backend/plugins` 及每个插件目录插入
`sys.path`，所以 `import dvadmin3_flow` 就是本目录。

## 结构与规模

| 路径 | 文件 | 说明 |
|------|------|------|
| `models.py` | 1 | 5 个模型，表前缀 `workflow_` |
| `base_model.py` | 1 | 引擎本体（879 行）：`ModelDiffMixin` + `FlowBaseModel` |
| `views/` | 3 | **管理端/PC**：流程定义 CRUD、审批操作、导出 |
| `app_views/` | 2 | **业务端/H5**：`render()` 模板页 + 精简 API |
| `fixtures/` | 2 | `init_menu.json`（目录 + 7 个子菜单 + 17 个按钮权限）、`initialize.py` |
| `migrations/` | 1 | 只有 `0001_initial`，依赖 `system.0002` |
| `templates/` `static/` | 4 + 10 | H5 模板、流程设计器静态资源 |

序列化器**没有独立文件**，直接写在视图里（`views/flow_data.py:25`、`views/flow_record.py:7` 等）。

## 数据模型

全部继承 `CoreModel`（`FlowAuditUsers` 除外，它是普通 `models.Model`）：

| 模型 | 表 | 关键点 |
|------|----|--------|
| `FlowInfo` | `workflow_flow_info` | 流程定义。`model_type` 0=库表 / 1=动态表单；`status` 0 待发布 / 1 正常 / 2 下架；`rule_status` 控制是否自动发起 |
| `FlowNode` | `workflow_flow_node` | 节点树，自关联 `parent`；`node_type` Start/Approval/Cc/Gateway/Exclusive/End；`save_flow_node()` / `get_flow_node()` 做树存取 |
| `FlowData` | `workflow_flow_data` | 流程实例。`no` 自动生成 `SH+YYYYMMDD+6位`；`status` 0 进行中 / 1 通过 / 2 驳回 / 3 撤销；`GenericForeignKey` 关联业务对象 |
| `FlowRecord` | `workflow_flow_record` | 审批记录。`save()` 在 status 1/2/3 时触发引擎（`models.py:262-267`）并推送消息 |
| `FlowAuditUsers` | `workflow_flow_audit_users` | 节点审批人明细 |

## 路由

`urls.py:12-16` 用 `SimpleRouter` 注册 4 个前缀：`flow_info`、`flow_data`、`app_flow_info`、`app_flow_data`；
另挂 4 个模板页路由（`flow_form_page/` 等）。挂载方式见 [backend/CLAUDE.md](../../CLAUDE.md) 的"路由总览"。

主要 action：

- 管理端（`views/flow_data.py`）：`my_pending_handle`(0 待办/1 已办/2 我提交/3 抄送)、`handle_to_me`、
  `handle_completed`、`handle_my_submit`、`cc_to_me`、`handle_pass`、`handle_reject`、`handle_cancel`、
  `submit_flow_data`、`get_flow_process`、`get_flow_record`、`export_data`。
- 业务端（`app_views/`）：同名裁剪版 + `get_handle_to_me_count`、`get_form_list`、`get_formConfig`。
- **没有"加签/转办"实现**，全目录搜不到。

## 引擎入口

`base_model.py` 是核心，改动前先读这几处：

- `FlowBaseModel.save()`（`base_model.py:107-183`）—— 拦截创建/编辑，按 `rule_status` 决定是否发起；
- `execute_approval_process()`（:310）—— 建流程数据；
- `process_engine()`（:789）—— 节点流转主循环；
- `_approval_node` / `_gateway_node` / `_cc_node` / `_end_node`（:620/:663/:688/:627）；
- `conditional_check()`（:381）—— 分支条件，**内部用 `eval` 执行字符串**（:531-535）。

## 初始化

`python manage.py init -app dvadmin3_flow` 会调 `fixtures/initialize.py` 的 `init_menu()`，
用 `CoreInitialize.init_base(..., unique_fields=['name','web_path','component','component_name'])`
把 `init_menu.json` upsert 进菜单表。菜单层级：目录「审批流程」`/workflow` + 7 个子菜单
（流程管理、流程列表、全部审批、待我处理、已处理的、我发起的、抄送我的）。

## 硬规则

1. **不要随意调整 `base_model.py` ←→ `models.py` 的导入顺序。** 两者互为延迟导入
   （`base_model.py:14` 顶层导入 models；`models.py:266` 在 `save()` 内部反向导入），很容易成环。
2. **改模型必须自己补迁移。** 只有 `0001_initial`，`makemigrations` 之外的自动生成别指望。
3. 插件 `settings.py` 在 import 时直接改写全局 `INSTALLED_APPS` / `TEMPLATES` / `STATICFILES_DIRS`，
   重复导入会重复追加，不要把它当成普通配置模块反复 reload。
4. `views/` 与 `app_views/` 是两套接口，改一处功能记得确认另一处是否也需要同步。

## 已知缺陷（读代码确认，尚未修复）

改动这块功能时请把它们当作"先确认是否已修"的清单：

- **`unpublish` 条件写反**：`status == 1` 时返回"该流程已下架"，导致已发布流程无法下架
  （`views/flow_info.py:381-384`）。
- **引擎可能重复执行**：`FlowRecord.save()` 自动调 `process_engine`（`models.py:265-267`），
  而 `execute_approval_process` 创建记录后又显式调一次（`base_model.py:377-378`）；
  `process_engine` 末尾还会递归自调（:875）。
- **`eval` 执行节点条件字符串**（`base_model.py:531-535`），节点数据可控时有注入风险。
- `approval_permission` 把 `user.dept` 对象与 id 列表比较（`models.py:219-220`），可能恒假。
- 撤销接口返回 `msg="处理驳回"`（`views/flow_data.py:514`、`app_views/flow_data.py:302`）。
- `cc_to_me` 的 OR 条件漏了 `Cc`（`views/flow_data.py:417-422`）；`filter = Q(filter) & ...` 写法可疑（:350）。
- 消息推送硬编码前端路由 `/flowTodo`（`models.py:282`）；菜单硬编码 `parent: 1` 与组件路径。
- 遗留调试输出：`models.py:274`、`base_model.py:560`、`views/flow_info.py:107`、`decorator.py:54`。
- `views/flow_record.py` 的序列化器没有任何 urls 引用，是孤立代码。
- 未完成项：`base_model.py:582` 的 TODO（自动审核通过）、:610-611 被注释的通知调用。

## 前端

`web/src/views/plugins/dvadmin3-flow-web/`，113 个文件，无独立 package.json，随主工程构建。

`src/` 下：`flowManagement/`（流程定义 + 设计器）、`flowList/`、`flowData/`、`flowTodo/`、`flowIdo/`、
`flowSubmitted/`、`flowCC/`、`flowH5/`、`wflow/`（66 个文件，流程设计器 `design`/`admin`）、
`components/`、`api/`、`utils/`。

前端**未纳入 V2 视觉推广范围**，只靠令牌继承获得部分一致性，暂时会比系统管理页旧。
