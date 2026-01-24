# -*- coding: utf-8 -*-
"""
商品管理模块 - 视图层
"""

from .product import ProductViewSet
from .category import ProductCategoryViewSet

__all__ = ['ProductViewSet', 'ProductCategoryViewSet']
