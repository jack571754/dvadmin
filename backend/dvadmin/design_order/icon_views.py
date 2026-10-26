from django.db import IntegrityError
from django.db.models import Count, Q
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny

from dvadmin.utils.filters import CustomDjangoFilterBackend
from dvadmin.utils.json_response import DetailResponse, ErrorResponse, SuccessResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.viewset import CustomModelViewSet

from .icon_models import IconDefinition
from .icon_product_validation_views import IconProductValidationMixin
from .icon_serializers import IconDefinitionSerializer, icon_product_payload
from .icon_services import (
    IconProductError,
    add_icon_products,
    remove_icon_products,
    resolve_icons_by_products,
)
from .icon_storage import (
    ICON_IMAGE_TOKEN_WINDOW,
    build_icon_file_url_map,
    get_icon_file,
    iter_icon_object,
    open_icon_object,
    resolve_icon_image_token,
    serialize_icon_files,
    upload_icon_image,
)
from .models import ProductArchive

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
MAX_IMAGE_FILE_IDS = 500


def normalize_image_file_id(value) -> int:
    if isinstance(value, bool):
        raise serializers.ValidationError("file_ids 必须是正整数数组")
    if isinstance(value, float) and not value.is_integer():
        raise serializers.ValidationError("file_ids 必须是正整数数组")
    if isinstance(value, str) and not value.strip().isdigit():
        raise serializers.ValidationError("file_ids 必须是正整数数组")
    try:
        file_id = int(value)
    except (TypeError, ValueError) as exc:
        raise serializers.ValidationError("file_ids 必须是正整数数组") from exc
    if file_id <= 0:
        raise serializers.ValidationError("file_ids 必须是正整数数组")
    return file_id


def normalize_image_file_ids(value) -> list[int]:
    if not isinstance(value, list):
        raise serializers.ValidationError("file_ids 必须是数组")
    if len(value) > MAX_IMAGE_FILE_IDS:
        raise serializers.ValidationError(
            f"file_ids 最多支持 {MAX_IMAGE_FILE_IDS} 条"
        )
    result = []
    for raw in value:
        file_id = normalize_image_file_id(raw)
        if file_id not in result:
            result.append(file_id)
    return result


