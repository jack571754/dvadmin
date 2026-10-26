from rest_framework import serializers

from dvadmin.utils.serializers import CustomModelSerializer

from .template_models import ProductSpecTemplate

ALLOWED_STYLES = {
    "contentCenter",
    "contentLeft",
    "contentLeftShaded",
    "editableCenter",
    "editableDate",
}
ALLOWED_KINDS = {"text", "longtext", "mention", "gifts", "tier", "dateRange", "price"}


class ProductSpecTemplateSerializer(CustomModelSerializer):
    """规格提报模板配置序列化器。"""

    class Meta:
        model = ProductSpecTemplate
        fields = "__all__"

    def validate_template_code(self, value):
        instance = getattr(self, "instance", None)
        if instance and instance.template_code != value:
            raise serializers.ValidationError("模板编码创建后不可修改")
        return value

    def validate(self, attrs):
        fields = attrs.get("fields", getattr(self.instance, "fields", []))
        rows_per_block = attrs.get(
            "rows_per_block",
            getattr(self.instance, "rows_per_block", 15),
        )
        validation = attrs.get("validation", getattr(self.instance, "validation", {}))
        self._validate_active_platform(attrs)
        self._validate_fields(fields, rows_per_block)
        self._validate_validation(validation, fields)
        return attrs

    def _validate_active_platform(self, attrs):
        platform = attrs.get("platform", getattr(self.instance, "platform", ""))
        status = attrs.get("status", getattr(self.instance, "status", True))
        if not status:
            return
        existing = ProductSpecTemplate.objects.filter(platform=platform, status=True)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError(
                {"platform": f"平台“{platform}”已有启用模板，请先禁用原配置"}
            )

    def _validate_fields(self, fields, rows_per_block):
        if not isinstance(fields, list) or not fields:
            raise serializers.ValidationError({"fields": "请至少配置一个模板字段"})
        rows = set()
        keys = set()
        for field in fields:
            self._validate_field(field, rows_per_block, rows, keys)
        if "nickname" not in keys:
            raise serializers.ValidationError({"fields": "字段配置必须包含产品昵称（nickname）"})

    def _validate_field(self, field, rows_per_block, rows, keys):
        required = {"row", "key", "label", "style", "kind"}
        if not isinstance(field, dict) or not required.issubset(field):
            raise serializers.ValidationError({"fields": "每个字段必须包含行号、键名、标签、样式和类型"})
        if not isinstance(field["row"], int) or not 1 <= field["row"] < rows_per_block - 1:
            raise serializers.ValidationError({"fields": "字段行号必须在 1 到每产品块行数减 2 之间"})
        if field["row"] in rows or field["key"] in keys:
            raise serializers.ValidationError({"fields": "字段行号和字段键名均不可重复"})
        if field["style"] not in ALLOWED_STYLES or field["kind"] not in ALLOWED_KINDS:
            raise serializers.ValidationError({"fields": "字段样式或字段类型不受支持"})
        rows.add(field["row"])
        keys.add(field["key"])

    def _validate_validation(self, validation, fields):
        if not isinstance(validation, dict):
            raise serializers.ValidationError({"validation": "校验配置必须为对象"})
        keys = {field["key"] for field in fields}
        for field_name in validation.get("requiredProductFields", []):
            if field_name not in keys:
                raise serializers.ValidationError({"validation": "产品必填字段必须存在于字段配置中"})
        for rule_name in ("priceFieldKey", "dateRangeFieldKey"):
            field_name = validation.get(rule_name)
            if field_name and field_name not in keys:
                raise serializers.ValidationError({"validation": f"{rule_name} 必须存在于字段配置中"})
