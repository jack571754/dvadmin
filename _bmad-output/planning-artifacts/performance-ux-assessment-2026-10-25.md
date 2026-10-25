# DVAdmin 性能与交互体验评估

日期：2026-10-25。范围：当前工作树静态审查、现有构建文件大小核算及已有截图参考。没有修改应用代码，没有启动业务服务、查询业务数据库或执行压力测试。源码与构建文件可能来自不同工作时点，二者不视为完全一致。

## 判断

现有 shared/access、shared/api、features/users、features/roles 已有请求去重、会话换代、失败重试、操作锁和表单保护。建议围绕这些基础补齐接入和覆盖，不做整体重写。

### 1. P0：用户页面与 CRUD 新接口不兼容

- `web/src/views/system/user/index.vue:125` 以 `context: {} as any` 调用 createCrudOptions。
- `web/src/views/system/user/crud.tsx:29` 直接解构 `page.i18n`，随后读取 `page.statusMutation.pending`。
- `web/src/views/system/user/context.ts` 定义了必需的列表请求、i18n、状态锁、表单会话等字段。
- 结论：当前调用提供不了被调用方所需的上下文，按这份源码执行初始化会触发异常。这是代码层面的确定性不兼容，尚未启动浏览器复现。
- 建议：把完整页面上下文接回去，消除空对象的 any 断言。补真实用户页加载、筛选、编辑、状态变更的 smoke 覆盖；领域函数单测不能替代页面接线验证。

### 2. P1：可选资源实际仍阻塞首屏

- `web/src/router/backEnd.ts:51` 等待用户信息后才请求菜单等初始化资源。
- `web/src/router/backEnd.ts:191` 启动系统配置、部门、字典；`:201` 在返回菜单前 `await optional`。
- `web/src/shared/access/startupResources.ts` 的返回值要等所有资源 settled 后才完成。
- 影响：可选请求即使失败不再使初始化报错，慢请求仍会拖延路由发布。性能影响取决于实际延迟，未实测毫秒数。
- 建议：区分“身份/菜单/权限必须就绪”与“页面可延迟补全”；解除等待前先让消费端处理 pending/error/retry，不简单删除 await。跨请求并行需保留 session 校验与权限关闭默认值。
- 验收：将字典请求延迟数秒，主导航应仍可用；依赖字典的字段显示加载状态，不能默认为空值提交。

### 3. P1：首页图表的请求与展示状态需要修正

- `web/src/views/system/home/components/AreaTrendChart.vue:49` 每次调用都直接更新图表，没有请求序号或旧响应隔离。
- `:205` 切换 7/30/90 天会发起新请求；旧请求晚到可能覆盖新选择，早结束请求也可能提前清除 loading。
- `:69` 失败后画一组零值，无法区分“没有访问”与“服务不可用”。
- `:227` 切换明暗主题会 dispose 图表并重新请求同样的数据。
- 建议：复用 createLatestRequest，主题变化使用已取得数据重绘；区分 loading、empty、error、forbidden，显示重试。数据失败时 KPI 显示未知或上次更新时间，不能冒充业务零值。
- 验收：人为倒置多次请求返回顺序，最终范围、图表与 loading 一致；切换主题不增加统计 API 请求。

### 4. P1：后端列表返回结构存在查询与响应体放大

- `backend/dvadmin/system/views/user.py:55` 用户的每个角色都交给 RoleSerializer。
- `backend/dvadmin/system/views/role.py:27` RoleSerializer 的 users 字段查询并输出该角色所有成员。
- `backend/dvadmin/system/views/user.py:235` 基础 queryset 未在此配置 select_related/prefetch_related；通用 get_queryset 也未自动补预加载。
- `backend/dvadmin/utils/serializers.py:30` 每条对象的 modifier_name 单独查询 Users。
- `backend/dvadmin/system/views/menu.py:29` 与 `:37` 菜单序列化还逐项查询按钮和子节点。
- 影响：默认序列化用户列表时可能反复携带“角色成员列表”，查询和响应体随数据规模增长。实际成本还取决于请求的动态字段选择，不能仅靠代码给出生产 SQL 数量。
- 建议：用户列表只返回角色摘要，成员列表放到独立分页 API；按列表/详情区分 serializer，批量加载部门、角色和审计人，菜单子节点用聚合/存在性注解处理。
- 验收：隔离数据中对比 20/100 条列表的 SQL 数、响应体与耗时；保留字段权限、数据权限及旧接口契约。

