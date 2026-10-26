# Generated migration for Icon soft delete and composite index

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("design_order", "0022_icondefinition_iconproductrelation_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="icondefinition",
            name="status",
            field=models.CharField(
                choices=[
                    ("enabled", "启用"),
                    ("disabled", "停用"),
                    ("deleted", "已删除")
                ],
                default="enabled",
                max_length=16,
                verbose_name="状态",
            ),
        ),
        migrations.AddIndex(
            model_name="iconproductrelation",
            index=models.Index(
                fields=["icon", "product"],
                name="icon_relation_composite_idx",
            ),
        ),
    ]
