from django.db import migrations


ROWS_PER_BLOCK = 14
COLUMNS_PER_BLOCK = 6


def get_block_count(sheet, product_count):
    occupied_rows = [int(row) for row in (sheet.get("cellData") or {})]
    occupied_count = 0
    if occupied_rows:
        occupied_count = max(occupied_rows) // ROWS_PER_BLOCK + 1
    product_count = int(product_count or 0)
    product_blocks = (
        product_count + COLUMNS_PER_BLOCK - 1
    ) // COLUMNS_PER_BLOCK
    return max(1, occupied_count, product_blocks)


def trim_row_mapping(row_mapping, row_limit):
    return {
        str(row): value
        for row, value in (row_mapping or {}).items()
        if int(row) < row_limit
    }


def normalize_row_data(sheet, block_count):
    row_limit = block_count * ROWS_PER_BLOCK
    row_data = trim_row_mapping(sheet.get("rowData"), row_limit)
    for block_index in range(block_count):
        block_start = block_index * ROWS_PER_BLOCK
        row_data[str(block_start)] = {"h": 42, "ah": 42, "ia": 1}
        for relative_row in range(1, ROWS_PER_BLOCK - 1):
            row_data[str(block_start + relative_row)] = {
                "h": 36,
                "ah": 36,
                "ia": 1,
            }
        row_data[str(block_start + ROWS_PER_BLOCK - 1)] = {
            "h": 16,
            "ah": 24,
            "ia": 1,
        }
    sheet["rowData"] = row_data


def trim_merges(merge_data, row_limit):
    trimmed = []
    for merged_range in merge_data or []:
        start_row = int(merged_range["startRow"])
        if start_row >= row_limit:
            continue
        trimmed.append({
            **merged_range,
            "endRow": min(int(merged_range["endRow"]), row_limit - 1),
        })
    return trimmed


def trim_sheet(sheet, product_count):
    block_count = get_block_count(sheet, product_count)
    row_limit = block_count * ROWS_PER_BLOCK
    sheet["cellData"] = trim_row_mapping(sheet.get("cellData"), row_limit)
    normalize_row_data(sheet, block_count)
    sheet["mergeData"] = trim_merges(sheet.get("mergeData"), row_limit)
    sheet["rowCount"] = row_limit


def trim_main_image_snapshots(apps, schema_editor):
    ProductSpecSubmission = apps.get_model(
        "design_order",
        "ProductSpecSubmission",
    )
    submissions = ProductSpecSubmission.objects.filter(
        template_type="main_image",
        snapshot_data__isnull=False,
    )
    for submission in submissions.iterator():
        snapshot = submission.snapshot_data
        for sheet in (snapshot.get("sheets") or {}).values():
            trim_sheet(sheet, submission.product_count)
        submission.snapshot_data = snapshot
        submission.save(update_fields=["snapshot_data"])


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0013_remove_jd_main_image_fields"),
    ]

    operations = [
        migrations.RunPython(
            trim_main_image_snapshots,
            migrations.RunPython.noop,
        ),
    ]
