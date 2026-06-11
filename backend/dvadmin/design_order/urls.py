"""
设计工单管理路由配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductArchiveViewSet, SaveProductSpecView, LoadProductSpecView, ProductSpecViewSet, ProductSpecSubmissionViewSet

router = DefaultRouter()
router.register(r'product_archives', ProductArchiveViewSet, basename='product_archive')
router.register(r'product_specs', ProductSpecViewSet, basename='product_spec')
router.register(r'product_spec_submissions', ProductSpecSubmissionViewSet, basename='product_spec_submission')


urlpatterns = [
    # 产品规格书保存接口
    path('product_archives/save_spec/', SaveProductSpecView.as_view(), name='save-product-spec'),
    # 产品规格书获取/加载接口
    path('product_archives/load_spec/', LoadProductSpecView.as_view(), name='load-product-spec'),
    path('', include(router.urls)),
]
