from django.db import migrations


DEFAULT_ICON = "Picture"
DEFAULT_REMARK = "用于京东商品主图素材与活动机制提报。"


def fill_main_image_metadata(apps, schema_editor):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    templates = ProductSpecTemplate.objects.filter(
        platform="京东",
        template_code="main_image",
    )
    templates.filter(icon="").update(icon=DEFAULT_ICON)
    templates.filter(remark="").update(remark=DEFAULT_REMARK)


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0010_alter_productspecsubmission_template_type"),
    ]

    operations = [
        migrations.RunPython(
            fill_main_image_metadata,
            migrations.RunPython.noop,
        ),
    ]
