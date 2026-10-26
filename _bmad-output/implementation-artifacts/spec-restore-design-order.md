---
title: '在 GitHub 最新框架中恢复设计工单'
type: 'bugfix'
created: '2026-10-26'
status: 'done'
baseline_commit: '3a04cb46f13c51c5cd475499126c133b5bc06070'
route: 'dispatch'
review_loop_iteration: 0
context: ['{project-root}/AGENTS.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

GitHub 最新框架已移除设计工单代码，本地菜单仍指向不存在的组件。用户选择保留最新框架，从 Codeup 迁回完整设计工单应用，使现有菜单和业务数据可正常使用。

## Boundaries & Constraints

保留新版登录、主题、会话初始化、公共请求和工作流。业务代码来源固定为 `d4e92e74606fb69ae9d268b5207fdf8d489c4341`，框架基线为 `3a04cb46f13c51c5cd475499126c133b5bc06070`。不覆盖旧版公共文件，不迁回任何凭据。保留已有数据库与权限；初始化、API及浏览器测试仅使用隔离数据库和端口。外部存储、源库同步沿用环境变量，不自动创建外部资源。

## I/O & Edge-Case Matrix

| 场景 | 结果 |
|---|---|
| 管理员打开六个设计工单菜单 | 页面可加载，列表接口成功；规格书编辑器可打开 |
| 普通用户无平台权限 | 保持来源的权限过滤，不自动扩大授权 |
| 读取旧提报或模板 | 兼容已有数据结构，不重建业务表 |
| 分享链接 | 保留来源已有的分享、掩码与禁用规则 |
| 未配置外部存储或源库 | 页面正常；依赖外部资源的操作明确反馈缺失配置 |

</frozen-after-approval>

## Code Map

- `backend/dvadmin/design_order/**`：整体恢复来源模块、迁移和测试；公共系统模型及 utils 沿用新版。
- `backend/application/{settings,urls}.py`：注册模块与接口，配置仅从环境读取。
- `backend/dvadmin/system/views/user.py`：增量接入平台授权接口；不替换新版用户校验。
- `web/src/{views,api}/design_order/**`、`web/src/utils/clipboard.ts`：恢复业务界面与请求。
- `web/src/router/{backEnd,index,route}.ts`：补编辑器隐藏路由及来源的匿名分享入口，保留会话 bootstrap。
- 新版有效用户管理入口：增量接入平台授权按钮和弹窗，不覆盖旧 CRUD 文件。
- `web/package.json`、`web/pnpm-lock.yaml`：仅补七个 Univer 0.25.1 依赖；保留新版其余依赖。
- `backend/application/e2e_settings.py`、`backend/scripts/prepare_e2e.py`、`web/tests/smoke/`：隔离验证入口。

## Tasks & Acceptance

**Execution:**
- [x] 先增加可复现缺失页面/API的测试，并确认失败。
- [x] 恢复上述后端模块；补 boto3 与模块注册、配置、平台授权接入。
- [x] 增加模块专用幂等字典/按钮补种，隔离验证三组店铺字典；禁止全库重置或初始化真实业务库。
- [x] 恢复前端模块、依赖、路由及平台授权界面；不改新版登录和主题。
- [x] 隔离验证来源业务测试、六页真实 API/浏览器加载、编辑器及既有系统冒烟；检查新增 lint/typecheck 问题。
- [x] 重启本地服务，核对业务库迁移状态，提供页面验证与未配置外部服务的边界。

**Acceptance Criteria:**
- Given 当前业务菜单，when 逐项打开，then 六个页面均有实际界面且无缺失组件或接口。
- Given 已有产品与提报，when 查询和读取，then 数据可用且迁移不清空旧记录。
- Given 新框架功能，when 登录并访问系统用户页，then 会话、权限和新版界面保持正常。

## Implementation Notes

只读调查确认本地业务表及 0001–0025 迁移记录仍在；空白来自模块代码缺失。缺失的字典与按钮需模块化接入，不能覆盖系统 fixture。

用户已于 2026-10-26 明确批准并继续实施。执行代理负责本方案内全部实现、测试和接入文件；不是独占工作区，不得撤销他人改动。开工前已有 `web/src/i18n/lang/zh-cn.ts` 的用户改动，必须保留且不纳入本任务提交/审查。主代理负责协调和最终验证，不并行修改实现文件。来源分享读取接口为 AllowAny，创建接口仍须认证及分享权限，不扩大权限。所需字典仅为 design_order_store_type、design_order_store_brand、design_order_store_platform；用户按钮仅为 user:PlatformPermission、user:PlatformPermissionUpdate。七个 Univer 包固定 0.25.1，沿用现有 pnpm 11.25.0 和本地 hoisted 布局。允许模块专用命令做必要且幂等的字典/按钮升级，但不在业务库执行 init 或测试；先在隔离库验证并备份。

主代理已完成业务库在线备份和幂等支持配置升级；三个业务表计数110/28/5不变，迁移计划无待执行。最终后端已重新启动以加载日期修复，8200页面与9000健康检查均200。暂存差异检查发现来源11个文件的尾随空白，已仅作空白清理并重新通过 cached diff --check。

## Spec Change Log

## Review Triage Log

| 编号 | 判定 | 路由 | 证据 |
|---|---|---|---|
| B1 | high | patch | 详情序列化包含原始snapshot_data；同一可见工单可绕过load_spec列遮罩。 |
| B2 | high | patch | load/share只改v，富文本p与公式f仍在响应；需一致清除内容载体。 |
| B3 | high | patch | SaveAPIView仅信任客户端***，无is_create/is_update校验；可改受限字段。 |
| B4 | high | patch | 普通CRUD的status/snapshot_data可写，绕过结构化提交校验与明细同步。 |
| B5 | high | patch | 草稿状态检查前无行锁；事务中的并发旧实例可覆盖已提交状态。 |
| B6 | medium | patch | 校验只取prod顶层，结构化specData中的自定义必填/价格值被忽略。 |
| B7 | medium | patch | 所有dateRange写入同一组顶层日期，动态日期键的对象未读取。 |
| B8 | medium | patch | 非空products=[{}]被视为有产品，nickname空时全部跳过校验。 |
| B9 | medium | patch | serializer每次validate选当前模板，单纯重命名会改变历史模板编码。 |
| B10 | medium | patch | Icon批量状态直接查所有ID，能把deleted改回enabled。 |
| B11 | medium | patch | 上传入口不检查uploading，并发批次共享剩余名额和完成状态。 |
| B12 | medium | patch | 前端删除负号/任意字符后parseFloat，与后端float拒绝规则不一致。 |
| E1 | high | patch | 同B1：详情快照原始输出路径确认。 |
| E2 | high | patch | 同B2：富文本内容保留路径确认。 |
| E3 | high | patch | 同B3：服务端保存无字段写入权限判断。 |
| E4 | high | patch | 同B5：先读草稿再保存，读取未加锁。 |
| E5 | medium | patch | 保存await期间仍可编辑，但成功后无条件清除isDirty，丢失未保存标记。 |
| E6 | medium | patch | 分享组件卸载后延时回调仍调用已清空univerAPI.addEvent，产生未处理异常。 |
| E7 | medium | patch | 同B10：deleted过滤只在get_queryset，批量操作绕过它。 |
| E8 | medium | patch | 同B11：并发拖拽/粘贴会超图片上限且提前允许保存。 |
| V1 | medium | patch | 已核对test:unit仅收集scripts/tests，新增六组test.mjs不在常规入口/CI。 |
| V2 | medium | patch | 已核对解析Icon消费者；缺同品牌/关联范围/状态排除的实际API集合断言。 |
| V3 | medium | patch | 同B10：验证层独立确认批量状态绕过软删除过滤。 |

## Verification

- 后端：`application.e2e_settings` 下的模块测试、迁移和权限验证。
- 前端：来源规格书单元测试、`pnpm lint`、`pnpm typecheck`、隔离 smoke。
- 浏览器：独立测试服务验证六页及规格书编辑器；本地服务仅作已授权页面使用核对。

审查归组：B1/E1；B2/E2；B3/E3；B5/E4；B10/E7/V3；B11/E8共享对应根因，其余独立。所有问题均以当前恢复路径的可触发输入或实际测试入口核对；采用最小私有实现修补，不新增业务能力或扩权。


## 最终审查与交付

23条审查发现均已修补并验证，无待修复审查项。服务端统一快照遮罩并清除富文本/公式载荷，强制字段写权限，阻止普通CRUD绕过正式提交流程；更新、保存及删除在事务内检查并锁定状态。修复动态字段、独立日期、空商品提交、历史模板保留、Icon软删除和品牌范围。前端修复并发上传、价格格式、保存期间新编辑标记及分享页卸载竞态，规格书回归进入标准test:unit。

最终完整pytest（模块及系统parity）87通过，标准前端单测91通过，lint零新增错误，既定范围typecheck及生产build通过；真实Chrome浏览器9通过，覆盖五列表、编辑器、分享、平台授权与现有登录/bootstrap。证据见design-order-restoration-report.md及各*-final.log。

最终本地后端已重启，8200与9000健康检查均200；只读核对业务表计数110/28/5不变。用户原有中文文件SHA256保持不变。按仓库约定不自动提交或推送。已知来源模型/迁移漂移、SQLite行锁限制与未配置外部服务均记录在报告中，不隐瞒为通过或已联调。