### 5. P1：首屏资源有明显减负空间

本次只读核算已有 `web/dist/assets`（文件时间约为 2026-10-25 22:14），未重新构建：

| 文件 | 原始字节 | 本地 gzip 字节 |
| --- | ---: | ---: |
| index.u9H96Eaa.js | 1966067 | 610443 |
| index.CzJN_cmI.css | 1314580 | 303001 |
| echarts.DfIOIJIg.js | 1042936 | 344819 |
| jsoneditor.min.KWjAQUn1.js | 2091126 | 570893 |

这些是单文件大小，不是首屏网络传输量，也不能据此断言所有文件都会首屏下载。本地 gzip 结果不代表服务器已启用压缩。

- `web/src/main.ts` 全局安装 Element Plus、图标选择器和多套图标资源。
- `web/src/utils/other.ts:3` 引入全部 Element 图标，遍历全局注册。
- `web/src/settings.ts:16` 引入编辑器与上传扩展并在全局安装。
- `web/src/i18n/index.ts:20` eager 导入所有语言。
- 首页图表以 `import * as echarts` 使用完整图表库。
- 建议：先测首屏依赖图，优先延迟图标选择器、编辑器、JSON 编辑器与非必要上传能力；图表按实际类型注册；保留动态菜单所需的图标映射，不能盲目删图标。语言是否拆分依据体积收益决定。
- 验收：相同生产构建、浏览器、数据、网络条件下比较首屏 JS/CSS 下载量、解析时间与页面可操作时间。单纯 manualChunks 和提高 chunkSizeWarningLimit 不作为验收收益。

### 6. P2：后台操作效率与可访问性

- `web/src/settings.ts:101` 全局关闭内置列设置，注释说明现有组件缺失。建议自建经过字段权限过滤的列显示/顺序/宽度偏好，不能直接重新打开旧按钮；不同账号偏好隔离。
- `web/src/layout/command/CommandMenu.vue:4` 在容器上捕获 Enter，没有检查输入法 composition；中文候选确认可能同时触发导航。
- 同一命令菜单没有对话框/listbox 语义、焦点圈定和关闭后的焦点恢复；建议沿用现有对话框能力补齐键盘及读屏行为。
- `web/src/layout/component/main.vue:53` 固定等待 600ms 才移除全局 loading；建议按实际就绪状态结束，动画只做短暂收尾。
- `web/src/layout/routerView/parent.vue:5` KeepAlive 没有 max；按访问数量和图表/树/表格内存测量再设置缓存预算，避免无限保留重页面实例，同时保护草稿和筛选状态。
- 对列表进一步统一筛选摘要、一键清除、空结果与错误状态、导入逐行失败反馈。已有用户/角色部分实现过这些能力，应扩大覆盖，避免重复写一套。

## 推荐推进顺序

1. 用户页接入修复，恢复完整 smoke 路径。
2. 首屏等待与图表状态修复；这是范围小、用户能直接感知的改动。
3. 隔离数据集测 SQL 与响应体，优化用户/角色列表；保留授权语义。
4. 测量生产首屏后做资源延迟加载，比较前后数字。
5. 统一列偏好、键盘操作、错误状态、移动端主要任务路径。

没有对当前生产页面做交互实测；历史截图只用于参考，不据此判定当前工作树的移动端/视觉效果。仓库已有 browser-baseline.json 是 10 月 24 日的旧测量（loopback、无网络与 CPU 限速），不能作为当前外网用户体验指标。新增方案应重新采样，并把可操作时间、接口查询数和关键交互成功率一起记录。
