from django.db import migrations, models


def efficacy_scope_field():
    return models.TextField(
        blank=True,
        db_comment="妆品功效或械品适应症、适用范围",
        default="",
        help_text="妆品功效或械品适应症、适用范围",
        verbose_name="妆品功效/ 械品适应症、适用范围",
    )


def ensure_efficacy_scope_column(apps, schema_editor):
    product_archive = apps.get_model("design_order", "ProductArchive")
    table_name = product_archive._meta.db_table
    with schema_editor.connection.cursor() as cursor:
        columns = schema_editor.connection.introspection.get_table_description(
            cursor,
            table_name,
        )
    if any(column.name == "efficacy_scope" for column in columns):
        return
    field = efficacy_scope_field()
    field.set_attributes_from_name("efficacy_scope")
    field.model = product_archive
    schema_editor.add_field(product_archive, field)


class Migration(migrations.Migration):

    dependencies = [
        ("design_order", "0024_productarchive_regulatory_category"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    ensure_efficacy_scope_column,
                    migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="productarchive",
                    name="efficacy_scope",
                    field=efficacy_scope_field(),
                ),
            ],
        ),
        migrations.AlterField(
            model_name="productspec",
            name="efficacy",
            field=models.TextField(
                blank=True,
                db_comment="产品主打功效",
                default="",
                verbose_name="主打功效",
            ),
        ),
        migrations.AlterField(
            model_name="productspec",
            name="nickname",
            field=models.TextField(
                blank=True,
                db_comment="提报中展示的产品昵称",
                default="",
                verbose_name="产品昵称",
            ),
        ),
        migrations.AlterField(
            model_name="icondefinition",
            name="interpretation",
            field=models.TextField(
                blank=True,
                default="",
                verbose_name="Icon 释义",
            ),
        ),
        migrations.AlterField(
            model_name="icondefinition",
            name="icon_category",
            field=models.CharField(
                blank=True,
                default="",
                max_length=100,
                verbose_name="Icon 分类",
            ),
        ),
        migrations.AlterField(
            model_name="icondefinition",
            name="short_name",
            field=models.CharField(
                db_index=True,
                max_length=64,
                verbose_name="Icon 简称",
            ),
        ),
        migrations.AddConstraint(
            model_name="icondefinition",
            constraint=models.UniqueConstraint(
                fields=("brand", "short_name"),
                name="uniq_icon_brand_short_name",
            ),
        ),
    ]
