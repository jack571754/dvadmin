import pytest
from dvadmin.design_order.template_models import ProductSpecTemplate
from dvadmin.design_order.template_service import (
    get_field_by_row,
    get_fields,
    get_maskkey_to_row,
    get_rows_per_block,
    get_schema,
)


@pytest.mark.django_db
def test_all_templates_have_required_keys():
    templates = ProductSpecTemplate.objects.all()
    assert set(templates.values_list("platform", flat=True)) == {
        "京东", "天猫", "拼多多", "抖音", "唯品会", "小红书", "中免日上", "视频号", "美团闪购", "招商银行",
    }
    for template in templates:
        ttype = template.template_code
        schema = get_schema(template.template_code)
        assert schema["templateType"] == template.template_code
        assert schema["label"]
        assert schema["rowsPerBlock"] >= 3
        assert schema["columnsPerBlock"] == 6
        assert len(schema["fields"]) == schema["rowsPerBlock"] - 2, ttype
        assert "validation" in schema


@pytest.mark.django_db
def test_field_rows_unique_and_contiguous():
    for template in ProductSpecTemplate.objects.all():
        ttype = template.template_code
        schema = get_schema(ttype)
        rows = sorted(f["row"] for f in schema["fields"])
        assert rows == list(range(1, schema["rowsPerBlock"] - 1)), ttype


@pytest.mark.django_db
def test_main_image_excludes_removed_jd_fields():
    """京东主图不再包含商品规格和会员专享礼字段。"""
    s = get_schema("main_image")
    assert get_rows_per_block("main_image") == 14
    expected = {
        1: ("brand", "brand"),
        2: ("nickname", "nickname"),
        3: ("fullName", "full_name"),
        4: ("efficacy", "efficacy"),
        5: ("gifts", "gifts"),
        6: ("thresholdA", "threshold_a"),
        7: ("sellingPoint", "selling_point"),
        8: ("price", "price"),
        9: ("dateRange", "start_date"),
        10: ("icon", "icon"),
        11: ("remark", "remark"),
        12: ("remarks", "remarks"),
    }
    by_row = {f["row"]: f for f in s["fields"]}
    for r, (key, maskKey) in expected.items():
        assert by_row[r]["key"] == key, r
        assert by_row[r]["maskKey"] == maskKey, r
    assert not {"spec", "memberGift", "memberValue"} & {
        field["key"] for field in s["fields"]
    }
    assert by_row[10] == {
        "row": 10,
        "key": "icon",
        "label": "icon",
        "style": "editableCenter",
        "kind": "longtext",
        "maskKey": "icon",
    }
    assert by_row[11] == {
        "row": 11,
        "key": "remark",
        "label": "标注",
        "style": "editableCenter",
        "kind": "longtext",
        "maskKey": "remark",
    }
    assert by_row[12]["key"] == "remarks"


@pytest.mark.django_db
def test_maskkey_to_row_covers_all_fields():
    for ttype in ProductSpecTemplate.objects.values_list("template_code", flat=True):
        m = get_maskkey_to_row(ttype)
        assert len(m) == len(get_fields(ttype)), ttype
