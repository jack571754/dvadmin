from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("design_order", "0020_make_store_department_optional"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserPlatformPermission",
            fields=[
                ("id", models.BigAutoField(help_text="Id", primary_key=True, serialize=False, verbose_name="Id")),
                ("description", models.CharField(blank=True, help_text="描述", max_length=255, null=True, verbose_name="描述")),
                ("modifier", models.CharField(blank=True, help_text="修改人", max_length=255, null=True, verbose_name="修改人")),
                ("dept_belong_id", models.CharField(blank=True, help_text="数据归属部门", max_length=255, null=True, verbose_name="数据归属部门")),
                ("update_datetime", models.DateTimeField(auto_now=True, help_text="修改时间", null=True, verbose_name="修改时间")),
                ("create_datetime", models.DateTimeField(auto_now_add=True, help_text="创建时间", null=True, verbose_name="创建时间")),
                ("platform", models.CharField(max_length=100, verbose_name="平台")),
                ("scope", models.CharField(choices=[("self", "仅本人"), ("platform_all", "平台全部已提交")], default="self", max_length=20, verbose_name="数据范围")),
                ("creator", models.ForeignKey(db_constraint=False, help_text="创建人", null=True, on_delete=django.db.models.deletion.SET_NULL, related_query_name="creator_query", to=settings.AUTH_USER_MODEL, verbose_name="创建人")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="design_order_platform_permissions", to=settings.AUTH_USER_MODEL, verbose_name="用户")),
            ],
            options={
                "verbose_name": "设计工单用户平台权限",
                "verbose_name_plural": "设计工单用户平台权限",
                "db_table": "dvadmin_design_order_user_platform_permission",
                "ordering": ["platform"],
            },
        ),
        migrations.AddConstraint(
            model_name="userplatformpermission",
            constraint=models.UniqueConstraint(fields=("user", "platform"), name="uniq_design_order_user_platform"),
        ),
    ]