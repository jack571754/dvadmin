from django.db import migrations


def disable_legacy_jd_templates(apps, schema_editor):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    ProductSpecTemplate.objects.filter(
        platform="京东",
        template_code__in=["live_stream", "detail_page"],
    ).update(status=False)


class Migration(migrations.Migration):

    dependencies = [
        ("design_order", "0007_productspectemplate"),
    ]

    operations = [
        migrations.RunPython(
            disable_legacy_jd_templates,
            migrations.RunPython.noop,
        ),
    ]
