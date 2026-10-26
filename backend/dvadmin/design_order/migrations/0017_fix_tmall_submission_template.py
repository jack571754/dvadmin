from django.db import migrations
from django.db.models import Q


def fix_tmall_submission_template(apps, schema_editor):
    ProductSpecSubmission = apps.get_model(
        "design_order",
        "ProductSpecSubmission",
    )
    invalid_template = (
        Q(template_type="main_image")
        | Q(template_type="")
        | Q(template_type__isnull=True)
    )
    ProductSpecSubmission.objects.filter(
        invalid_template,
        platform="天猫",
    ).update(template_type="tmall_main_image")


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0016_seed_tmall_main_image_template"),
    ]

    operations = [
        migrations.RunPython(
            fix_tmall_submission_template,
            migrations.RunPython.noop,
        ),
    ]
