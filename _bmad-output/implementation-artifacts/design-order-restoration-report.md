# 设计工单恢复交付

已在GitHub框架基线 `3a04cb46f13c51c5cd475499126c133b5bc06070` 上，从固定Codeup来源 `d4e92e74606fb69ae9d268b5207fdf8d489c4341` 恢复设计工单。原空白原因是GitHub master已移除模块代码，而业务库保留了对应菜单。

## 已完成

恢复产品档案、店铺、规格提报、编辑器、模板、Icon库及后端0001–0025迁移，增量接入模块、平台授权和七个Univer 0.25.1依赖。保留新版登录、主题、会话bootstrap、请求、工作流和现有权限；未导入凭据。

支持命令仅幂等补三组店铺字典与两个平台授权按钮，不全库初始化、不增加角色授权。业务库先在线备份，再执行支持配置升级；迁移计划无待执行，未重建业务表。最后只读核对产品档案110、规格明细28、提报5，计数与备份一致。

独立审查23条发现已按共同根因修复：统一快照查询遮罩并清除富文本/公式内容载体；强制字段create/update策略并恢复受限旧值及快照；普通CRUD拒绝快照和提交写入；各修改/删除入口在事务中锁定并检查工单状态；兼容动态必填/价格/独立日期；拒绝空商品正式提交；保留历史模板；防止Icon软删除复活并校验品牌范围。前端修复并发上传、价格格式、保存中继续编辑的dirty标记与导航、分享延迟回调卸载；规格书测试接入日常入口。新增14项后端真实API及3项前端异步回归。

## 最终验证

所有初始化、API及浏览器自动测试使用 `application.e2e_settings`、隔离SQLite和8210/9010端口。

| 检查 | 结果 | 证据 |
|---|---|---|
| 完整模块及系统parity pytest | 87通过，26.24秒 | design-order-pytest-final.log |
| 标准test:unit（含规格书） | 91通过 | design-order-unit-final.log |
| lint | 0新增错误组，466项已有遗留错误 | design-order-lint-final.log |
| 既定范围typecheck | 退出0 | design-order-typecheck-final.log |
| 生产构建 | 通过，约1分钟 | design-order-build-final.log |
| 真实Chrome浏览器 | 9通过，43.7秒 | design-order-smoke-final.log |
| 持久缺失检查 | 2通过 | backend/scripts/test_design_order_restoration.py |
| 差异空白检查 | 工作树与既有暂存差异均通过 | git diff --check / --cached --check |

最终pytest命令：`python -m pytest dvadmin/design_order/tests dvadmin/system/tests_parity.py --ds=application.e2e_settings`。

前端使用Node24与corepack pnpm11.25.0；既定typecheck只覆盖tsconfig.refactor.json，恢复业务还经过Vite构建与真实浏览器验证。浏览器使用本机Chrome，临时配置为playwright-design-order.local.config.ts，未修改正式配置。浏览器验证五个真实列表API与表格、规格编辑器画布、平台授权弹窗、有效及无效匿名分享，以及既有登录/bootstrap/OAuth流程。7张design-order-*.png为隔离验证截图。

本地开发后端已重新启动加载最终补丁；前端 `http://localhost:8200/` 与后端 `http://127.0.0.1:9000/healthz` 均200。源码和API来源属于当前恢复工作树。用户已有web/src/i18n/lang/zh-cn.ts变更保持原哈希、不纳入任务审查。未提交、推送或部署。

## 已知边界

- 本机未配置Icon MinIO与实际源库；列表、模板和编辑器可加载，实际上传/同步未联调，相关操作明确报告缺失配置，没有自动创建外部资源。
- 来源模型与迁移存在既有漂移：ProductSpec的full_name、specification、gifts、threshold_a/b、value_a/b、member_gift/member_value、selling_point共10字段，模型为TextField，迁移为CharField。makemigrations --check --dry-run未通过，详情design-order-migration-drift.log。保留0001–0025，未新增/应用0026；SQLite当前读取兼容，其他数据库部署前需单独处理。
- SQLite不支持SELECT FOR UPDATE行锁；测试验证了状态规则，不证明生产行锁互斥。并发写入可能报database is locked，详见review-concurrency-notes.md；支持行锁的数据库仍需相应并发事务验证。
- 构建仍有大chunk和Sass弃用提示；现有后端SQLite注释及django-filter旧命名警告保留。
