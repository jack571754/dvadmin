from django.db import models

from dvadmin.utils.models import CoreModel


class DesignOrderStore(CoreModel):
    store_code = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        verbose_name="店铺编码",
        help_text="店铺唯一编码",
        db_comment="店铺唯一编码",
    )
    store_name = models.CharField(
        max_length=200,
        verbose_name="店铺名称",
        help_text="店铺完整名称",
        db_comment="店铺完整名称",
    )
    store_type = models.CharField(
        max_length=50,
        verbose_name="店铺类型",
        help_text="店铺业务类型",
        db_comment="店铺业务类型",
    )
    brand = models.CharField(
        max_length=100,
        verbose_name="品牌",
        help_text="店铺所属品牌",
        db_comment="店铺所属品牌",
    )
    platform = models.CharField(
        max_length=100,
        verbose_name="平台",
        help_text="店铺所属平台",
        db_comment="店铺所属平台",
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="所属部门",
        help_text="负责店铺的部门",
        db_comment="负责店铺的部门",
    )
    owner_name = models.CharField(
        max_length=100,
        verbose_name="店铺负责人",
        help_text="店铺负责人姓名",
        db_comment="店铺负责人姓名",
    )
    status = models.BooleanField(
        default=True,
        verbose_name="状态",
        help_text="店铺是否启用",
        db_comment="店铺状态：1=启用，0=禁用",
    )

    class Meta:
        db_table = "dvadmin_design_order_store"
        db_table_comment = "设计工单店铺档案表"
        verbose_name = "店铺档案"
        verbose_name_plural = verbose_name
        ordering = ["store_code"]

    def __str__(self):
        return f"{self.store_code} - {self.store_name}"
