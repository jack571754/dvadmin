from django.db import migrations


OLD_ROWS_PER_BLOCK = 17
NEW_ROWS_PER_BLOCK = 14
COLUMNS_PER_BLOCK = 6
REMOVED_KEYS = {"spec", "memberGift", "memberValue"}
ROW_MAP = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    5: 4,
    6: 5,
    7: 6,
    10: 7,
    11: 8,
    12: 9,
    14: 10,
    15: 11,
    13: 12,
    16: 13,
}
FIELDS = [
    {"row": 1, "key": "brand", "label": "品牌与标志", "style": "contentCenter", "kind": "text", "maskKey": "brand"},
    {"row": 2, "key": "nickname", "label": "产品昵称", "style": "editableCenter", "kind": "mention", "maskKey": "nickname"},
    {"row": 3, "key": "fullName", "label": "官方全称", "style": "contentLeft", "kind": "text", "maskKey": "full_name"},
    {"row": 4, "key": "efficacy", "label": "主打功效", "style": "contentLeft", "kind": "longtext", "maskKey": "efficacy"},
    {"row": 5, "key": "gifts", "label": "标配赠品配置", "style": "editableCenter", "kind": "gifts", "maskKey": "gifts"},
    {"row": 6, "key": "thresholdA", "label": "满赠档位配置", "style": "editableCenter", "kind": "tier", "maskKey": "threshold_a"},
    {"row": 7, "key": "sellingPoint", "label": "商品卖点", "style": "contentLeftShaded", "kind": "longtext", "maskKey": "selling_point"},
    {"row": 8, "key": "price", "label": "提报价格说明", "style": "editableCenter", "kind": "price", "maskKey": "price"},
    {"row": 9, "key": "dateRange", "label": "活动时间范围", "style": "editableCenter", "kind": "dateRange", "maskKey": "start_date"},
    {"row": 10, "key": "icon", "label": "icon", "style": "editableCenter", "kind": "text", "maskKey": "icon"},
    {"row": 11, "key": "remark", "label": "标注", "style": "editableCenter", "kind": "longtext", "maskKey": "remark"},
    {"row": 12, "key": "remarks", "label": "运营备注说明", "style": "editableCenter", "kind": "longtext", "maskKey": "remarks"},
]


def remap_row(row):
    block_index, relative_row = divmod(row, OLD_ROWS_PER_BLOCK)
    mapped_relative_row = ROW_MAP.get(relative_row)
    if mapped_relative_row is None:
        return None
    return block_index * NEW_ROWS_PER_BLOCK + mapped_relative_row


def remap_row_mapping(row_mapping):
    remapped = {}
    for row, value in (row_mapping or {}).items():
        mapped_row = remap_row(int(row))
        if mapped_row is not None:
            remapped[str(mapped_row)] = value
    return remapped


def get_block_count(sheet, product_count):
    occupied_rows = [int(row) for row in (sheet.get("cellData") or {})]
    occupied_count = 0
    if occupied_rows:
        occupied_count = max(occupied_rows) // OLD_ROWS_PER_BLOCK + 1
    product_count = int(product_count or 0)
    product_blocks = (
        product_count + COLUMNS_PER_BLOCK - 1
    ) // COLUMNS_PER_BLOCK
    return max(1, occupied_count, product_blocks)


def remap_merge(merged_range):
    mapped_rows = [
        remap_row(row)
        for row in range(
            int(merged_range["startRow"]),
            int(merged_range["endRow"]) + 1,
        )
    ]
    retained_rows = [row for row in mapped_rows if row is not None]
    if not retained_rows:
        return None
    return {
        **merged_range,
        "startRow": min(retained_rows),
        "endRow": max(retained_rows),
    }


def normalize_row_heights(sheet, block_count):
    row_limit = block_count * NEW_ROWS_PER_BLOCK
    row_data = {
        row: value
        for row, value in remap_row_mapping(sheet.get("rowData")).items()
        if int(row) < row_limit
    }
    for block_index in range(block_count):
        block_start = block_index * NEW_ROWS_PER_BLOCK
        row_data[str(block_start)] = {"h": 42, "ah": 42, "ia": 1}
        for relative_row in range(1, NEW_ROWS_PER_BLOCK - 1):
            row_data[str(block_start + relative_row)] = {"h": 36, "ah": 36, "ia": 1}
        row_data[str(block_start + NEW_ROWS_PER_BLOCK - 1)] = {"h": 16, "ah": 24, "ia": 1}
    sheet["rowData"] = row_data


def upgrade_sheet(sheet, product_count=0):
    block_count = get_block_count(sheet, product_count)
    sheet["cellData"] = remap_row_mapping(sheet.get("cellData"))
    normalize_row_heights(sheet, block_count)
    remapped_merges = [
        remap_merge(merged_range)
        for merged_range in (sheet.get("mergeData") or [])
    ]
    sheet["mergeData"] = [merged for merged in remapped_merges if merged]
    sheet["rowCount"] = block_count * NEW_ROWS_PER_BLOCK


def upgrade_snapshots(ProductSpecSubmission):
    submissions = ProductSpecSubmission.objects.filter(
        template_type="main_image",
        snapshot_data__isnull=False,
    )
    for submission in submissions.iterator():
        snapshot = submission.snapshot_data
        for sheet in (snapshot.get("sheets") or {}).values():
            upgrade_sheet(sheet, submission.product_count)
        submission.snapshot_data = snapshot
        submission.save(update_fields=["snapshot_data"])


def clear_removed_spec_values(ProductSpec):
    for spec in ProductSpec.objects.all().iterator():
        spec_data = dict(spec.spec_data or {})
        for key in REMOVED_KEYS:
            spec_data.pop(key, None)
        spec.specification = ""
        spec.member_gift = ""
        spec.member_value = ""
        spec.spec_data = spec_data
        spec.save(update_fields=[
            "specification",
            "member_gift",
            "member_value",
            "spec_data",
        ])


def remove_jd_main_image_fields(apps, schema_editor):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    ProductSpecSubmission = apps.get_model("design_order", "ProductSpecSubmission")
    ProductSpec = apps.get_model("design_order", "ProductSpec")
    template = ProductSpecTemplate.objects.filter(template_code="main_image").first()
    if template:
        validation = dict(template.validation or {})
        validation["requiredProductFields"] = ["brand", "fullName"]
        template.fields = FIELDS
        template.rows_per_block = NEW_ROWS_PER_BLOCK
        template.validation = validation
        template.save(update_fields=["fields", "rows_per_block", "validation"])
    upgrade_snapshots(ProductSpecSubmission)
    clear_removed_spec_values(ProductSpec)


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0012_add_main_image_icon_remark_fields"),
    ]

    operations = [
        migrations.RunPython(
            remove_jd_main_image_fields,
            migrations.RunPython.noop,
        ),
    ]