class IconDefinitionViewSet(IconProductValidationMixin, CustomModelViewSet):
    serializer_class = IconDefinitionSerializer
    permission_classes = [CustomPermission]
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]
    extra_filter_class = []
    filter_fields = ["brand", "icon_category", "scope_type", "status"]
    search_fields = ["short_name", "interpretation", "remark"]
    ordering_fields = ["id", "short_name", "create_datetime", "update_datetime"]

    def get_queryset(self):
        queryset = IconDefinition.objects.exclude(
            status=IconDefinition.STATUS_DELETED
        ).annotate(
            product_count=Count("product_relations", distinct=True)
        )
        if self.action != "list":
            return queryset.prefetch_related("product_relations__product")
        return queryset

    def destroy(self, request, *args, **kwargs):
        """软删除：标记为已删除，保留历史数据供已提交的规格提报使用"""
        icon = self.get_object()
        if icon.status != IconDefinition.STATUS_DISABLED:
            return ErrorResponse(
                msg="只有停用状态的 Icon 可以删除，请先停用后再操作",
                code=4000,
            )
        icon.soft_delete()
        return DetailResponse(msg="Icon 已删除")

    def handle_exception(self, exc):
        if isinstance(exc, serializers.ValidationError):
            return ErrorResponse(
                data=exc.detail,
                msg=self._validation_message(exc.detail),
                code=4000,
            )
        if isinstance(exc, IconProductError):
            return ErrorResponse(data=exc.details, msg=str(exc), code=4000)
        if isinstance(exc, IntegrityError):
            return ErrorResponse(
                msg="同一品牌下 Icon 简称已存在，英文大小写视为同一简称",
                code=4000,
            )
        return super().handle_exception(exc)

    @action(detail=True, methods=["post"])
    def enable(self, request, pk=None):
        return self._change_status(
            self.get_object(), IconDefinition.STATUS_ENABLED, "Icon 已启用"
        )

    @action(detail=True, methods=["post"])
    def disable(self, request, pk=None):
        return self._change_status(
            self.get_object(), IconDefinition.STATUS_DISABLED, "Icon 已停用"
        )

    @action(
        detail=False, methods=["post"], url_path="batch-change-status"
    )
    def batch_change_status(self, request):
        ids = request.data.get("ids", [])
        status = request.data.get("status")
        if not ids:
            return ErrorResponse(msg="请选择要操作的 Icon", code=4000)
        if status not in (
            IconDefinition.STATUS_ENABLED,
            IconDefinition.STATUS_DISABLED,
        ):
            return ErrorResponse(msg="无效的状态值", code=4000)
        if not isinstance(ids, list) or any(isinstance(value, bool) or not str(value).isdigit() or int(value) <= 0 for value in ids):
            return ErrorResponse(msg="ids 必须是正整数数组", code=4000)
        targets = {int(value) for value in ids}
        queryset = self.get_queryset().filter(id__in=targets)
        if queryset.count() != len(targets):
            return ErrorResponse(msg="包含不存在或已删除的 Icon，未更新任何记录", code=4000)
        count = queryset.exclude(status=status).update(status=status)
        label = "启用" if status == IconDefinition.STATUS_ENABLED else "停用"
        return DetailResponse(data={"updated": count}, msg=f"已批量{label} {count} 个 Icon")

    @action(
        detail=False, methods=["post"], url_path="batch-delete"
    )
    def batch_delete(self, request):
        ids = request.data.get("ids", [])
        if not ids:
            return ErrorResponse(msg="请选择要删除的 Icon", code=4000)
        icons = list(IconDefinition.objects.filter(id__in=ids))
        if any(icon.status != IconDefinition.STATUS_DISABLED for icon in icons):
            return ErrorResponse(
                msg="只有停用状态的 Icon 可以删除，请先停用后再操作",
                code=4000,
            )
        count = 0
        for icon in icons:
            icon.soft_delete()
            count += 1
        return DetailResponse(msg=f"已批量删除 {count} 个 Icon")

    @action(
        detail=False,
        methods=["post"],
        url_path="upload-image",
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_image(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return ErrorResponse(msg="请选择要上传的图片", code=4000)
        try:
            file_record = upload_icon_image(uploaded_file, request.user)
            image = serialize_icon_files([{"file_id": file_record.id}])[0]
            return DetailResponse(data=image, msg="图片上传成功")
        except (RuntimeError, ValueError) as exc:
            return ErrorResponse(msg=str(exc), code=4000)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"image/(?P<file_id>\d+)",
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def image(self, request, file_id=None):
        """图片下发端点：img 标签带不了 JWT 头，改用签名票据鉴权。

        返回裸二进制而不是项目统一的 JSON 包装，因为消费方是浏览器的图片加载器。
        """
        try:
            token_file_id = resolve_icon_image_token(request.query_params.get("sign", ""))
        except PermissionError as exc:
            return self._plain_error(str(exc), 403)
        if token_file_id != int(file_id):
            return self._plain_error("图片链接无效或已过期", 403)
        try:
            icon_object = open_icon_object(get_icon_file(token_file_id))
        except FileNotFoundError as exc:
            return self._plain_error(str(exc), 404)
        except (RuntimeError, ValueError) as exc:
            return self._plain_error(f"图片读取失败: {exc}", 502)
        return self._icon_image_response(icon_object)

    @staticmethod
    def _plain_error(message: str, status_code: int) -> HttpResponse:
        return HttpResponse(
            message, status=status_code, content_type="text/plain; charset=utf-8"
        )

    @staticmethod
    def _icon_image_response(icon_object) -> StreamingHttpResponse:
        response = StreamingHttpResponse(
            iter_icon_object(icon_object), content_type=icon_object.content_type
        )
        if icon_object.content_length is not None:
            response["Content-Length"] = str(icon_object.content_length)
        if icon_object.etag:
            response["ETag"] = f'"{icon_object.etag}"'
        # 票据按固定时间窗签发，窗口内 URL 稳定，缓存时长与窗口对齐才能真正命中
        response["Cache-Control"] = f"private, max-age={ICON_IMAGE_TOKEN_WINDOW}"
        response["X-Content-Type-Options"] = "nosniff"
        return response

    @action(detail=True, methods=["get"], url_path="products")
    def products(self, request, pk=None):
        icon = self.get_object()
        queryset = icon.product_relations.select_related("product").order_by(
            "product__product_code"
        )
        keyword = request.query_params.get("keyword", "").strip()
        if keyword:
            queryset = queryset.filter(
                Q(product__product_code__icontains=keyword)
                | Q(product__product_name__icontains=keyword)
                | Q(product__nickname__icontains=keyword)
            )
        page, limit = self._pagination_values(request)
        total = queryset.count()
        rows = [
            icon_product_payload(item)
            for item in queryset[(page - 1) * limit : page * limit]
        ]
        return SuccessResponse(data=rows, page=page, limit=limit, total=total, msg="商品查询成功")

    @action(detail=True, methods=["post"], url_path="products/batch-add")
    def batch_add_products(self, request, pk=None):
        return self._run_product_action(
            add_icon_products, self.get_object(), request.data.get("product_codes", []), "商品添加成功"
        )

    @action(detail=True, methods=["post"], url_path="products/batch-remove")
    def batch_remove_products(self, request, pk=None):
        return self._run_product_action(
            remove_icon_products, self.get_object(), request.data.get("product_codes", []), "商品移出成功"
        )

    @action(detail=False, methods=["get"], url_path="product-options")
    def product_options(self, request):
        queryset = ProductArchive.objects.all().order_by("product_code")
        brand = request.query_params.get("brand", "").strip()
        keyword = request.query_params.get("keyword", "").strip()
        if brand:
            queryset = queryset.filter(brand=brand)
        if keyword:
            queryset = queryset.filter(
                Q(product_code__icontains=keyword)
                | Q(product_name__icontains=keyword)
                | Q(nickname__icontains=keyword)
            )
        icon_id = request.query_params.get("icon_id", "").strip()
        if icon_id:
            try:
                queryset = queryset.exclude(icon_relations__icon_id=int(icon_id))
            except ValueError as exc:
                raise serializers.ValidationError("icon_id 必须是数字") from exc
        page, limit = self._pagination_values(request)
        total = queryset.count()
        start = (page - 1) * limit
        rows = list(
            queryset.values(
                "id", "product_code", "product_name", "nickname", "brand", "series", "specification"
            )[start : start + limit]
        )
        return SuccessResponse(data=rows, page=page, limit=limit, total=total, msg="商品查询成功")

    @action(detail=False, methods=["get"], url_path="brands")
    def brands(self, request):
        brands = list(
            ProductArchive.objects.exclude(brand="")
            .order_by("brand")
            .values_list("brand", flat=True)
            .distinct()
        )
        return DetailResponse(data=brands, msg="品牌查询成功")

    @action(detail=False, methods=["get"], url_path="categories")
    def categories(self, request):
        categories = list(
            IconDefinition.objects.exclude(icon_category="")
            .order_by("icon_category")
            .values_list("icon_category", flat=True)
            .distinct()
        )
        return DetailResponse(data=categories, msg="分类查询成功")

    @action(detail=False, methods=["post"], url_path="resolve-by-products")
    def resolve_by_products(self, request):
        try:
            # 封面图直链已在 resolve_icons_by_products 里批量生成，这里不再逐条取图。
            items = resolve_icons_by_products(request.data.get("product_codes", []))
            return DetailResponse(data={"items": items}, msg="Icon 查询成功")
        except IconProductError as exc:
            return ErrorResponse(data=exc.details, msg=str(exc), code=4000)

    @action(detail=False, methods=["post"], url_path="resolve-image-urls")
    def resolve_image_urls(self, request):
        file_ids = normalize_image_file_ids(request.data.get("file_ids", []))
        try:
            url_map = build_icon_file_url_map(file_ids)
        except RuntimeError as exc:
            return ErrorResponse(msg=str(exc), code=4000)
        items = [
            {"file_id": file_id, "url": url_map[file_id]}
            for file_id in file_ids
            if file_id in url_map
        ]
        return DetailResponse(data={"items": items}, msg="Icon 图片地址解析成功")

    def _change_status(self, icon, status, message):
        icon.status = status
        icon.save(update_fields=["status", "update_datetime"])
        return DetailResponse(data={"id": icon.id, "status": status}, msg=message)

    def _run_product_action(self, handler, icon, product_codes, message):
        try:
            return DetailResponse(data=handler(icon, product_codes), msg=message)
        except IconProductError as exc:
            return ErrorResponse(data=exc.details, msg=str(exc), code=4000)

    def _pagination_values(self, request):
        try:
            page = max(1, int(request.query_params.get("page", 1)))
            limit = min(
                MAX_PAGE_SIZE,
                max(1, int(request.query_params.get("limit", DEFAULT_PAGE_SIZE))),
            )
        except ValueError as exc:
            raise serializers.ValidationError("page 和 limit 必须是数字") from exc
        return page, limit

    def _validation_message(self, detail):
        if isinstance(detail, dict) and detail:
            return self._validation_message(next(iter(detail.values())))
        if isinstance(detail, list) and detail:
            return self._validation_message(detail[0])
        return str(detail)
