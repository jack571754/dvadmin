# -*- coding: utf-8 -*-
"""
商品管理模块 - 数据模型
"""

from django.db import models
from dvadmin.utils.models import CoreModel, table_prefix


class ProductCategory(CoreModel):
    """
    商品分类模型
    支持多级分类
    """
    name = models.CharField(
        max_length=64,
        verbose_name="分类名称",
        help_text="分类名称"
    )
    code = models.CharField(
        max_length=32,
        unique=True,
        verbose_name="分类编码",
        help_text="分类编码，唯一标识"
    )
    sort = models.IntegerField(
        default=1,
        verbose_name="排序",
        help_text="数字越小越靠前"
    )
    status = models.BooleanField(
        default=True,
        verbose_name="状态",
        help_text="是否启用"
    )
    parent = models.ForeignKey(
        to="self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_constraint=False,
        verbose_name="父级分类",
        help_text="父级分类，为空表示顶级分类"
    )
    icon = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        verbose_name="图标",
        help_text="分类图标"
    )

    class Meta:
        db_table = table_prefix + "product_category"
        verbose_name = "商品分类"
        verbose_name_plural = verbose_name
        ordering = ("sort", "id")

    def __str__(self):
        return self.name


class Product(CoreModel):
    """
    商品主表
    """
    STATUS_CHOICES = (
        (0, "下架"),
        (1, "上架"),
        (2, "售罄"),
    )

    name = models.CharField(
        max_length=128,
        verbose_name="商品名称",
        help_text="商品名称"
    )
    code = models.CharField(
        max_length=64,
        unique=True,
        verbose_name="商品编码",
        help_text="商品编码，系统内唯一"
    )
    category = models.ForeignKey(
        to=ProductCategory,
        on_delete=models.PROTECT,
        db_constraint=False,
        verbose_name="商品分类",
        help_text="所属分类",
        null=True,
        blank=True
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="销售价格",
        help_text="商品销售价格"
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="成本价格",
        help_text="商品成本价格（仅管理员可见）"
    )
    stock = models.IntegerField(
        default=0,
        verbose_name="库存数量",
        help_text="当前库存数量"
    )
    sales = models.IntegerField(
        default=0,
        verbose_name="销量",
        help_text="累计销量"
    )
    status = models.IntegerField(
        choices=STATUS_CHOICES,
        default=1,
        verbose_name="商品状态",
        help_text="0:下架 1:上架 2:售罄"
    )
    image = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="主图",
        help_text="商品主图URL"
    )
    images = models.JSONField(
        null=True,
        blank=True,
        verbose_name="图片列表",
        help_text="商品图片URL列表"
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name="商品描述",
        help_text="商品详细描述"
    )
    detail = models.JSONField(
        null=True,
        blank=True,
        verbose_name="商品详情",
        help_text="商品详情富文本内容"
    )
    spec = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="规格",
        help_text="商品规格描述"
    )
    unit = models.CharField(
        max_length=32,
        default="件",
        verbose_name="单位",
        help_text="计量单位"
    )
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="重量",
        help_text="商品重量（千克）"
    )
    is_hot = models.BooleanField(
        default=False,
        verbose_name="是否热销",
        help_text="是否为热销商品"
    )
    is_new = models.BooleanField(
        default=False,
        verbose_name="是否新品",
        help_text="是否为新品"
    )
    is_recommend = models.BooleanField(
        default=False,
        verbose_name="是否推荐",
        help_text="是否为推荐商品"
    )

    class Meta:
        db_table = table_prefix + "product"
        verbose_name = "商品"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)

    def __str__(self):
        return self.name


class ProductSku(CoreModel):
    """
    商品 SKU（库存单位）
    支持多规格商品
    """
    product = models.ForeignKey(
        to=Product,
        on_delete=models.CASCADE,
        db_constraint=False,
        related_name="skus",
        verbose_name="关联商品",
        help_text="所属商品"
    )
    sku_code = models.CharField(
        max_length=64,
        unique=True,
        verbose_name="SKU编码",
        help_text="SKU唯一编码"
    )
    spec = models.CharField(
        max_length=255,
        verbose_name="规格描述",
        help_text="如：红色-L"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="SKU价格",
        help_text="该规格的价格"
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="SKU成本价",
        help_text="该规格的成本价"
    )
    stock = models.IntegerField(
        default=0,
        verbose_name="SKU库存",
        help_text="该规格的库存数量"
    )
    image = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="SKU图片",
        help_text="该规格的图片"
    )

    class Meta:
        db_table = table_prefix + "product_sku"
        verbose_name = "商品SKU"
        verbose_name_plural = verbose_name
        ordering = ("id",)

    def __str__(self):
        return f"{self.product.name} - {self.spec}"


class ProductImage(CoreModel):
    """
    商品图片表
    支持多图片排序
    """
    product = models.ForeignKey(
        to=Product,
        on_delete=models.CASCADE,
        db_constraint=False,
        related_name="product_images",
        verbose_name="关联商品",
        help_text="所属商品"
    )
    url = models.CharField(
        max_length=255,
        verbose_name="图片URL",
        help_text="图片地址"
    )
    sort = models.IntegerField(
        default=1,
        verbose_name="排序",
        help_text="数字越小越靠前"
    )
    alt = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="图片描述",
        help_text="图片alt描述"
    )

    class Meta:
        db_table = table_prefix + "product_image"
        verbose_name = "商品图片"
        verbose_name_plural = verbose_name
        ordering = ("sort", "id")

    def __str__(self):
        return f"{self.product.name} - 图片{self.sort}"


class ProductTag(CoreModel):
    """
    商品标签
    用于商品分类和筛选
    """
    name = models.CharField(
        max_length=64,
        unique=True,
        verbose_name="标签名称",
        help_text="标签名称"
    )
    color = models.CharField(
        max_length=32,
        null=True,
        blank=True,
        verbose_name="标签颜色",
        help_text="标签显示颜色"
    )
    sort = models.IntegerField(
        default=1,
        verbose_name="排序",
        help_text="数字越小越靠前"
    )

    class Meta:
        db_table = table_prefix + "product_tag"
        verbose_name = "商品标签"
        verbose_name_plural = verbose_name
        ordering = ("sort", "id")

    def __str__(self):
        return self.name


class Supplier(CoreModel):
    """
    供应商表
    """
    name = models.CharField(
        max_length=128,
        verbose_name="供应商名称",
        help_text="供应商名称"
    )
    code = models.CharField(
        max_length=64,
        unique=True,
        verbose_name="供应商编码",
        help_text="供应商编码"
    )
    contact = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        verbose_name="联系人",
        help_text="联系人姓名"
    )
    phone = models.CharField(
        max_length=32,
        null=True,
        blank=True,
        verbose_name="联系电话",
        help_text="联系电话"
    )
    address = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="地址",
        help_text="供应商地址"
    )
    status = models.BooleanField(
        default=True,
        verbose_name="状态",
        help_text="是否启用"
    )

    class Meta:
        db_table = table_prefix + "supplier"
        verbose_name = "供应商"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)

    def __str__(self):
        return self.name
