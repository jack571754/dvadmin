from django.db import transaction
from rest_framework import serializers

from dvadmin.system.models import FileList
from dvadmin.utils.serializers import CustomModelSerializer

from .icon_models import IconDefinition
from .icon_services import replace_icon_products
from .icon_storage import ICON_ENGINE, serialize_icon_files

MIN_IMAGE_COUNT = 1
MAX_IMAGE_COUNT = 5


class IconDefinitionSerializer(CustomModelSerializer):
    product_codes = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )
    product_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = IconDefinition
        fields = "__all__"
        validators = []
        read_only_fields = ("creator", "modifier", "dept_belong_id")
        extra_kwargs = {
            "short_name": {"validators": []},
            "interpretation": {"required": False, "allow_blank": True},
            "icon_category": {"required": False, "allow_blank": True},
        }

    def validate_short_name(self, value):
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Icon 简称不能为空")
        return normalized

    def validate_interpretation(self, value):
        return value.strip()

    def validate_images(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Icon 图片必须是数组")
        if not MIN_IMAGE_COUNT <= len(value) <= MAX_IMAGE_COUNT:
            raise serializers.ValidationError("Icon 图片数量必须为 1-5 张")
        file_ids = self._extract_file_ids(value)
        files = FileList.objects.filter(
            id__in=file_ids, engine=ICON_ENGINE, file_type=0
        )
        if files.count() != len(file_ids):
            raise serializers.ValidationError("存在无效图片，请重新上传 Icon 图片")
        return [
            {"file_id": file_id, "sort": index}
            for index, file_id in enumerate(file_ids, start=1)
        ]

    def validate_product_codes(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("商品编码必须是数组")
        return [str(item).strip() for item in value if str(item).strip()]

    def validate(self, attrs):
        current_scope = getattr(
            self.instance, "scope_type", IconDefinition.SCOPE_SELECTED
        )
        scope_type = attrs.get("scope_type", current_scope)
        brand = attrs.get("brand", getattr(self.instance, "brand", "")).strip()
        category = attrs.get(
            "icon_category", getattr(self.instance, "icon_category", "")
        ).strip()
        attrs.update({"brand": brand, "icon_category": category})
        if not brand:
            raise serializers.ValidationError("品牌不能为空")
        self._validate_unique_short_name(attrs, brand)
        if scope_type == IconDefinition.SCOPE_SELECTED:
            self._validate_selected_scope(attrs, brand)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        product_codes = validated_data.pop("product_codes", [])
        instance = super().create(validated_data)
        replace_icon_products(instance, product_codes)
        return instance

    @transaction.atomic
    def update(self, instance, validated_data):
        product_codes = validated_data.pop("product_codes", None)
        instance = super().update(instance, validated_data)
        if product_codes is not None or instance.scope_type == IconDefinition.SCOPE_ALL:
            replace_icon_products(instance, product_codes or [])
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        images = serialize_icon_files(instance.images)
        data["images"] = images
        data["default_image"] = images[0] if images else None
        if self._should_include_product_codes():
            data["product_codes"] = list(
                instance.product_relations.order_by("id").values_list(
                    "product__product_code", flat=True
                )
            )
        return data

    def get_product_count(self, instance):
        if hasattr(instance, "product_count"):
            return instance.product_count
        return instance.product_relations.count()

    def _extract_file_ids(self, value):
        try:
            file_ids = [int(item["file_id"]) for item in value]
        except (KeyError, TypeError, ValueError) as exc:
            raise serializers.ValidationError("图片引用必须包含有效的 file_id") from exc
        if len(set(file_ids)) != len(file_ids) or any(item <= 0 for item in file_ids):
            raise serializers.ValidationError("图片 file_id 不能重复且必须为正整数")
        return file_ids

    def _validate_selected_scope(self, attrs, brand):
        if "product_codes" in attrs:
            if not attrs["product_codes"]:
                raise serializers.ValidationError({"product_codes": "请至少填写一个商品编码"})
            return
        if not self.instance or self.instance.scope_type == IconDefinition.SCOPE_ALL:
            raise serializers.ValidationError({"product_codes": "请填写商品编码"})
        if not self.instance.product_relations.exists():
            raise serializers.ValidationError({"product_codes": "请填写商品编码"})
        if self.instance.product_relations.exclude(product__brand=brand).exists():
            raise serializers.ValidationError("关联商品与当前品牌不一致")

    def _validate_unique_short_name(self, attrs, brand):
        short_name = attrs.get(
            "short_name", getattr(self.instance, "short_name", "")
        )
        queryset = IconDefinition.objects.filter(
            brand=brand,
            short_name__iexact=short_name,
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({
                "short_name": "同一品牌下 Icon 简称已存在，英文大小写视为同一简称"
            })

    def _should_include_product_codes(self) -> bool:
        view = self.context.get("view")
        return not view or getattr(view, "action", None) != "list"


class IconProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    product_code = serializers.CharField()
    product_name = serializers.CharField()
    nickname = serializers.CharField()
    brand = serializers.CharField()
    series = serializers.CharField()
    specification = serializers.CharField()


def icon_product_payload(relation) -> dict:
    product = relation.product
    return {
        "id": relation.id,
        "product_code": product.product_code,
        "product_name": product.product_name,
        "nickname": product.nickname,
        "brand": product.brand,
        "series": product.series,
        "specification": product.specification,
    }
