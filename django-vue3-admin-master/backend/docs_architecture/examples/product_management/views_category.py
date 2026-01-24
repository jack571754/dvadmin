# -*- coding: utf-8 -*-
"""
商品管理模块 - 分类视图
"""

from rest_framework.decorators import action
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse

from ..models import ProductCategory
from ..serializers import (
    ProductCategorySerializer,
    ProductCategoryTreeSerializer,
)


class ProductCategoryViewSet(CustomModelViewSet):
    """
    商品分类视图集

    list: 查询分类列表
    create: 创建分类
    retrieve: 获取分类详情
    update: 更新分类
    destroy: 删除分类
    tree: 获取分类树
    """

    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer

    # 过滤配置
    filter_fields = ['name', 'code', 'status', 'parent']

    @action(methods=['get'], detail=False)
    def tree(self, request):
        """
        获取分类树

        返回树形结构数据，用于前端树形组件
        """
        # 获取顶级分类
        top_categories = ProductCategory.objects.filter(
            parent=None,
            status=True
        ).order_by('sort', 'id')

        # 序列化为树形结构
        serializer = ProductCategoryTreeSerializer(top_categories, many=True)

        return DetailResponse(data=serializer.data)

    def perform_destroy(self, instance):
        """
        删除分类前检查是否有子分类或关联商品
        """
        # 检查是否有子分类
        if ProductCategory.objects.filter(parent=instance).exists():
            from dvadmin.utils.json_response import ErrorResponse
            raise ErrorResponse(msg="该分类下有子分类，无法删除")

        # 检查是否有关联商品
        if instance.product_set.exists():
            from dvadmin.utils.json_response import ErrorResponse
            raise ErrorResponse(msg="该分类下有商品，无法删除")

        instance.delete()
