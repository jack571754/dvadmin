"""设计工单管理序列化器"""
from rest_framework import serializers

from dvadmin.utils.serializers import CustomModelSerializer
from .models import ProductArchive, ProductSpec, ProductSpecSubmission, ProductSpecShare
from .permissions_service import submission_permissions
from .field_security import mask_snapshot_for_user
from .template_service import get_active_template_for_platform


class ProductArchiveSerializer(CustomModelSerializer):
    class Meta:
        model = ProductArchive
        fields = "__all__"


class ProductSpecSerializer(CustomModelSerializer):
    class Meta:
        model = ProductSpec
        fields = "__all__"


class ProductSpecSubmissionSerializer(CustomModelSerializer):
    creator_name = serializers.SerializerMethodField()
    canEdit = serializers.SerializerMethodField()
    canDelete = serializers.SerializerMethodField()
    canCopy = serializers.SerializerMethodField()
    canShare = serializers.SerializerMethodField()

    def validate(self, attrs):
        platform = attrs.get(
            "platform",
            self.instance.platform if self.instance else "京东",
        )
        initial = self.initial_data or {}
        if 'snapshot_data' in initial or initial.get('status', 'draft') != 'draft':
            raise serializers.ValidationError('快照与正式提交只能通过规格书保存接口写入')
        if self.instance and platform != self.instance.platform and self.instance.snapshot_data:
            raise serializers.ValidationError('已有快照的工单不能通过元数据接口切换平台')
        if self.instance and platform == self.instance.platform:
            attrs['template_type'] = self.instance.template_type
        else:
            try:
                attrs['template_type'] = get_active_template_for_platform(platform).template_code
            except ValueError as error:
                raise serializers.ValidationError({'platform': str(error)}) from error
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.request or self.context.get('request')
        if request and 'snapshot_data' in data:
            data['snapshot_data'] = mask_snapshot_for_user(instance.snapshot_data, instance.template_type, request.user)
        return data

    def get_creator_name(self, instance):
        return getattr(instance.creator, "name", None) or getattr(instance.creator, "username", "")

    def _permissions(self, instance):
        request = self.request or self.context.get("request")
        return submission_permissions(request.user, instance) if request else {}

    def get_canEdit(self, instance):
        return self._permissions(instance).get("canEdit", False)

    def get_canDelete(self, instance):
        return self._permissions(instance).get("canDelete", False)

    def get_canCopy(self, instance):
        return self._permissions(instance).get("canCopy", False)

    def get_canShare(self, instance):
        return self._permissions(instance).get("canShare", False)

    class Meta:
        model = ProductSpecSubmission
        fields = "__all__"
        read_only_fields = ["snapshot_data", "product_count", "creator_name", "canEdit", "canDelete", "canCopy", "canShare"]


class ProductSpecSubmissionListSerializer(ProductSpecSubmissionSerializer):
    class Meta(ProductSpecSubmissionSerializer.Meta):
        fields = [
            "id",
            "platform",
            "shop",
            "name",
            "status",
            "product_count",
            "template_type",
            "creator",
            "creator_name",
            "create_datetime",
            "update_datetime",
            "canEdit",
            "canDelete",
            "canCopy",
            "canShare",
        ]


class ProductSpecShareSerializer(CustomModelSerializer):
    class Meta:
        model = ProductSpecShare
        fields = "__all__"
        read_only_fields = ["share_code"]
