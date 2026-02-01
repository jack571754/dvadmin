"""
博客路由配置
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TagViewSet,
    ArticleViewSet,
    CommentViewSet,
    RegisterView
)

# 创建路由器
router = DefaultRouter()

# 注册 ViewSet 路由
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # ViewSet 路由
    path('', include(router.urls)),

    # 注册接口（公开）
    path('register/', RegisterView.as_view(), name='blog-register'),
]
