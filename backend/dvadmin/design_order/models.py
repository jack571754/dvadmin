"""
设计工单管理数据模型
"""
from django.conf import settings
from django.db import models
from dvadmin.utils.models import CoreModel


class ProductArchive(CoreModel):
    """
    产品档案模型
    """
    CATEGORY_MEDICAL_DEVICE = 'medical_device'
    CATEGORY_COSMETIC = 'cosmetic'
    REGULATORY_CATEGORY_CHOICES = [
        (CATEGORY_MEDICAL_DEVICE, '械品'),
        (CATEGORY_COSMETIC, '妆品'),
    ]
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
        verbose_name="货品编号", help_text="货品唯一编号",
        db_comment="货品唯一编号"
    )
    product_name = models.CharField(
        max_length=200,
        verbose_name="货品名称", help_text="货品官方全称",
        db_comment="货品官方全称"
    )
    specification = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="型号规格/净含量", help_text="包装规格，如 150ml、5片/盒",
        db_comment="包装规格，如 150ml、5片/盒"
    )
    unit = models.CharField(
        max_length=20, blank=True, default='',
        verbose_name="基本单位", help_text="如 瓶、盒、支、片",
        db_comment="基本计量单位，如瓶、盒、支、片"
    )
    short_name = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="货品简称", help_text="货品简称/昵称",
        db_comment="货品简称或昵称"
    )
    brand = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="品牌", help_text="品牌名称",
        db_comment="品牌名称"
    )
    regulatory_category = models.CharField(
        max_length=20, choices=REGULATORY_CATEGORY_CHOICES,
        blank=True, default='',
        verbose_name="类别", help_text="产品监管类别：械品或妆品",
        db_comment="产品监管类别：medical_device=械品，cosmetic=妆品"
    )
    product_category = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="产品类目", help_text="产品所属类目",
        db_comment="产品所属类目"
    )
    product_classification = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="产品分类", help_text="产品分类",
        db_comment="产品分类"
    )
    retail_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="零售价", help_text="建议零售价（元）",
        db_comment="建议零售价（元）"
    )
    nickname = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="昵称", help_text="产品市场昵称",
        db_comment="产品市场昵称"
    )
    series = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="系列", help_text="产品系列",
        db_comment="产品系列"
    )
    category = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="类目", help_text="产品类目细分",
        db_comment="产品类目细分"
    )
    product_type = models.CharField(
        max_length=20, choices=PRODUCT_TYPE_CHOICES, default='authentic',
        verbose_name="正品/小样", help_text="正品或小样",
        db_comment="产品类型：authentic=正品，sample=小样"
    )
    product_status = models.CharField(
        max_length=20, choices=PRODUCT_STATUS_CHOICES, default='on_sale',
        verbose_name="商品状态", help_text="商品上下架状态",
        db_comment="商品状态：on_sale=在售，off_sale=停售，pending=待上市"
    )
    box_spec = models.CharField(
        max_length=100, blank=True, default='',
        verbose_name="箱规", help_text="包装箱规格",
        db_comment="包装箱规格"
    )
    sale_status = models.CharField(
        max_length=20, choices=SALE_STATUS_CHOICES, default='on_sale',
        verbose_name="在售/新品", help_text="在售或新品标识",
        db_comment="销售标识：on_sale=在售，new=新品"
    )
    auxiliary = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="辅助", help_text="辅助信息",
        db_comment="辅助信息"
    )
    need_maintenance = models.BooleanField(
        default=False,
        verbose_name="是否需要维护", help_text="标记该产品档案是否需要维护更新",
        db_comment="是否需要维护更新"
    )
    keywords = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="关键词", help_text="英文逗号分隔的关键词列表",
        db_comment="英文逗号分隔的关键词列表"
    )
    efficacy_scope = models.TextField(
        blank=True, default='',
        verbose_name="妆品功效/ 械品适应症、适用范围",
        help_text="妆品功效或械品适应症、适用范围",
        db_comment="妆品功效或械品适应症、适用范围"
    )

    class Meta:
        db_table = "dvadmin_design_order_product_archive"
        db_table_comment = "设计工单产品档案表，维护可用于规格提报的产品基础资料"
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
    name = models.CharField(
        max_length=200, verbose_name="提报名称",
        db_comment="规格提报名称"
    )
    shop = models.CharField(
        max_length=100, blank=True, default='', verbose_name="提报店铺",
        db_comment="本次规格提报所属店铺"
    )
    platform = models.CharField(
        max_length=100, default='京东', verbose_name="平台",
        db_comment="本次规格提报所属平台"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="状态",
        db_comment="提报状态：draft=草稿，submitted=已提交"
    )
    product_count = models.IntegerField(
        default=0, blank=True, null=True, verbose_name="产品数量",
        db_comment="本次提报包含的产品数量"
    )
    snapshot_data = models.JSONField(
        verbose_name="快照JSON数据", null=True, blank=True,
        db_comment="Univer 规格书完整快照 JSON，用于恢复表格内容、样式和结构"
    )
    template_type = models.CharField(
        max_length=50, default='main_image', blank=True, null=True, verbose_name="模板类型",
        db_comment="规格书模板类型，如 main_image"
    )

    class Meta:
        db_table = "dvadmin_design_order_product_spec_submission"
        db_table_comment = "设计工单产品规格提报历史表，保存每次提报的状态、模板和 Univer 快照"
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
        verbose_name="关联提报历史", related_name="specs",
        db_comment="关联的规格提报历史记录 ID"
    )
    card_index = models.IntegerField(
        verbose_name="卡片索引", help_text="商品列在网格中的索引",
        db_comment="商品列在 Univer 网格中的索引"
    )
    product = models.ForeignKey(
        'ProductArchive', on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name="关联产品档案", related_name="specs",
        db_comment="关联的产品档案 ID"
    )
    nickname = models.TextField(
        blank=True, default='', verbose_name="产品昵称",
        db_comment="提报中展示的产品昵称"
    )
    brand = models.CharField(
        max_length=100, blank=True, default='', verbose_name="品牌",
        db_comment="产品品牌"
    )
    full_name = models.TextField(
        blank=True, default='', verbose_name="官方全称",
        db_comment="产品官方全称"
    )
    specification = models.TextField(
        blank=True, default='', verbose_name="规格",
        db_comment="产品规格或净含量"
    )
    efficacy = models.TextField(
        blank=True, default='', verbose_name="主打功效",
        db_comment="产品主打功效"
    )
    gifts = models.TextField(
        blank=True, default='', verbose_name="标配赠品配置",
        db_comment="标配赠品配置"
    )
    threshold_a = models.TextField(
        blank=True, default='', verbose_name="满赠档位A",
        db_comment="满赠档位 A"
    )
    value_a = models.TextField(
        blank=True, default='', verbose_name="价值A",
        db_comment="满赠档位 A 对应价值"
    )
    threshold_b = models.TextField(
        blank=True, default='', verbose_name="满赠档位B",
        db_comment="满赠档位 B"
    )
    value_b = models.TextField(
        blank=True, default='', verbose_name="价值B",
        db_comment="满赠档位 B 对应价值"
    )
    member_gift = models.TextField(
        blank=True, default='', verbose_name="会员专享礼",
        db_comment="会员专享礼配置"
    )
    member_value = models.TextField(
        blank=True, default='', verbose_name="会员专享礼价值",
        db_comment="会员专享礼价值"
    )
    selling_point = models.TextField(
        blank=True, default='', verbose_name="商品卖点",
        db_comment="商品卖点"
    )
    price = models.CharField(
        max_length=100, blank=True, default='', verbose_name="提报价格",
        db_comment="本次提报价格"
    )
    start_date = models.CharField(
        max_length=50, blank=True, default='', verbose_name="开始日期",
        db_comment="活动开始日期"
    )
    end_date = models.CharField(
        max_length=50, blank=True, default='', verbose_name="结束日期",
        db_comment="活动结束日期"
    )
    remarks = models.TextField(
        blank=True, default='', verbose_name="运营备注",
        db_comment="运营备注"
    )
    spec_data = models.JSONField(
        default=dict, blank=True,
        verbose_name="动态字段数据",
        help_text="按模板 Schema 字段键存储的动态字段值，与 template_type 配合使用",
        db_comment="按模板 Schema 字段键存储的动态字段值，与 template_type 配合使用"
    )

    class Meta:
        db_table = "dvadmin_design_order_product_spec"
        db_table_comment = "设计工单产品规格明细表，保存每个提报中每个产品列的结构化字段"
        verbose_name = "产品规格明细"
        verbose_name_plural = verbose_name
        ordering = ["card_index"]


from .share_models import ProductSpecShare  # noqa: E402,F401
from .store_models import DesignOrderStore  # noqa: E402,F401
from .template_models import ProductSpecTemplate  # noqa: E402,F401




class UserPlatformPermission(CoreModel):
    """用户在单个平台上的设计工单数据范围授权。"""

    SCOPE_SELF = "self"
    SCOPE_PLATFORM_ALL = "platform_all"
    SCOPE_CHOICES = (
        (SCOPE_SELF, "仅本人"),
        (SCOPE_PLATFORM_ALL, "平台全部已提交"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="design_order_platform_permissions",
        verbose_name="用户",
    )
    platform = models.CharField(max_length=100, verbose_name="平台")
    scope = models.CharField(
        max_length=20,
        choices=SCOPE_CHOICES,
        default=SCOPE_SELF,
        verbose_name="数据范围",
    )

    class Meta:
        db_table = "dvadmin_design_order_user_platform_permission"
        verbose_name = "设计工单用户平台权限"
        verbose_name_plural = verbose_name
        constraints = [
            models.UniqueConstraint(fields=["user", "platform"], name="uniq_design_order_user_platform"),
        ]
        ordering = ["platform"]

from .icon_models import IconDefinition, IconProductRelation  # noqa: E402,F401
