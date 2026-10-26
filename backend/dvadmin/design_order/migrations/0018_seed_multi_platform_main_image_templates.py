from copy import deepcopy

from django.db import migrations


JD_TEMPLATE_CODE = "main_image"
COLUMNS_PER_BLOCK = 6
ROW_PADDING = 2
FIRST_PLATFORM_SORT = 3
TEMPLATE_ICON = "Picture"
REQUIRED_SUBMISSION_FIELDS = ["name", "shop"]
DEFAULT_REQUIRED_PRODUCT_FIELDS = []
VIPSHOP_REQUIRED_PRODUCT_FIELDS = []

PLATFORM_TEMPLATES = (
    (
        "拼多多",
        "pdd_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "thresholdA", "sellingPoint", "icon", "remarks",
        ),
    ),
    (
        "抖音",
        "douyin_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "sellingPoint", "price", "icon", "remark", "remarks",
        ),
    ),
    (
        "唯品会",
        "vipshop_main_image",
        (
            "nickname", "fullName", "efficacy", "gifts",
            "sellingPoint", "icon", "remark", "remarks",
        ),
    ),
    (
        "小红书",
        "xiaohongshu_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "thresholdA", "sellingPoint", "price", "icon", "remark", "remarks",
        ),
    ),
    (
        "中免日上",
        "zhongmian_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "thresholdA", "sellingPoint", "remark", "remarks",
        ),
    ),
    (
        "视频号",
        "shipinhao_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "thresholdA", "sellingPoint", "price", "icon", "remark", "remarks",
        ),
    ),
    (
        "美团闪购",
        "meituan_flash_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "thresholdA", "sellingPoint", "remarks",
        ),
    ),
    (
        "招商银行",
        "cmb_main_image",
        (
            "brand", "nickname", "fullName", "efficacy", "gifts",
            "sellingPoint", "price", "remark", "remarks",
        ),
    ),
)


def build_field_map(jd_template):
    return {field["key"]: field for field in jd_template.fields}


def build_fields(field_map, field_keys):
    missing_keys = set(field_keys) - set(field_map)
    if missing_keys:
        missing = ", ".join(sorted(missing_keys))
        raise RuntimeError(f"京东主图模板缺少公共字段: {missing}")

    fields = []
    for row, key in enumerate(field_keys, start=1):
        field = deepcopy(field_map[key])
        field["row"] = row
        fields.append(field)
    return fields


def build_validation(platform, field_keys):
    required_product_fields = DEFAULT_REQUIRED_PRODUCT_FIELDS
    if platform == "唯品会":
        required_product_fields = VIPSHOP_REQUIRED_PRODUCT_FIELDS

    validation = {
        "requiredSubmissionFields": deepcopy(REQUIRED_SUBMISSION_FIELDS),
        "requiredProductFields": deepcopy(required_product_fields),
    }
    if "price" in field_keys:
        validation["priceFieldKey"] = "price"
    return validation


def ensure_no_other_active_template(model, platform, template_code):
    conflicting = model.objects.filter(
        platform=platform,
        status=True,
    ).exclude(template_code=template_code)
    if conflicting.exists():
        raise RuntimeError(f"平台“{platform}”已存在其他启用模板")


def build_defaults(platform, field_keys, field_map, sort):
    fields = build_fields(field_map, field_keys)
    return {
        "template_name": f"{platform}主图提报",
        "platform": platform,
        "icon": TEMPLATE_ICON,
        "remark": f"用于{platform}商品主图素材与活动机制提报。",
        "rows_per_block": len(fields) + ROW_PADDING,
        "columns_per_block": COLUMNS_PER_BLOCK,
        "fields": fields,
        "validation": build_validation(platform, field_keys),
        "status": True,
        "sort": sort,
    }


def seed_multi_platform_templates(apps, schema_editor):
    model = apps.get_model("design_order", "ProductSpecTemplate")
    jd_template = model.objects.get(template_code=JD_TEMPLATE_CODE)
    field_map = build_field_map(jd_template)

    for offset, config in enumerate(PLATFORM_TEMPLATES):
        platform, template_code, field_keys = config
        ensure_no_other_active_template(model, platform, template_code)
        defaults = build_defaults(
            platform,
            field_keys,
            field_map,
            FIRST_PLATFORM_SORT + offset,
        )
        model.objects.update_or_create(
            template_code=template_code,
            defaults=defaults,
        )


def remove_multi_platform_templates(apps, schema_editor):
    model = apps.get_model("design_order", "ProductSpecTemplate")
    template_codes = [config[1] for config in PLATFORM_TEMPLATES]
    model.objects.filter(template_code__in=template_codes).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0017_fix_tmall_submission_template"),
    ]

    operations = [
        migrations.RunPython(
            seed_multi_platform_templates,
            remove_multi_platform_templates,
        ),
    ]
