[根目录](../../../CLAUDE.md) > [backend](../../CLAUDE.md) > [dvadmin](../) > **design_order**

# Design Order 模块文档

> 最后更新：2026-06-17 15:46:52

## 变更记录 (Changelog)

| 时间 | 变更内容 |
|------|----------|
| 2026-06-18 | 模板引擎化改造：新增 templates_schemas.py（前后端共享 Schema，三模板声明式配置）、ProductSpec 增加 spec_data JSONField、SaveProductSpecView/LoadProductSpecView 改为 Schema 驱动遮罩/校验/保存、删除 ROW_TO_FIELD_MAP_15/16 硬编码映射、修复 live_stream/detail_page 字段错位（livestreamScript/pageClaim 不再被当 efficacy）、新增 tests/ 测试包（10 用例）|
| 2026-06-17 15:46:52 | 增量更新：补全 SaveProductSpecView.validate_submission 校验逻辑（提报级+产品级+价格+日期）、merge_snapshots 字段恢复机制、LoadProductSpecView 15/16 行双模板遮罩（ROW_TO_FIELD_MAP_15/16）、ProductArchive.dict 字典接口字段遮罩、ProductSpecSubmission.copy 一键复用实现、ProductSpec 模型新增 threshold_b/value_b 字段、刷新对外接口表与文件清单 |
| 2026-06-11 18:44:26 | 初始化模块文档 |

---

## 模块职责

设计工单管理模块，服务于美妆行业的活动提报业务。核心功能包括：
- 产品档案管理（正品/小样，在售/停售/待上市状态，20+ 字段）
- 产品规格提报（Univer 电子表格快照 + 结构化明细双存储）
- 活动提报的创建/编辑/复用/提交全流程（草稿/已提交双状态）
- 字段级权限遮罩（配合 system 模块的 FieldPermission，前后端同步）
- 提交时强制校验（必填/价格格式/日期范围）

---

## 入口与启动

- **Apps 配置**：`apps.py` -- `DesignOrderConfig`, name = `dvadmin.design_order`, verbose_name = "设计工单管理"
- **URL 路由**：`urls.py` -- 前缀 `/api/design_order/`
- **注册方式**：在 `application/settings.py` 的 `INSTALLED_APPS` 中显式注册（非插件，不走 `from xxx.settings import *`）

---

## 对外接口

| 路由后缀 | View/APIView | 方法 | 说明 |
|----------|-------------|------|------|
| `product_archives/` | ProductArchiveViewSet | CRUD + multiple_delete + get_by_ids | 产品档案标准 CRUD（继承 CustomModelViewSet 全部能力） |
| `product_archives/dict/` | ProductArchiveViewSet.dict | GET | 产品档案字典（下拉选择），含字段遮罩 |
| `product_archives/save_spec/` | SaveProductSpecView | POST | 保存规格书（Univer 快照 + 产品明细 + 校验 + 遮罩合并） |
| `product_archives/load_spec/` | LoadProductSpecView | GET | 加载规格书快照（含字段遮罩，支持 15/16 行双模板） |
| `product_specs/` | ProductSpecViewSet | CRUD | 规格明细标准 CRUD |
| `product_specs/field_permission/` | ProductSpecViewSet（来自 CustomModelViewSet） | GET | 获取字段权限（前端调用） |
| `product_spec_submissions/` | ProductSpecSubmissionViewSet | CRUD + copy | 提报历史 CRUD |
| `product_spec_submissions/{id}/copy/` | ProductSpecSubmissionViewSet.copy | POST | 一键复用活动提报（克隆 submission + 关联 ProductSpec 明细） |
| `product_spec_submissions/field_permission/` | ProductSpecSubmissionViewSet | GET | 获取字段权限 |

### 请求/响应示例（SaveProductSpecView）

请求体（POST `/api/design_order/product_archives/save_spec/`）：

