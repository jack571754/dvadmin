from django.db import migrations


def remove_non_main_image_templates(apps, schema_editor):
    ProductSpecTemplate = apps.get_model("design_order", "ProductSpecTemplate")
    ProductSpecTemplate.objects.exclude(template_code="main_image").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("design_order", "0008_one_active_template_per_platform"),
    ]

    operations = [
        migrations.RunPython(
            remove_non_main_image_templates,
            migrations.RunPython.noop,
        ),
    ]
