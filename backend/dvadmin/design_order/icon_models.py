from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models

from dvadmin.utils.models import CoreModel


class IconDefinition(CoreModel):
    """Icon 库中的一条 Icon 定义。"""

    SCOPE_ALL = "all"
    SCOPE_SELECTED = "selected"
    STATUS_ENABLED = "enabled"
    STATUS_DISABLED = "disabled"
    STATUS_DELETED = "deleted"
    SCOPE_CHOICES = ((SCOPE_ALL, "品牌全部商品"), (SCOPE_SELECTED, "指定商品"))
    STATUS_CHOICES = (
        (STATUS_ENABLED, "启用"),
        (STATUS_DISABLED, "停用"),
        (STATUS_DELETED, "已删除")
    )

    short_name = models.CharField(
        max_length=64,
        db_index=True,
        verbose_name="Icon 简称",
    )
    interpretation = models.TextField(blank=True, default="", verbose_name="Icon 释义")
    remark = models.TextField(blank=True, default="", verbose_name="备注")
    brand = models.CharField(max_length=100, verbose_name="品牌")
    icon_category = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Icon 分类",
    )
    scope_type = models.CharField(max_length=16, choices=SCOPE_CHOICES, default=SCOPE_SELECTED, verbose_name="商品范围")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ENABLED, verbose_name="状态")
    images = models.JSONField(default=list, verbose_name="图片引用")

    class Meta:
        db_table = "dvadmin_design_order_icon_definition"
        db_table_comment = "设计工单 Icon 库定义表"
        verbose_name = "Icon 定义"
        verbose_name_plural = verbose_name
        ordering = ["id"]
        indexes = [
            models.Index(fields=["brand", "status"], name="icon_brand_status_idx"),
            models.Index(fields=["icon_category"], name="icon_category_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["brand", "short_name"],
                name="uniq_icon_brand_short_name",
            ),
        ]

    def __str__(self):
        return self.short_name

    def soft_delete(self):
        """软删除：标记为已删除状态，保留历史数据"""
        self.status = self.STATUS_DELETED
        self.save(update_fields=["status", "update_datetime"])


class IconProductRelation(CoreModel):
    """Icon 与商品档案的关联表。"""

    icon = models.ForeignKey(
        IconDefinition,
        on_delete=models.CASCADE,
        related_name="product_relations",
        verbose_name="Icon",
    )
    product = models.ForeignKey(
        "ProductArchive",
        on_delete=models.PROTECT,
        related_name="icon_relations",
        verbose_name="商品",
    )

    class Meta:
        db_table = "dvadmin_design_order_icon_product_relation"
        db_table_comment = "设计工单 Icon 与商品关联表"
        verbose_name = "Icon 商品关联"
        verbose_name_plural = verbose_name
        constraints = [
            models.UniqueConstraint(fields=["icon", "product"], name="uniq_icon_product_relation"),
        ]
        indexes = [
            models.Index(fields=["product"], name="icon_relation_product_idx"),
            models.Index(fields=["icon", "product"], name="icon_relation_composite_idx"),
        ]
