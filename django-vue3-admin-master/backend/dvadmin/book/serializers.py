"""
图书管理系统 - 序列化器

定义图书管理系统的所有序列化器，用于 API 数据的序列化和反序列化
"""

from rest_framework import serializers
from dvadmin.book.models import Book, BookCategory, BookAuthor, BookPublisher, BookBorrow, BookReservation


class BookCategorySerializer(serializers.ModelSerializer):
    """图书分类序列化器"""

    class Meta:
        model = BookCategory
        fields = "__all__"


class BookCategoryTreeSerializer(serializers.ModelSerializer):
    """图书分类树形结构序列化器"""
    children = serializers.SerializerMethodField()

    class Meta:
        model = BookCategory
        fields = "__all__"

    def get_children(self, obj):
        """获取子分类"""
        children = BookCategory.objects.filter(parent=obj)
        if children.exists():
            return BookCategoryTreeSerializer(children, many=True).data
        return []


class BookPublisherSerializer(serializers.ModelSerializer):
    """出版社序列化器"""

    class Meta:
        model = BookPublisher
        fields = "__all__"


class BookAuthorSerializer(serializers.ModelSerializer):
    """作者序列化器"""

    class Meta:
        model = BookAuthor
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    """图书序列化器"""
    category_name = serializers.CharField(source="category.name", read_only=True)
    publisher_name = serializers.CharField(source="publisher.name", read_only=True)
    author_names = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Book
        fields = "__all__"

    def get_author_names(self, obj):
        """获取作者名称列表"""
        return [author.name for author in obj.authors.all()]


class BookListSerializer(serializers.ModelSerializer):
    """图书列表序列化器（简化版）"""
    category_name = serializers.CharField(source="category.name", read_only=True)
    publisher_name = serializers.CharField(source="publisher.name", read_only=True)
    author_names = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ["id", "isbn", "title", "category", "category_name", "publisher",
                  "publisher_name", "author_names", "publish_date", "price",
                  "available_quantity", "total_quantity", "status", "cover"]

    def get_author_names(self, obj):
        """获取作者名称列表"""
        return [author.name for author in obj.authors.all()]


class BookBorrowSerializer(serializers.ModelSerializer):
    """借阅记录序列化器"""
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_isbn = serializers.CharField(source="book.isbn", read_only=True)
    status_text = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BookBorrow
        fields = "__all__"


class BookReservationSerializer(serializers.ModelSerializer):
    """预约记录序列化器"""
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_isbn = serializers.CharField(source="book.isbn", read_only=True)
    status_text = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BookReservation
        fields = "__all__"
