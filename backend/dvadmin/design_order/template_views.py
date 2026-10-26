from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter

from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.utils.filters import CustomDjangoFilterBackend
from dvadmin.utils.json_response import DetailResponse, ErrorResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.viewset import CustomModelViewSet

from .template_models import ProductSpecTemplate
from .template_serializers import ProductSpecTemplateSerializer
from .template_service import get_active_templates, get_template, to_schema


class ProductSpecTemplateViewSet(FieldPermissionMixin, CustomModelViewSet):
    """规格提报模板管理和提报端模板读取接口。"""

    queryset = ProductSpecTemplate.objects.all()
    serializer_class = ProductSpecTemplateSerializer
    permission_classes = [CustomPermission]
    filter_fields = ["platform", "status", "template_code"]
    search_fields = ["template_code", "template_name", "remark"]
    ordering_fields = ["id", "platform", "sort", "template_code", "create_datetime"]
    extra_filter_class = []
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    @action(detail=False, methods=["get"])
    def available(self, request):
        platform = request.query_params.get("platform", "").strip()
        if not platform:
            return ErrorResponse(msg="platform 为必填参数", status=400)
        data = [to_schema(template) for template in get_active_templates(platform)]
        return DetailResponse(data=data, msg="获取可用模板成功")

    @action(detail=False, methods=["get"])
    def schema(self, request):
        template_code = request.query_params.get("template_code", "").strip()
        if not template_code:
            return ErrorResponse(msg="template_code 为必填参数", status=400)
        try:
            data = to_schema(get_template(template_code))
        except ValueError as error:
            return ErrorResponse(msg=str(error), status=404)
        return DetailResponse(data=data, msg="获取模板配置成功")
