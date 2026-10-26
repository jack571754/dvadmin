import importlib


migration = importlib.import_module(
    "dvadmin.design_order.migrations.0013_remove_jd_main_image_fields"
)


def test_upgrade_sheet_removes_deleted_rows_and_reorders_notes():
    sheet = {
        "rowCount": 17,
        "cellData": {
            str(row): {"1": {"v": f"old-{row}"}}
            for row in range(17)
        },
        "rowData": {
            str(row): {"h": row}
            for row in range(17)
        },
        "mergeData": [
            {"startRow": 13, "endRow": 15, "startColumn": 0, "endColumn": 0},
        ],
    }

    migration.upgrade_sheet(sheet)

    assert sheet["rowCount"] == 14
    assert [sheet["cellData"][str(row)]["1"]["v"] for row in range(14)] == [
        "old-0",
        "old-1",
        "old-2",
        "old-3",
        "old-5",
        "old-6",
        "old-7",
        "old-10",
        "old-11",
        "old-12",
        "old-14",
        "old-15",
        "old-13",
        "old-16",
    ]
    assert sheet["mergeData"][0]["startRow"] == 10
    assert sheet["mergeData"][0]["endRow"] == 12


def test_upgrade_sheet_remaps_multiple_product_blocks():
    sheet = {
        "rowCount": 34,
        "cellData": {
            "17": {"1": {"v": "second-header"}},
            "21": {"1": {"v": "removed-spec"}},
            "31": {"1": {"v": "second-icon"}},
        },
        "rowData": {},
        "mergeData": [],
    }

    migration.upgrade_sheet(sheet)

    assert sheet["rowCount"] == 28
    assert sheet["cellData"]["14"]["1"]["v"] == "second-header"
    assert sheet["cellData"]["24"]["1"]["v"] == "second-icon"
    assert all(cell["1"]["v"] != "removed-spec" for cell in sheet["cellData"].values())


def test_upgrade_sheet_ignores_preallocated_blank_rows():
    sheet = {
        "rowCount": 238,
        "cellData": {
            "0": {
                "0": {"v": "配置字段"},
                "1": {"v": "商品提报 1"},
                "2": {"v": "商品提报 2"},
            },
            "1": {"1": {"v": "品牌 A"}, "2": {"v": "品牌 B"}},
        },
        "rowData": {
            str(row): {"h": 36}
            for row in range(238)
        },
        "mergeData": [],
    }

    migration.upgrade_sheet(sheet, product_count=2)

    assert sheet["rowCount"] == 14
    assert max(map(int, sheet["rowData"])) == 13
