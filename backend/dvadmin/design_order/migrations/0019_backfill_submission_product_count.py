from django.db import migrations


def backfill_product_count(apps, schema_editor):
    submission_model = apps.get_model("design_order", "ProductSpecSubmission")
    product_spec_model = apps.get_model("design_order", "ProductSpec")

    for submission in submission_model.objects.filter(product_count__lte=0).iterator():
        spec_count = product_spec_model.objects.filter(
            submission_id=submission.id
        ).count()
        submission.product_count = max(spec_count, 1)
        submission.save(update_fields=["product_count"])


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0018_seed_multi_platform_main_image_templates"),
    ]

    operations = [
        migrations.RunPython(backfill_product_count, migrations.RunPython.noop),
    ]
