from django.db import migrations, models
from django.db.models import Q


MEDICAL_DEVICE_MARKERS = ("医疗器械", "械字号")
COSMETIC_MARKERS = ("化妆品", "妆字号")


def build_marker_query(markers):
    query = Q()
    for marker in markers:
        query |= Q(product_classification__icontains=marker)
    return query


def backfill_regulatory_category(apps, schema_editor):
    product_archive = apps.get_model("design_order", "ProductArchive")
    product_archive.objects.filter(
        build_marker_query(MEDICAL_DEVICE_MARKERS),
        regulatory_category="",
    ).update(regulatory_category="medical_device")
    product_archive.objects.filter(
        build_marker_query(COSMETIC_MARKERS),
        regulatory_category="",
    ).update(regulatory_category="cosmetic")


class Migration(migrations.Migration):

    dependencies = [
        ("design_order", "0023_icon_soft_delete_and_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="productarchive",
            name="regulatory_category",
            field=models.CharField(
                blank=True,
                choices=[
                    ("medical_device", "械品"),
                    ("cosmetic", "妆品"),
                ],
                db_comment="产品监管类别：medical_device=械品，cosmetic=妆品",
                default="",
                help_text="产品监管类别：械品或妆品",
                max_length=20,
                verbose_name="类别",
            ),
        ),
        migrations.RunPython(
            backfill_regulatory_category,
            migrations.RunPython.noop,
        ),
    ]
