from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0019_backfill_submission_product_count"),
    ]

    operations = [
        migrations.AlterField(
            model_name="designorderstore",
            name="department",
            field=models.CharField(
                blank=True,
                db_comment="负责店铺的部门",
                default="",
                help_text="负责店铺的部门",
                max_length=100,
                verbose_name="所属部门",
            ),
        ),
    ]
