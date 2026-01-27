"""
图书管理系统 - 视图层

定义图书管理系统的所有视图集，提供 CRUD 接口
"""

from django.utils import timezone
from datetime import timedelta
from django.db import transaction
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

# 借阅配置常量
DEFAULT_BORROW_DAYS = 30  # 默认借阅天数
DEFAULT_RENEW_DAYS = 30  # 每次续借天数
BOOK_STATUS_AVAILABLE = 0  # 图书状态：正常

# 借阅记录状态
BORROW_STATUS_BORROWING = 0  # 借阅中
BORROW_STATUS_RETURNED = 1  # 已归还
BORROW_STATUS_OVERDUE = 2  # 逾期未还
BORROW_STATUS_RENEWED = 3  # 已续借


class BookCategoryViewSet(CustomModelViewSet):
    """
    图书分类视图集
    """
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    # 权限通过后台菜单配置

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
    # 权限通过后台菜单配置


class BookAuthorViewSet(CustomModelViewSet):
    """
    作者视图集
    """
    queryset = BookAuthor.objects.all()
    serializer_class = BookAuthorSerializer
    # 权限通过后台菜单配置


class BookViewSet(CustomModelViewSet):
    """
    图书视图集
    """
    queryset = Book.objects.select_related("category", "publisher").prefetch_related("authors")
    serializer_class = BookSerializer
    # 权限通过后台菜单配置

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
    @transaction.atomic
    def borrow(self, request, *args, **kwargs):
        """借阅图书"""
        try:
            # 检查用户登录
            if not request.user or not request.user.is_authenticated:
                return Response({"error": "用户未登录"}, status=401)

            book = self.get_object()

            # 检查库存是否充足
            if book.available_quantity <= 0:
                return Response({"error": "图书库存不足"}, status=400)

            # 检查图书状态
            if book.status != BOOK_STATUS_AVAILABLE:
                return Response({"error": "图书不可借阅"}, status=400)

            # 检查用户是否有未归还的同书
            existing_borrow = BookBorrow.objects.filter(
                book=book,
                user=request.user,
                status__in=[BORROW_STATUS_BORROWING, BORROW_STATUS_OVERDUE, BORROW_STATUS_RENEWED]
            ).first()
            if existing_borrow:
                return Response({"error": "您已借阅该图书，请先归还后再借阅"}, status=400)

            # 创建借阅记录
            borrow_date = timezone.now()
            due_date = borrow_date + timedelta(days=DEFAULT_BORROW_DAYS)

            borrow_record = BookBorrow.objects.create(
                book=book,
                user=request.user,
                status=BORROW_STATUS_BORROWING,
                borrow_date=borrow_date,
                due_date=due_date
            )

            # 扣减库存
            book.available_quantity -= 1
            book.save(update_fields=['available_quantity'])

            return DetailResponse(data={
                "message": "借阅成功",
                "borrow_record": BookBorrowSerializer(borrow_record).data
            })
        except Exception as e:
            import traceback
            return Response({"error": f"借阅失败: {str(e)}", "detail": traceback.format_exc()}, status=400)

    @action(methods=["POST"], detail=True)
    @transaction.atomic
    def return_book(self, request, *args, **kwargs):
        """归还图书"""
        # 检查用户登录
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "用户未登录"}, status=401)

        book = self.get_object()

        # 查找用户的借阅中记录
        borrow_record = BookBorrow.objects.filter(
            book=book,
            user=request.user,
            status__in=[BORROW_STATUS_BORROWING, BORROW_STATUS_OVERDUE, BORROW_STATUS_RENEWED]
        ).first()

        if not borrow_record:
            return Response({"error": "未找到借阅记录"}, status=400)

        # 更新借阅记录
        return_date = timezone.now()
        borrow_record.return_date = return_date

        # 判断是否逾期（使用条件表达式简化代码）
        borrow_record.status = BORROW_STATUS_OVERDUE if return_date > borrow_record.due_date else BORROW_STATUS_RETURNED

        borrow_record.save()

        # 增加库存
        book.available_quantity += 1
        book.save(update_fields=['available_quantity'])

        return DetailResponse(data={
            "message": "归还成功",
            "borrow_record": BookBorrowSerializer(borrow_record).data
        })


class BookBorrowViewSet(CustomModelViewSet):
    """
    借阅记录视图集
    """
    queryset = BookBorrow.objects.select_related("book", "user")
    serializer_class = BookBorrowSerializer
    # 权限通过后台菜单配置

    @action(methods=["POST"], detail=True)
    @transaction.atomic
    def renew(self, request, *args, **kwargs):
        """续借"""
        borrow_record = self.get_object()

        # 检查续借次数
        if borrow_record.renew_count >= borrow_record.max_renew_count:
            return Response({"error": "已达到最大续借次数"}, status=400)

        # 检查状态：仅允许借阅中或已续借的记录续借
        if borrow_record.status not in [BORROW_STATUS_BORROWING, BORROW_STATUS_RENEWED]:
            return Response({"error": "当前状态不允许续借"}, status=400)

        # 延长应还日期
        borrow_record.due_date += timedelta(days=DEFAULT_RENEW_DAYS)
        borrow_record.renew_count += 1
        borrow_record.status = BORROW_STATUS_RENEWED
        borrow_record.save()

        return DetailResponse(data={
            "message": "续借成功",
            "borrow_record": BookBorrowSerializer(borrow_record).data
        })


class BookReservationViewSet(CustomModelViewSet):
    """
    预约记录视图集
    """
    queryset = BookReservation.objects.select_related("book")
    serializer_class = BookReservationSerializer
    # 权限通过后台菜单配置
