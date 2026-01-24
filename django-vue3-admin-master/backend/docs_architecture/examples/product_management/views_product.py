# -*- coding: utf-8 -*-
"""
商品管理模块 - 商品视图
"""

from rest_framework.decorators import action
from django.db.models import Q, Sum
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse

from ..models import Product, ProductCategory, ProductSku
from ..serializers import (
    ProductSerializer,
    ProductListSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    ProductImportSerializer,
    ProductExportSerializer,
)


class ProductViewSet(CustomModelViewSet):
    """
    商品管理视图集

    list: 查询商品列表
    create: 创建商品
    retrieve: 获取商品详情
    update: 更新商品
    destroy: 删除商品
    multiple_delete: 批量删除
    """

    # 查询集配置（性能优化）
    queryset = Product.objects.select_related('category', 'creator').all()

    # 序列化器配置
    serializer_class = ProductSerializer
    create_serializer_class = ProductCreateSerializer
    update_serializer_class = ProductUpdateSerializer
    list_serializer_class = ProductListSerializer

    # 过滤配置
    filter_fields = ['name', 'code', 'category', 'status', 'is_hot', 'is_new', 'is_recommend']
    search_fields = ['name', 'code', 'description']

    # 导入导出配置
    import_field_dict = {
        'name': '商品名称',
        'code': '商品编码',
        'category': '商品分类',
        'price': '销售价格',
        'stock': '库存数量',
        'status': '商品状态',
    }
    export_field_label = {
        'name': '商品名称',
        'code': '商品编码',
        'category_name': '商品分类',
        'price': '销售价格',
        'cost_price': '成本价格',
        'stock': '库存数量',
        'sales': '销量',
        'status_text': '状态',
        'create_datetime': '创建时间',
    }

    def get_queryset(self):
        """
        自定义查询集
        支持关键词搜索、分类筛选等
        """
        queryset = super().get_queryset()

        # 关键词搜索
        keyword = self.request.query_params.get('keyword')
        if keyword:
            queryset = queryset.filter(
                Q(name__icontains=keyword) |
                Q(code__icontains=keyword) |
                Q(description__icontains=keyword)
            )

        # 价格区间筛选
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # 库存筛选
        low_stock = self.request.query_params.get('low_stock')
        if low_stock:
            queryset = queryset.filter(stock__lt=10)

        return queryset

    @action(methods=['post'], detail=False)
    def batch_update_status(self, request):
        """
        批量修改商品状态

        请求体:
        {
            "ids": [1, 2, 3],
            "status": 1
        }
        """
        ids = request.data.get('ids', [])
        status = request.data.get('status')

        if not ids or status is None:
            return ErrorResponse(msg="参数不完整")

        count = Product.objects.filter(id__in=ids).update(status=status)
        return DetailResponse(msg=f"成功修改 {count} 个商品的状态")

    @action(methods=['post'], detail=True)
    def update_stock(self, request, pk=None):
        """
        修改库存

        请求体:
        {
            "stock": 100,
            "type": "add"  # add: 增加, set: 设置
        }
        """
        product = self.get_object()
        stock = request.data.get('stock')
        stock_type = request.data.get('type', 'set')

        if stock is None or stock < 0:
            return ErrorResponse(msg="库存数量无效")

        if stock_type == 'add':
            product.stock += stock
        else:
            product.stock = stock

        product.save()

        # 自动更新商品状态
        if product.stock == 0:
            product.status = 2  # 售罄
        elif product.stock > 0 and product.status == 2:
            product.status = 1  # 上架
        product.save()

        return DetailResponse(msg="库存修改成功")

    @action(methods=['get'], detail=False)
    def statistics(self, request):
        """
        商品统计信息

        返回:
        {
            "total": 100,
            "on_sale": 80,
            "off_sale": 15,
            "sold_out": 5,
            "total_stock": 10000,
            "low_stock_count": 10
        }
        """
        from django.db.models import Count, Sum

        stats = Product.objects.aggregate(
            total=Count('id'),
            on_sale=Count('id', filter=Q(status=1)),
            off_sale=Count('id', filter=Q(status=0)),
            sold_out=Count('id', filter=Q(status=2)),
            total_stock=Sum('stock'),
        )

        # 库存不足的商品数量
        low_stock_count = Product.objects.filter(stock__lt=10).count()

        return DetailResponse(data={
            **stats,
            "low_stock_count": low_stock_count
        })

    @action(methods=['post'], detail=True)
    def copy(self, request, pk=None):
        """
        复制商品

        创建一个新商品，复制原商品的所有信息
        """
        product = self.get_object()

        # 创建新商品
        new_product = Product.objects.create(
            name=f"{product.name} (副本)",
            code=f"{product.code}_COPY",
            category=product.category,
            price=product.price,
            cost_price=product.cost_price,
            stock=0,
            description=product.description,
            detail=product.detail,
            spec=product.spec,
            unit=product.unit,
            weight=product.weight,
            image=product.image,
            images=product.images,
            creator=request.user
        )

        # 复制SKU
        for sku in product.skus.all():
            ProductSku.objects.create(
                product=new_product,
                sku_code=f"{sku.sku_code}_COPY",
                spec=sku.spec,
                price=sku.price,
                cost_price=sku.cost_price,
                stock=0,
                image=sku.image
            )

        return DetailResponse(data={"id": new_product.id}, msg="商品复制成功")

    @action(methods=['get'], detail=False)
    def export_template(self, request):
        """
        下载导入模板
        """
        # 这里返回Excel模板文件
        # 实际实现需要使用 openpyxl 等库
        return DetailResponse(msg="模板下载功能待实现")
