from copy import deepcopy

from django.db import migrations


JD_TEMPLATE_CODE = "main_image"
TMALL_TEMPLATE_CODE = "tmall_main_image"
TMALL_PLATFORM = "天猫"
TMALL_REMARK = "用于天猫商品主图素材与活动机制提报。"


def seed_tmall_main_image_template(apps, schema_editor):
    ProductSpecTemplate = apps.get_model(
        "design_order",
        "ProductSpecTemplate",
    )
    jd_template = ProductSpecTemplate.objects.get(
        template_code=JD_TEMPLATE_CODE,
        platform="京东",
    )
    ProductSpecTemplate.objects.update_or_create(
        template_code=TMALL_TEMPLATE_CODE,
        defaults={
            "template_name": jd_template.template_name,
            "platform": TMALL_PLATFORM,
            "icon": jd_template.icon,
            "remark": TMALL_REMARK,
            "rows_per_block": jd_template.rows_per_block,
            "columns_per_block": jd_template.columns_per_block,
            "fields": deepcopy(jd_template.fields),
            "validation": deepcopy(jd_template.validation),
            "status": True,
            "sort": jd_template.sort,
        },
    )


def remove_tmall_main_image_template(apps, schema_editor):
    ProductSpecTemplate = apps.get_model(
        "design_order",
        "ProductSpecTemplate",
    )
    ProductSpecTemplate.objects.filter(
        template_code=TMALL_TEMPLATE_CODE,
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0015_make_icon_field_longtext"),
    ]

    operations = [
        migrations.RunPython(
            seed_tmall_main_image_template,
            remove_tmall_main_image_template,
        ),
    ]