```json
{
  "id": 12,                       // 可选，存在则更新
  "name": "5月活动提报",
  "shop": "天猫旗舰店",
  "status": "submitted",          // submitted 时触发 validate_submission
  "templateType": "main_image",
  "formCount": 6,
  "products": [
    {
      "cardIndex": 0,
      "brand": "巨子生物 | 可丽金",
      "nickname": "可丽金胶卷精华水",
      "fullName": "可丽金胶卷精华水",
      "spec": "150ml",
      "efficacy": "...",
      "gifts": [{"name": "...", "qty": "1"}],
      "thresholdA": "满 369 元",
      "valueA": "价值 143 元",
      "thresholdB": "",
      "valueB": "",
      "memberGift": "...",
      "memberValue": "...",
      "sellingPoint": "...",
      "price": "269",
      "startDate": "2026-05-15 00:00",
      "endDate": "2026-05-31 00:00",
      "remarks": "..."
    }
  ],
  "snapshot": { "sheets": {...} }
}
```

校验失败响应：

```json
{
  "code": 4000,
  "msg": "提交校验未通过，请修正以下问题后重新提交",
  "data": {
    "errors": [
      {
        "productIndex": 0,
        "productLabel": "商品提报 1",
        "field": "price",
        "fieldLabel": "提报价格",
        "rule": "format",
        "message": "商品提报 1 的「提报价格」必须为大于0的数值"
      }
    ]
  }
}
```

---

## 模板 Schema（前后端共享单一事实源）

`templates_schemas.py` 定义三份提报模板的声明式 Schema（与前端 `web/src/views/design_order/product_spec/schema/templates.ts` 对等），每份 Schema 描述：行布局（`rowsPerBlock`/`columnsPerBlock`）、字段定义（`fields`：行偏移/字段键/标签/样式/类型/必填/遮罩键）、校验规则（`validation`：提报级必填/价格键/日期键）。

`SaveProductSpecView.validate_submission`、`_do_save`、`LoadProductSpecView` 的遮罩/校验/保存全部由 Schema 驱动；动态字段统一存入 `ProductSpec.spec_data`（JSONField），按当前模板字段键存储。

**新增模板只需**：在 `templates_schemas.py` 追加一个 Schema dict 并注册到 `TEMPLATES`，同时在 `web/.../schema/templates.ts` 追加对等定义并注册到 `ALL_TEMPLATES`。零数据库迁移、零业务代码改动。

提供的查询函数：`get_schema` / `get_rows_per_block` / `get_fields` / `get_field_by_row` / `get_maskkey_to_row`。

---

## 关键依赖与配置

- 继承 `CoreModel`（公共审计字段：create_datetime / update_datetime / creator / modifier / dept_belong_id / is_deleted）
- 视图集继承 `CustomModelViewSet` + `FieldPermissionMixin`
- 权限类：`CustomPermission`
- 过滤器：`CustomDjangoFilterBackend` + SearchFilter + OrderingFilter
- 与 `system` 模块强依赖：`MenuField`、`FieldPermission` 用于字段遮罩
- `SaveProductSpecView` / `LoadProductSpecView` 使用 `permissions.IsAuthenticated`（不走 CustomPermission）
- 事务保护：`SaveProductSpecView.post` 使用 `transaction.atomic()` 包裹 `_do_save`

### ProductArchiveViewSet.filter_fields

```python
['product_code', 'product_name', 'brand', 'product_type',
 'product_status', 'sale_status', 'need_maintenance', 'nickname',
 'short_name']
```

### ProductArchiveViewSet.search_fields

```python
['product_code', 'product_name', 'short_name', 'nickname', 'brand']
```

---

## 数据模型

| 模型 | 表名 | 核心字段 | 说明 |
|------|------|----------|------|
| ProductArchive | `dvadmin_design_order_product_archive` | product_code(唯一), product_name, specification, unit, short_name, brand, product_category, product_classification, retail_price, nickname, series, category, product_type(authentic/sample), product_status(on_sale/off_sale/pending), box_spec, sale_status(on_sale/new), auxiliary, need_maintenance, keywords | 产品档案（20 字段） |
| ProductSpecSubmission | `dvadmin_design_order_product_spec_submission` | name, shop, status(draft/submitted), product_count, snapshot_data(JSON), template_type | 提报历史维度表 |
| ProductSpec | `dvadmin_design_order_product_spec` | submission(FK), card_index, product(FK), nickname, brand, full_name, specification, efficacy, gifts, threshold_a, value_a, threshold_b, value_b, member_gift, member_value, selling_point, price, start_date, end_date, remarks | 规格明细（单产品卡片，20 字段） |
| ProductSpecSnapshot | `dvadmin_design_order_product_spec_snapshot` | snapshot_data(JSON), form_count | Univer 表格快照（独立存储，与 Submission 解耦） |

