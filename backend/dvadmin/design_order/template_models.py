from django.db import models

from dvadmin.utils.models import CoreModel


class ProductSpecTemplate(CoreModel):
    """按平台维护的规格提报模板。"""

    template_code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="模板编码",
        help_text="规格提报引用的稳定编码，创建后不可修改",
        db_comment="规格提报模板稳定编码",
    )
    template_name = models.CharField(
        max_length=100,
        verbose_name="模板名称",
        db_comment="规格提报模板显示名称",
    )
    platform = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name="适用平台",
        db_comment="关联常规配置的平台字典值",
    )
    icon = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="图标",
        help_text="Element Plus 图标名称",
        db_comment="模板图标名称",
    )
    remark = models.TextField(
        blank=True,
        default="",
        verbose_name="标注",
        db_comment="模板用途说明",
    )
    rows_per_block = models.PositiveSmallIntegerField(
        default=15,
        verbose_name="每产品块行数",
        db_comment="单个产品在规格表中占用的行数",
    )
    columns_per_block = models.PositiveSmallIntegerField(
        default=6,
        verbose_name="每产品块列数",
        db_comment="单个产品规格块的列数",
    )
    fields = models.JSONField(
        default=list,
        verbose_name="字段配置",
        db_comment="规格提报字段、行号、样式与控件类型配置",
    )
    validation = models.JSONField(
        default=dict,
        verbose_name="校验配置",
        db_comment="提报级和产品级校验规则配置",
    )
    status = models.BooleanField(
        default=True,
        verbose_name="启用状态",
        db_comment="启用后可在新增提报时被选择",
    )
    sort = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="排序",
        db_comment="同平台模板展示排序",
    )

    class Meta:
        db_table = "dvadmin_design_order_product_spec_template"
        db_table_comment = "设计工单规格提报模板配置表"
        verbose_name = "规格提报模板"
        verbose_name_plural = verbose_name
        ordering = ["platform", "sort", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["platform", "template_name"],
                name="uniq_product_spec_template_platform_name",
            ),
        ]

    def __str__(self):
        return f"{self.platform} - {self.template_name}"
