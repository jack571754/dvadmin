"""
图书管理系统 - 视图层

定义图书管理系统的所有视图集，提供 CRUD 接口
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse
from dvadmin.book.models import Book, BookCategory, BookAuthor, BookPublisher, BookBorrow, BookReservation
from dvadmin.book.serializers import (
    BookSerializer,
    BookListSerializer,
    BookCategorySerializer,
    BookCategoryTreeSerializer,
    BookAuthorSerializer,
    BookPublisherSerializer,
    BookBorrowSerializer,
    BookReservationSerializer
)


class BookCategoryViewSet(CustomModelViewSet):
    """
    图书分类视图集
    """
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = []

    def get_serializer_class(self):
        """根据操作返回不同的序列化器"""
        if self.action == "tree":
            return BookCategoryTreeSerializer
        return super().get_serializer_class()

    @action(methods=["GET"], detail=False)
    def tree(self, request, *args, **kwargs):
        """获取分类树形结构"""
        queryset = self.filter_queryset(self.get_queryset()).filter(parent=None)
        serializer = self.get_serializer(queryset, many=True)
        return DetailResponse(data=serializer.data)


class BookPublisherViewSet(CustomModelViewSet):
    """
    出版社视图集
    """
    queryset = BookPublisher.objects.all()
    serializer_class = BookPublisherSerializer
    permission_classes = []


class BookAuthorViewSet(CustomModelViewSet):
    """
    作者视图集
    """
    queryset = BookAuthor.objects.all()
    serializer_class = BookAuthorSerializer
    permission_classes = []


class BookViewSet(CustomModelViewSet):
    """
    图书视图集
    """
    queryset = Book.objects.select_related("category", "publisher").prefetch_related("authors")
    serializer_class = BookSerializer
    permission_classes = []

    def get_serializer_class(self):
        """列表操作使用简化序列化器"""
        if self.action == "list":
            return BookListSerializer
        return super().get_serializer_class()

    @action(methods=["GET"], detail=False)
    def available(self, request, *args, **kwargs):
        """获取可借阅的图书列表"""
        queryset = self.filter_queryset(self.get_queryset()).filter(
            available_quantity__gt=0,
            status=0
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return DetailResponse(data=serializer.data)

    @action(methods=["POST"], detail=True)
    def borrow(self, request, *args, **kwargs):
        """借阅图书"""
        book = self.get_object()
        if not book.is_available:
            return Response({"error": "图书不可借阅"}, status=400)
        # TODO: 实现借阅逻辑
        return DetailResponse(data={"message": "借阅成功"})

    @action(methods=["POST"], detail=True)
    def return_book(self, request, *args, **kwargs):
        """归还图书"""
        book = self.get_object()
        # TODO: 实现归还逻辑
        return DetailResponse(data={"message": "归还成功"})


class BookBorrowViewSet(CustomModelViewSet):
    """
    借阅记录视图集
    """
    queryset = BookBorrow.objects.select_related("book")
    serializer_class = BookBorrowSerializer
    permission_classes = []

    @action(methods=["POST"], detail=True)
    def renew(self, request, *args, **kwargs):
        """续借"""
        borrow_record = self.get_object()
        if borrow_record.renew_count >= borrow_record.max_renew_count:
            return Response({"error": "已达到最大续借次数"}, status=400)
        # TODO: 实现续借逻辑
        return DetailResponse(data={"message": "续借成功"})


class BookReservationViewSet(CustomModelViewSet):
    """
    预约记录视图集
    """
    queryset = BookReservation.objects.select_related("book")
    serializer_class = BookReservationSerializer
    permission_classes = []
