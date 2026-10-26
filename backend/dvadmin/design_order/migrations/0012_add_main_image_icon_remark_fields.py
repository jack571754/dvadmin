from django.db import migrations


OLD_ROWS_PER_BLOCK = 15
NEW_ROWS_PER_BLOCK = 17
ICON_FIELD = {
    "row": 14,
    "key": "icon",
    "label": "icon",
    "style": "editableCenter",
    "kind": "text",
    "maskKey": "icon",
}
REMARK_FIELD = {
    "row": 15,
    "key": "remark",
    "label": "标注",
    "style": "editableCenter",
    "kind": "longtext",
    "maskKey": "remark",
}


def remap_row(row):
    block_index, relative_row = divmod(row, OLD_ROWS_PER_BLOCK)
    new_relative_row = 16 if relative_row == 14 else relative_row
    return block_index * NEW_ROWS_PER_BLOCK + new_relative_row


def remap_row_mapping(row_mapping):
    return {
        str(remap_row(int(row))): value
        for row, value in (row_mapping or {}).items()
    }


def normalize_row_heights(sheet):
    row_count = int(sheet.get("rowCount") or 0)
    block_count = max(1, (row_count + OLD_ROWS_PER_BLOCK - 1) // OLD_ROWS_PER_BLOCK)
    row_data = remap_row_mapping(sheet.get("rowData"))
    for block_index in range(block_count):
        block_start = block_index * NEW_ROWS_PER_BLOCK
        row_data[str(block_start + 14)] = {"h": 36, "ah": 36, "ia": 1}
        row_data[str(block_start + 15)] = {"h": 36, "ah": 36, "ia": 1}
        row_data[str(block_start + 16)] = {"h": 16, "ah": 24, "ia": 1}
    sheet["rowData"] = row_data
    sheet["rowCount"] = max(row_count, block_count * NEW_ROWS_PER_BLOCK)


def upgrade_sheet(sheet):
    sheet["cellData"] = remap_row_mapping(sheet.get("cellData"))
    normalize_row_heights(sheet)
    for merged_range in sheet.get("mergeData") or []:
        merged_range["startRow"] = remap_row(int(merged_range["startRow"]))
        merged_range["endRow"] = remap_row(int(merged_range["endRow"]))


def upgrade_snapshots(ProductSpecSubmission):
    submissions = ProductSpecSubmission.objects.filter(
        template_type="main_image",
        snapshot_data__isnull=False,
    )
    for submission in submissions.iterator():
        snapshot = submission.snapshot_data
        for sheet in (snapshot.get("sheets") or {}).values():
            upgrade_sheet(sheet)
        submission.snapshot_data = snapshot
        submission.save(update_fields=["snapshot_data"])


def upgrade_specs(ProductSpec):
    for spec in ProductSpec.objects.exclude(spec_data__isnull=True).iterator():
        spec_data = dict(spec.spec_data or {})
        spec_data.setdefault("icon", "")
        spec_data.setdefault("remark", "")
        spec.spec_data = spec_data
        spec.save(update_fields=["spec_data"])


def add_main_image_fields(apps, schema_editor):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    ProductSpecSubmission = apps.get_model("design_order", "ProductSpecSubmission")
    ProductSpec = apps.get_model("design_order", "ProductSpec")
    template = ProductSpecTemplate.objects.filter(template_code="main_image").first()
    if template:
        fields = [field for field in template.fields if field.get("key") not in {"icon", "remark"}]
        template.fields = [*fields, ICON_FIELD, REMARK_FIELD]
        template.rows_per_block = NEW_ROWS_PER_BLOCK
        template.save(update_fields=["fields", "rows_per_block"])
    upgrade_snapshots(ProductSpecSubmission)
    upgrade_specs(ProductSpec)


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0011_fill_main_image_template_metadata"),
    ]

    operations = [
        migrations.RunPython(add_main_image_fields, migrations.RunPython.noop),
    ]
