"""
设计工单管理序列化器
"""
from dvadmin.utils.serializers import CustomModelSerializer
from .models import ProductArchive, ProductSpec, ProductSpecSubmission


class ProductArchiveSerializer(CustomModelSerializer):
    """
    产品档案序列化器
    """
    class Meta:
        model = ProductArchive
        fields = "__all__"


class ProductSpecSerializer(CustomModelSerializer):
    """
    产品规格明细序列化器
    """
    class Meta:
        model = ProductSpec
        fields = "__all__"


class ProductSpecSubmissionSerializer(CustomModelSerializer):
    """
    产品规格提报历史序列化器
    """
    class Meta:
        model = ProductSpecSubmission
        fields = "__all__"

