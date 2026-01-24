# -*- coding: utf-8 -*-
"""
商品管理模块 - 路由配置
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views.product import ProductViewSet
from .views.category import ProductCategoryViewSet

# 创建路由器
router = SimpleRouter()

# 注册视图集路由
router.register(r'product', ProductViewSet, basename='product')
router.register(r'category', ProductCategoryViewSet, basename='category')

# 路由列表
urlpatterns = [
    path('', include(router.urls)),
]