### 模型关系

```
ProductSpecSubmission 1--N ProductSpec (CASCADE)
ProductSpec N--0..1 ProductArchive (SET_NULL)
ProductSpecSubmission 包含 snapshot_data (Univer JSON)
ProductSpecSnapshot 独立表（form_count + snapshot_data）
```

---

## 核心业务逻辑

### SaveProductSpecView.validate_submission (字段校验)

校验仅在 `status == 'submitted'` 时触发，分两级：

**提报级校验**：
- `name` 必填
- `shop` 必填
- `products` 至少 1 个

**产品级校验**（跳过 nickname 为空的产品）：
- `brand` 必填且不为 `***`
- `fullName` 必填且不为 `***`
- `spec` 必填且不为 `***`
- `price` 必填，且必须可转为 float 且 > 0（支持千分位逗号）
- `startDate` / `endDate` 必填且不为 `***`

返回 `errors` 列表，每项含 `productIndex`、`productLabel`、`field`、`fieldLabel`、`rule`(required/format/range)、`message`。

### SaveProductSpecView._do_save (保存逻辑)

1. 若 `submission_id` 存在：查找记录，校验"已提交状态非超管不可改"，并执行 `merge_snapshots`（若非超管且新快照含 `***`，从旧快照恢复原值与样式）
2. 否则：创建新 `ProductSpecSubmission`，自动生成默认名称（`活动提报_YYYYMMDD_HHMMSS`）
3. 删除该 submission 下既有 ProductSpec 明细
4. 遍历 products，对每个字段执行 `***` 检测：若为 `***` 则从既有 spec 中恢复原值
5. 通过 `fullName + spec` / `nickname + spec` / `fullName` / `nickname` 四级匹配关联 ProductArchive
6. 创建 ProductSpec 明细记录

### merge_snapshots (字段值恢复)

```python
def merge_snapshots(old_snapshot, new_snapshot):
    # 仅当 new_cell.v == '***' 时，从 old_cell 恢复 v 与样式
    # 用于：非超管用户保存时，无权修改的字段会以 *** 形式回传，需保留原值
```

### LoadProductSpecView (字段遮罩)

1. 根据 `?id=submission_id` 查找快照
2. 若非超管且快照存在：
   - 查询用户的 `FieldPermission` 中 `is_query=True` 的字段
   - 计算受限字段集合 = `MenuField(ProductSpec) - queryable_fields`
   - 遍历 snapshot.sheets[*].cellData：
     - 通过第 13 行第 0 列的值判断是 16 行模板（"活动结束日期"/"活动结束时间"）还是 15 行模板
     - 对 `row % mod_val` 命中 `ROW_TO_FIELD_MAP` 且在受限集合中的行，将 col > 0 的单元格 `v` 替换为 `***`

### ROW_TO_FIELD_MAP (15 行模板)

```python
ROW_TO_FIELD_MAP_15 = {
    1: 'brand', 2: 'nickname', 3: 'full_name', 4: 'specification',
    5: 'efficacy', 6: 'gifts', 7: 'threshold_a', 8: 'member_gift',
    9: 'member_value', 10: 'selling_point', 11: 'price',
    12: 'start_date', 13: 'remarks'
}
```

16 行模板额外在位置 13 加入 `end_date`，其他字段后移一位。

### ProductSpecSubmissionViewSet.copy (一键复用)

1. 克隆原 submission，新名称默认 `{原名}_复用`，状态重置为 `draft`
2. 查询原 submission 关联的所有 ProductSpec
3. 重置 `pk = None` 后 `bulk_create` 到新 submission

---

## 测试与质量

