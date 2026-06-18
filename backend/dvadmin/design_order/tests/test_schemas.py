import pytest
from dvadmin.design_order.templates_schemas import (
    TEMPLATES, get_schema, get_rows_per_block, get_fields,
    get_field_by_row, get_maskkey_to_row,
)


@pytest.mark.django_db
def test_all_templates_have_required_keys():
    for ttype, schema in TEMPLATES.items():
        assert schema["templateType"] == ttype
        assert schema["label"]
        assert schema["rowsPerBlock"] >= 3
        assert schema["columnsPerBlock"] == 6
        assert len(schema["fields"]) == schema["rowsPerBlock"] - 2, ttype
        assert "validation" in schema


@pytest.mark.django_db
def test_field_rows_unique_and_contiguous():
    for ttype, schema in TEMPLATES.items():
        rows = sorted(f["row"] for f in schema["fields"])
        assert rows == list(range(1, schema["rowsPerBlock"] - 1)), ttype


@pytest.mark.django_db
def test_main_image_matches_legacy_hardcoded_offsets():
    """main_image 字段键/遮罩键/行偏移必须与旧硬编码完全一致（保行为零变化）。"""
    s = get_schema("main_image")
    assert get_rows_per_block("main_image") == 15
    legacy = {
        1: ("brand", "brand"),
        2: ("nickname", "nickname"),
        3: ("fullName", "full_name"),
        4: ("spec", "specification"),
        5: ("efficacy", "efficacy"),
        6: ("gifts", "gifts"),
        7: ("thresholdA", "threshold_a"),
        8: ("memberGift", "member_gift"),
        9: ("memberValue", "member_value"),
        10: ("sellingPoint", "selling_point"),
        11: ("price", "price"),
        12: ("dateRange", "start_date"),
        13: ("remarks", "remarks"),
    }
    by_row = {f["row"]: f for f in s["fields"]}
    assert set(by_row.keys()) == set(legacy.keys())
    for r, (key, maskKey) in legacy.items():
        assert by_row[r]["key"] == key, r
        assert by_row[r]["maskKey"] == maskKey, r


@pytest.mark.django_db
def test_live_stream_field_keys_decoupled_from_main_image():
    """修复点：live_stream 第5行 key 不再是 efficacy。"""
    f5 = get_field_by_row("live_stream", 5)
    assert f5["key"] == "livestreamScript"
    assert f5["maskKey"] == "livestream_script"


@pytest.mark.django_db
def test_maskkey_to_row_covers_all_fields():
    for ttype in TEMPLATES:
        m = get_maskkey_to_row(ttype)
        assert len(m) == len(get_fields(ttype)), ttype
