"""
设计工单管理数据模型
"""
from django.db import models
from dvadmin.utils.models import CoreModel


class ProductArchive(CoreModel):
    """
    产品档案模型
    """
    PRODUCT_TYPE_CHOICES = [
        ('authentic', '正品'),
        ('sample', '小样'),
    ]
    PRODUCT_STATUS_CHOICES = [
        ('on_sale', '在售'),
        ('off_sale', '停售'),
        ('pending', '待上市'),
    ]
    SALE_STATUS_CHOICES = [
        ('on_sale', '在售'),
        ('new', '新品'),
    ]

    product_code = models.CharField(
        max_length=64, unique=True, db_index=True,
        verbose_name="货品编号", help_text="货品唯一编号"
    )
    product_name = models.CharField(
        max_length=200,
        verbose_name="货品名称", help_text="货品官方全称"
    )
    specification = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="型号规格/净含量", help_text="包装规格，如 150ml、5片/盒"
    )
    unit = models.CharField(
        max_length=20, blank=True, default='',
        verbose_name="基本单位", help_text="如 瓶、盒、支、片"
    )
    short_name = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="货品简称", help_text="货品简称/昵称"
    )
    brand = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="品牌", help_text="品牌名称"
    )
    product_category = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="产品类目", help_text="产品所属类目"
    )
    product_classification = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="产品分类", help_text="产品分类"
    )
    retail_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="零售价", help_text="建议零售价（元）"
    )
    nickname = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="昵称", help_text="产品市场昵称"
    )
    gifts = models.CharField(
        max_length=500, blank=True, default='',
        verbose_name="标配赠品配置", help_text="标配赠品配置内容"
    )
    series = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="系列", help_text="产品系列"
    )
    category = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="类目", help_text="产品类目细分"
    )
    product_type = models.CharField(
        max_length=20, choices=PRODUCT_TYPE_CHOICES, default='authentic',
        verbose_name="正品/小样", help_text="正品或小样"
    )
    product_status = models.CharField(
        max_length=20, choices=PRODUCT_STATUS_CHOICES, default='on_sale',
        verbose_name="商品状态", help_text="商品上下架状态"
    )
    box_spec = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="箱规", help_text="包装箱规格"
    )
    sale_status = models.CharField(
        max_length=20, choices=SALE_STATUS_CHOICES, default='on_sale',
        verbose_name="在售/新品", help_text="在售或新品标识"
    )
    auxiliary = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="辅助", help_text="辅助信息"
    )
    need_maintenance = models.BooleanField(
        default=False,
        verbose_name="是否需要维护", help_text="标记该产品档案是否需要维护更新"
    )

    class Meta:
        db_table = "dvadmin_design_order_product_archive"
        verbose_name = "产品档案"
        verbose_name_plural = verbose_name
        ordering = ["-create_datetime"]

    def __str__(self):
        return f"{self.product_code} - {self.product_name}"


class ProductSpecSubmission(CoreModel):
    """
    产品规格提报历史维度表（留存每次提交的历史快照及元数据）
    """
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('submitted', '已提交'),
    ]
    name = models.CharField(max_length=200, verbose_name="提报名称")
    shop = models.CharField(max_length=100, blank=True, default='', verbose_name="提报店铺")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="状态")
    product_count = models.IntegerField(default=0, verbose_name="产品数量")
    snapshot_data = models.JSONField(verbose_name="快照JSON数据", null=True, blank=True)

    class Meta:
        db_table = "dvadmin_design_order_product_spec_submission"
        verbose_name = "规格提报历史"
        verbose_name_plural = verbose_name
        ordering = ["-create_datetime"]

    def __str__(self):
        return f"{self.name} ({self.shop})"


class ProductSpec(CoreModel):
    """
    产品规格提报明细表
    """
    submission = models.ForeignKey(
        'ProductSpecSubmission', on_delete=models.CASCADE, null=True, blank=True,
        verbose_name="关联提报历史", related_name="specs"
    )
    card_index = models.IntegerField(verbose_name="卡片索引", help_text="商品列在网格中的索引")
    product = models.ForeignKey(
        'ProductArchive', on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="关联产品档案", related_name="specs"
    )
    nickname = models.CharField(max_length=100, blank=True, default='', verbose_name="产品昵称")
    brand = models.CharField(max_length=100, blank=True, default='', verbose_name="品牌")
    full_name = models.CharField(max_length=200, blank=True, default='', verbose_name="官方全称")
    specification = models.CharField(max_length=200, blank=True, default='', verbose_name="规格")
    efficacy = models.CharField(max_length=200, blank=True, default='', verbose_name="主打功效")
    gifts = models.CharField(max_length=500, blank=True, default='', verbose_name="标配赠品配置")
    threshold_a = models.CharField(max_length=200, blank=True, default='', verbose_name="满赠档位A")
    value_a = models.CharField(max_length=100, blank=True, default='', verbose_name="价值A")
    threshold_b = models.CharField(max_length=200, blank=True, default='', verbose_name="满赠档位B")
    value_b = models.CharField(max_length=100, blank=True, default='', verbose_name="价值B")
    member_gift = models.CharField(max_length=200, blank=True, default='', verbose_name="会员专享礼")
    member_value = models.CharField(max_length=100, blank=True, default='', verbose_name="会员专享礼价值")
    selling_point = models.CharField(max_length=200, blank=True, default='', verbose_name="商品卖点")
    price = models.CharField(max_length=100, blank=True, default='', verbose_name="提报价格")
    start_date = models.CharField(max_length=50, blank=True, default='', verbose_name="开始日期")
    end_date = models.CharField(max_length=50, blank=True, default='', verbose_name="结束日期")
    remarks = models.TextField(blank=True, default='', verbose_name="运营备注")

    class Meta:
        db_table = "dvadmin_design_order_product_spec"
        verbose_name = "产品规格明细"
        verbose_name_plural = verbose_name
        ordering = ["card_index"]


class ProductSpecSnapshot(CoreModel):
    """
    产品规格表表格快照（存储Univer的全部快照数据）
    """
    snapshot_data = models.JSONField(verbose_name="快照JSON数据", null=True, blank=True)
    form_count = models.IntegerField(default=1, verbose_name="商品列数")

    class Meta:
        db_table = "dvadmin_design_order_product_spec_snapshot"
        verbose_name = "产品规格快照"
        verbose_name_plural = verbose_name

