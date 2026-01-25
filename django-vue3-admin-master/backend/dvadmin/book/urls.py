"""
图书管理系统 - 路由配置
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from dvadmin.book.views import (
    BookViewSet,
    BookCategoryViewSet,
    BookAuthorViewSet,
    BookPublisherViewSet,
    BookBorrowViewSet,
    BookReservationViewSet
)

router = SimpleRouter()
# 注册图书管理相关路由
router.register(r"book", BookViewSet)
router.register(r"category", BookCategoryViewSet)
router.register(r"author", BookAuthorViewSet)
router.register(r"publisher", BookPublisherViewSet)
router.register(r"borrow", BookBorrowViewSet)
router.register(r"reservation", BookReservationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
