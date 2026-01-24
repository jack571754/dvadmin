# -*- coding: utf-8 -*-
"""
商品管理模块 - 序列化器
"""

from rest_framework import serializers
from dvadmin.utils.serializers import CustomModelSerializer
from .models import (
    Product, ProductCategory, ProductSku,
    ProductImage, ProductTag, Supplier
)


class ProductCategorySerializer(CustomModelSerializer):
    """
    商品分类序列化器
    """
    parent_name = serializers.SerializerMethodField(read_only=True)
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductCategory
        fields = "__all__"

    def get_parent_name(self, obj):
        """获取父级分类名称"""
        return obj.parent.name if obj.parent else None

    def get_children(self, obj):
        """获取子分类（用于树形结构）"""
        children = ProductCategory.objects.filter(parent=obj)
        return ProductCategorySerializer(children, many=True).data


class ProductCategoryTreeSerializer(CustomModelSerializer):
    """
    商品分类树形序列化器
    用于前端树形组件
    """
    label = serializers.CharField(source="name", read_only=True)
    value = serializers.IntegerField(source="id", read_only=True)
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductCategory
        fields = ["label", "value", "children"]

    def get_children(self, obj):
        """获取子分类"""
        children = ProductCategory.objects.filter(parent=obj, status=True)
        if children.exists():
            return ProductCategoryTreeSerializer(children, many=True).data
        return []


class ProductImageSerializer(CustomModelSerializer):
    """
    商品图片序列化器
    """
    class Meta:
        model = ProductImage
        fields = "__all__"


class ProductSkuSerializer(CustomModelSerializer):
    """
    商品SKU序列化器
    """
    class Meta:
        model = ProductSku
        fields = "__all__"


class ProductSerializer(CustomModelSerializer):
    """
    商品序列化器（基础）
    """
    category_name = serializers.SerializerMethodField(read_only=True)
    status_text = serializers.CharField(source="get_status_display", read_only=True)
    creator_name = serializers.CharField(source="creator.name", read_only=True)
    sku_list = ProductSkuSerializer(source="skus", many=True, read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def get_category_name(self, obj):
        """获取分类名称"""
        return obj.category.name if obj.category else None


class ProductListSerializer(CustomModelSerializer):
    """
    商品列表序列化器
    用于列表展示，减少字段
    """
    category_name = serializers.CharField(source="category.name", read_only=True)
    status_text = serializers.CharField(source="get_status_display", read_only=True)
    creator_name = serializers.CharField(source="creator.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "code", "category", "category_name",
            "price", "stock", "sales", "status", "status_text",
            "image", "is_hot", "is_new", "is_recommend",
            "creator_name", "create_datetime"
        ]


class ProductCreateSerializer(CustomModelSerializer):
    """
    商品创建序列化器
    """
    class Meta:
        model = Product
        fields = [
            "name", "code", "category", "price", "cost_price",
            "stock", "status", "image", "images", "description",
            "detail", "spec", "unit", "weight",
            "is_hot", "is_new", "is_recommend"
        ]

    def validate_price(self, value):
        """验证价格"""
        if value <= 0:
            raise serializers.ValidationError("销售价格必须大于0")
        return value

    def validate_code(self, value):
        """验证编码唯一性"""
        if Product.objects.filter(code=value).exists():
            raise serializers.ValidationError("商品编码已存在")
        return value

    def validate(self, attrs):
        """对象级验证"""
        if attrs.get('stock', 0) < 0:
            raise serializers.ValidationError({"stock": "库存不能为负数"})
        return attrs


class ProductUpdateSerializer(CustomModelSerializer):
    """
    商品更新序列化器
    """
    class Meta:
        model = Product
        fields = [
            "name", "category", "price", "cost_price",
            "stock", "status", "image", "images", "description",
            "detail", "spec", "unit", "weight",
            "is_hot", "is_new", "is_recommend"
        ]

    def validate_price(self, value):
        """验证价格"""
        if value <= 0:
            raise serializers.ValidationError("销售价格必须大于0")
        return value


class ProductImportSerializer(CustomModelSerializer):
    """
    商品导入序列化器
    用于Excel批量导入
    """
    class Meta:
        model = Product
        fields = ["name", "code", "category", "price", "stock", "status"]


class ProductExportSerializer(CustomModelSerializer):
    """
    商品导出序列化器
    用于Excel批量导出
    """
    category_name = serializers.CharField(source="category.name", read_only=True)
    status_text = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Product
        fields = [
            "name", "code", "category_name", "price", "cost_price",
            "stock", "sales", "status_text", "create_datetime"
        ]


class ProductTagSerializer(CustomModelSerializer):
    """
    商品标签序列化器
    """
    class Meta:
        model = ProductTag
        fields = "__all__"


class SupplierSerializer(CustomModelSerializer):
    """
    供应商序列化器
    """
    status_text = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Supplier
        fields = "__all__"
