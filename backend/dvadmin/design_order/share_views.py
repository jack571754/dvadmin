from copy import deepcopy

from django.conf import settings
from rest_framework import permissions
from rest_framework.views import APIView

from dvadmin.system.models import FieldPermission, MenuField
from dvadmin.utils.json_response import DetailResponse, ErrorResponse

from .models import ProductSpecShare, ProductSpecSubmission
from .templates_schemas import get_maskkey_to_row, get_rows_per_block, get_schema
from .permissions_service import can_share_submission
from .icon_refs import normalize_icon_refs
from .field_security import mask_snapshot_for_user, mask_sheet_cells, restricted_fields
from .icon_storage import build_icon_file_url_map


class ProductSpecShareCreateView(APIView):
    """
    创建或复用规格提报分享链接。
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        submission_id = request.data.get("submission_id") or request.data.get("id")
        submission = ProductSpecSubmission.objects.filter(id=submission_id).first()
        if not submission:
            return ErrorResponse(msg="未找到对应的规格提报")
        if not can_share_submission(request.user, submission):
            return ErrorResponse(msg="当前用户没有该工单的分享权限", status=403)
        if not submission.snapshot_data:
            return ErrorResponse(msg="表格无内容，无法分享")
        share, _ = ProductSpecShare.objects.get_or_create(
            submission=submission,
            defaults={"creator": request.user},
        )
        if not share.enabled:
            share.enabled = True
            share.save(update_fields=["enabled"])
        data = {
            "shareCode": share.share_code,
            "shareUrl": build_share_url(request, share.share_code),
        }
        return DetailResponse(data=data, msg="分享链接已生成")


class ProductSpecShareDetailView(APIView):
    """
    读取分享规格提报快照。免登录：分享码是 24 位密码学随机串，链接本身即凭证，
    分享人已在创建时过了 Share 按钮权限和工单可见性校验。
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, share_code):
        share = ProductSpecShare.objects.select_related("submission").filter(
            share_code=share_code,
            enabled=True,
        ).first()
        if not share:
            return ErrorResponse(msg="分享链接不存在或已停用")
        submission = share.submission
        snapshot = mask_snapshot_for_user(
            deepcopy(submission.snapshot_data),
            submission.template_type,
            request.user,
        )
        icon_restricted = is_field_restricted("icon", request.user)
        icon_refs = get_product_icon_refs(submission, icon_restricted)
        data = {
            "id": submission.id,
            "name": submission.name,
            "shop": submission.shop,
            "status": submission.status,
            "snapshot": snapshot,
            "formCount": submission.product_count or 1,
            "templateType": submission.template_type,
            "templateSchema": get_schema(submission.template_type),
            "productIconRefs": icon_refs,
            "iconImageUrls": build_share_icon_urls(icon_refs),
        }
        return DetailResponse(data=data, msg="获取分享规格提报成功")


def build_share_url(request, share_code: str) -> str:
    base_url = settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{base_url}/#/share/product-spec/{share_code}"


def get_restricted_fields(user):
    return restricted_fields(user)


def is_field_restricted(field_name: str, user) -> bool:
    return field_name in get_restricted_fields(user)


def get_restricted_rows(template_type: str, user) -> set:
    maskkey_to_row = get_maskkey_to_row(template_type)
    return {
        maskkey_to_row[key]
        for key in get_restricted_fields(user)
        if key in maskkey_to_row
    }


def get_product_icon_refs(submission, icon_restricted: bool) -> list[dict]:
    if icon_restricted:
        return []
    return [
        {
            "cardIndex": spec.card_index,
            "iconRefs": normalize_icon_refs(
                (spec.spec_data or {}).get("iconRefs", [])
            ),
        }
        for spec in submission.specs.order_by("card_index")
    ]


def build_share_icon_urls(product_icon_refs: list[dict]) -> list[dict]:
    """随快照一起下发本工单引用到的 Icon 图片直链。

    分享页免登录，不能再去调需要鉴权的 resolve-image-urls；把解析放在这里，
    也避免为了分享而开放一个能按 file_id 枚举全部 Icon 图片的匿名端点。
    """
    file_ids = {
        ref["fileId"]
        for item in product_icon_refs
        for ref in item["iconRefs"]
        if ref.get("fileId")
    }
    if not file_ids:
        return []
    try:
        url_map = build_icon_file_url_map(file_ids)
    except RuntimeError:
        # 图片存储不可用时不连累整张表的展示，Icon 位留空即可。
        return []
    return [{"fileId": file_id, "url": url} for file_id, url in url_map.items()]
