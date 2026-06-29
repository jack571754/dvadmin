[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [plugins](../) > **dvadmin3_flow**

# Dvadmin3 Flow 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-17 15:46:52 | 增量更新：补全 FlowBaseModel.process_engine 完整流转逻辑（5 步递归）、刷新 views/app_views 目录结构与页面视图清单 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

工作流审批引擎插件，提供完整的审批流程管理能力：
- 可视化流程设计（流程设计器前端组件）
- 多类型节点：开始、审批、条件分支、抄送、结束
- 条件引擎：支持发起人部门/角色条件、数据库字段条件
- 审批流转：自动流转、同发起人自动通过、手动审批
- 动态表单支持：数据库表模式 + 动态表单模式
- 消息推送：WebSocket 通知审批人

---

## 入口与启动

- **Apps 配置**：`apps.py` -- name = `dvadmin3_flow`
- **URL 路由**：`urls.py` -- 前缀 `/api/dvadmin3_flow/`
- **注册方式**：通过 `settings.py` 中 `from dvadmin3_flow.settings import *` 自动注册（在 `application/settings.py:443` 处导入）
- **前端组件**：`web/src/views/plugins/dvadmin3-flow-web/`
- **租户模式**：`tenant_exclusive_apps = ['dvadmin3_flow']`（如启用多租户）

---

## 对外接口

| 路由后缀 | ViewSet | 说明 |
|----------|---------|------|
| `flow_info/` | FlowInfoViewSet | 流程定义管理 |
| `flow_data/` | FlowDataViewSet | 流程实例管理 |
| `flow_record/` | FlowRecordViewSet | 流转记录管理（推断） |
| `app_flow_info/` | AppFlowInfoViewSet | 应用端流程信息 |
| `app_flow_data/` | AppFlowDataViewSet | 应用端流程数据 |
| `flow_form_page/` | 视图函数 | 流程表单页面（HTML 渲染） |
| `flow_list_page/` | 视图函数 | 流程列表页面 |
| `flow_data_page/` | 视图函数 | 流程数据页面 |
| `flow_data_detail_page/` | 视图函数 | 流程详情页面 |

---

## 关键依赖与配置

- 插件自动注册：`settings.py` 将自身添加到 INSTALLED_APPS 和 PLUGINS_URL_PATTERNS
- 租户模式：`tenant_exclusive_apps = ['dvadmin3_flow']`
- `FlowBaseModel`：业务模型继承此基类即可自动接入审批引擎
- `@run_flow_work` 装饰器：注册自定义 workflow 函数供流程节点调用

---

## 数据模型

| 模型 | 核心字段 | 说明 |
|------|----------|------|
| FlowInfo | name, content_type, correlation_model_name, form_conf, status, operation, rule_status, enter_fields, exclude_fields | 流程定义 |
| FlowNode | flow_info(FK), node_id, name, node_type, props(JSON), branch(JSON), is_first, parent(FK) | 流程节点 |
| FlowData | flow_info(FK), no(自动生成), name, status, start_user, handler, pre_user/dept/role(M2M), current_node(JSON), pre_change_content(JSON) | 流程实例 |
| FlowRecord | flow_data(FK), pre_user/dept/role(M2M), handler, current_node_id, parent_node_id, type, status | 流转记录 |
| FlowAuditUsers | flow_record(FK), audit_user, status, description | 审核人员 |

### 节点类型

| 类型 | 说明 |
|------|------|
| Start | 开始节点 |
| Approval | 审批节点 |
| Gateway | 网关（条件分支） |
| Cc | 抄送节点 |
| End | 结束节点 |

### 审批状态

| 状态值 | 含义 |
|--------|------|
| 0 | 进行中 |
| 1 | 审核通过 |
| 2 | 审核驳回 |
| 3 | 审核撤销 |

### FlowBaseModel 审批引擎

`FlowBaseModel.process_engine(flow_data_id)` 是核心流转引擎，处理逻辑：

1. **检查当前记录状态**（是否需人工审核）
2. **查找下一节点**（依据 FlowNode 关系）
3. **根据节点类型分发处理**：
   - `_approval_node`：审批节点，推送消息给审批人
   - `_gateway_node`：网关，调用 `conditional_check` 评估条件分支
   - `_cc_node`：抄送节点，自动标记为已抄送
   - `_end_node`：结束节点，标记流程完成
4. **条件分支判断**：`conditional_check` 支持发起人部门/角色条件、数据库字段条件，AND/OR 组合
5. **递归调用自身**：处理后续节点（直到遇到需人工审核的节点或结束）

业务模型继承 `FlowBaseModel` 后，`save()` / `delete()` 方法会被拦截，自动创建 `FlowData` 实例并触发 `process_engine`。

---

## 测试与质量

- 无自动化测试
- **缺口**（优先级中）：
  - `FlowBaseModel.process_engine` 审批引擎逻辑（~900 行）需覆盖 5 种节点类型
  - `conditional_check` 条件分支判断需覆盖 AND/OR 组合、各种条件类型
  - `sameRoot.type == 'TO_SKIP'` 同发起人自动通过逻辑
  - WebSocket 消息推送需集成测试

---

## 常见问题 (FAQ)

**Q: 如何让业务模型支持审批？**
A: 继承 `FlowBaseModel`（from dvadmin3_flow.base_model），模型会自动在 save/delete 时触发审批流程。

**Q: 同发起人自动通过如何工作？**
A: 当 `sameRoot.type == 'TO_SKIP'` 且审批人包含发起人时，自动标记为通过。

**Q: 条件分支如何配置？**
A: 在流程设计器中为网关节点配置条件组，支持 AND/OR 逻辑、发起人部门/角色条件、数据库字段条件。条件配置存储在 `FlowNode.branch`（JSON 字段）中。

**Q: 前端审批组件如何注册？**
A: `web/src/views/plugins/index.ts` 的 `scanAndInstallPlugins()` 会自动扫描 `dvadmin3-flow-web/` 目录并注册异步组件。路由路径中的 `dvadmin3_flow/` 前缀会被 `backEnd.ts` 转换为 `dvadmin3-flow-web/src/` 格式。

---

## 相关文件清单

```
backend/plugins/dvadmin3_flow/
  __init__.py
  apps.py
  models.py              # 5 个模型
  base_model.py          # FlowBaseModel 审批引擎（~900 行）
  decorator.py           # @run_flow_work 装饰器
  settings.py            # 插件自动注册配置
  urls.py                # 路由配置
  views/
    __init__.py
    flow_info.py         # FlowInfoViewSet
    flow_data.py         # FlowDataViewSet
    flow_record.py       # FlowRecordViewSet
  app_views/
    __init__.py
    flow_info.py         # AppFlowInfoViewSet + 页面视图
    flow_data.py         # AppFlowDataViewSet + 页面视图
  fixtures/
    initialize.py        # 初始化数据
  migrations/
    0001_initial.py
    0002_initial.py
```