- 无自动化测试
- **缺口**（优先级高）：
  - `SaveProductSpecView.validate_submission` 校验逻辑需覆盖各种边界（空值、`***`、价格格式、日期范围）
  - `merge_snapshots` 字段恢复逻辑需覆盖嵌套 sheets/cellData 异常情况
  - `LoadProductSpecView` 15/16 行模板判断逻辑需覆盖（依赖 row 13 col 0 的值）
  - `ProductSpecSubmissionViewSet.copy` 需验证 ProductSpec 关联是否正确克隆
  - `ProductArchive.dict` 字段遮罩需覆盖超管/普通用户分支

---

## 常见问题 (FAQ)

**Q: SaveProductSpecView 和标准 ViewSet 有什么区别？**
A: SaveProductSpecView 是自定义 APIView，接收前端 Univer 表格的批量数据，一次性完成：保存快照、创建/更新规格明细、同步产品档案、处理字段遮罩合并、提交时校验。不走 CustomModelViewSet 的标准 CRUD 流程。

**Q: 字段遮罩如何工作？**
A: `LoadProductSpecView` 根据当前用户的角色权限，对 snapshot_data 中的受限字段值替换为 `***`；`SaveProductSpecView` 在保存时，如果新数据中某字段值为 `***`，则从既有 ProductSpec / 旧 snapshot 中恢复原值（`merge_snapshots` 函数 + per-field 检测）。

**Q: template_type 有哪些选项？**
A: 默认为 `main_image`（主图模板）。前端 `constants.ts` 还定义了 `live_stream`（直播）和 `detail_page`（详情页）模板的标签映射，但后端未强制约束枚举值。

**Q: 为什么需要 15 行和 16 行两套字段映射？**
A: 15 行模板不含"活动结束日期"行（结束日期合并到开始日期行），16 行模板独立一行。`LoadProductSpecView` 通过第 13 行第 0 列的标签文本动态判断模板类型并应用对应的 `ROW_TO_FIELD_MAP`。

**Q: 已提交状态如何保护？**
A: 在 `_do_save` 中：若 `submission.status == 'submitted'` 且 `not user.is_superuser`，返回 `ErrorResponse(msg="该提报已提交正式归档，无法修改", status=400)`。前端 product_spec/index.vue 也通过 `submissionStatus === 'submitted'` 隐藏保存/编辑按钮，并拦截 `BeforeSheetEditStart` 事件。

**Q: ProductSpecSnapshot 表为什么几乎不用？**
A: 历史遗留模型，当前实现已将 `snapshot_data` 直接存储在 `ProductSpecSubmission` 中。`ProductSpecSnapshot` 仅作为独立快照表保留，未在视图中使用。

---

## 相关文件清单

```
backend/dvadmin/design_order/
  __init__.py
  apps.py                       # DesignOrderConfig
  admin.py                      # Django Admin 注册
  models.py                     # 4 个模型（187 行）
  views.py                      # 3 ViewSet + 2 APIView（546 行）
    - ProductArchiveViewSet（含 dict action + 字段遮罩）
    - ProductSpecViewSet
    - ProductSpecSubmissionViewSet（含 copy action）
    - SaveProductSpecView（含 validate_submission + _do_save + merge_snapshots）
    - LoadProductSpecView（含 15/16 行双模板遮罩）
  serializers.py                # 3 个序列化器（34 行）
  urls.py                       # 路由配置（21 行）
  migrations/
    0001_initial.py
    0002_productspec_productspecsnapshot.py
    0003_productarchive_gifts.py
    0004_productspecsubmission_productspec_submission.py
```

### 关键常量

| 名称 | 位置 | 说明 |
|------|------|------|
| `ROW_TO_FIELD_MAP_15` | `views.py:133` | 15 行模板行号到字段名映射（13 字段） |
| `ROW_TO_FIELD_MAP_16` | `views.py:116` | 16 行模板行号到字段名映射（14 字段，含 end_date） |
| `ROW_TO_FIELD_MAP` | `views.py:149` | 当前默认使用的映射（= `ROW_TO_FIELD_MAP_15`） |
