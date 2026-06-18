"""
产品规格书模板 Schema（Python 版，与前端 schema/templates.ts 对等）。
单一事实源：新增模板 = 在此文件追加一个 dict + 注册到 TEMPLATES。
"""
from typing import Dict, List, Optional


# ---- main_image：行偏移/字段键/遮罩键与旧 views.py 硬编码一致，行为零变化 ----
MAIN_IMAGE_SCHEMA = {
    "templateType": "main_image",
    "label": "主图提报",
    "rowsPerBlock": 15,
    "columnsPerBlock": 6,
    "fields": [
        {"row": 1, "key": "brand", "label": "品牌与标志", "style": "contentCenter", "kind": "text", "maskKey": "brand"},
        {"row": 2, "key": "nickname", "label": "产品昵称", "style": "editableCenter", "kind": "mention", "maskKey": "nickname"},
        {"row": 3, "key": "fullName", "label": "官方全称", "style": "contentLeft", "kind": "text", "maskKey": "full_name"},
        {"row": 4, "key": "spec", "label": "商品规格", "style": "contentCenter", "kind": "text", "maskKey": "specification"},
        {"row": 5, "key": "efficacy", "label": "主打功效", "style": "contentLeft", "kind": "longtext", "maskKey": "efficacy"},
        {"row": 6, "key": "gifts", "label": "标配赠品配置", "style": "editableCenter", "kind": "gifts", "maskKey": "gifts"},
        {"row": 7, "key": "thresholdA", "label": "满赠档位配置", "style": "editableCenter", "kind": "tier", "maskKey": "threshold_a"},
        {"row": 8, "key": "memberGift", "label": "会员专享礼门槛", "style": "editableCenter", "kind": "text", "maskKey": "member_gift"},
        {"row": 9, "key": "memberValue", "label": "会员专享礼价值", "style": "editableCenter", "kind": "text", "maskKey": "member_value"},
        {"row": 10, "key": "sellingPoint", "label": "商品卖点", "style": "contentLeftShaded", "kind": "longtext", "maskKey": "selling_point"},
        {"row": 11, "key": "price", "label": "提报价格说明", "style": "editableCenter", "kind": "price", "maskKey": "price"},
        {"row": 12, "key": "dateRange", "label": "活动时间范围", "style": "editableCenter", "kind": "dateRange", "maskKey": "start_date"},
        {"row": 13, "key": "remarks", "label": "运营备注说明", "style": "editableCenter", "kind": "longtext", "maskKey": "remarks"},
    ],
    "validation": {
        "requiredSubmissionFields": ["name", "shop"],
        "priceFieldKey": "price",
        "dateRangeFieldKey": "dateRange",
    },
}

LIVE_STREAM_SCHEMA = {
    "templateType": "live_stream",
    "label": "直播提报",
    "rowsPerBlock": 15,
    "columnsPerBlock": 6,
    "fields": [
        {"row": 1, "key": "brand", "label": "品牌与标志", "style": "contentCenter", "kind": "text", "maskKey": "brand"},
        {"row": 2, "key": "nickname", "label": "产品昵称", "style": "editableCenter", "kind": "mention", "maskKey": "nickname"},
        {"row": 3, "key": "fullName", "label": "官方全称", "style": "contentLeft", "kind": "text", "maskKey": "full_name"},
        {"row": 4, "key": "spec", "label": "商品规格", "style": "contentCenter", "kind": "text", "maskKey": "specification"},
        {"row": 5, "key": "livestreamScript", "label": "主播/讲解话术", "style": "contentLeft", "kind": "longtext", "maskKey": "livestream_script"},
        {"row": 6, "key": "gifts", "label": "直播标配赠品", "style": "editableCenter", "kind": "gifts", "maskKey": "gifts"},
        {"row": 7, "key": "thresholdA", "label": "核心机制/买赠", "style": "editableCenter", "kind": "tier", "maskKey": "threshold_a"},
        {"row": 8, "key": "mechanismValue", "label": "机制价值计算", "style": "editableCenter", "kind": "text", "maskKey": "mechanism_value"},
        {"row": 9, "key": "couponStack", "label": "专享券/叠加优惠", "style": "editableCenter", "kind": "text", "maskKey": "coupon_stack"},
        {"row": 10, "key": "sellingPoint", "label": "讲解卖点", "style": "contentLeftShaded", "kind": "longtext", "maskKey": "selling_point"},
        {"row": 11, "key": "price", "label": "直播提报价", "style": "editableCenter", "kind": "price", "maskKey": "price"},
        {"row": 12, "key": "dateRange", "label": "计划上播时间", "style": "editableCenter", "kind": "dateRange", "maskKey": "start_date"},
        {"row": 13, "key": "remarks", "label": "直播备注说明", "style": "editableCenter", "kind": "longtext", "maskKey": "remarks"},
    ],
    "validation": {
        "requiredSubmissionFields": ["name", "shop"],
        "priceFieldKey": "price",
        "dateRangeFieldKey": "dateRange",
    },
}

DETAIL_PAGE_SCHEMA = {
    "templateType": "detail_page",
    "label": "详情页提报",
    "rowsPerBlock": 15,
    "columnsPerBlock": 6,
    "fields": [
        {"row": 1, "key": "brand", "label": "品牌与标志", "style": "contentCenter", "kind": "text", "maskKey": "brand"},
        {"row": 2, "key": "nickname", "label": "产品昵称", "style": "editableCenter", "kind": "mention", "maskKey": "nickname"},
        {"row": 3, "key": "fullName", "label": "官方全称", "style": "contentLeft", "kind": "text", "maskKey": "full_name"},
        {"row": 4, "key": "spec", "label": "商品规格", "style": "contentCenter", "kind": "text", "maskKey": "specification"},
        {"row": 5, "key": "pageClaim", "label": "主要宣称功效", "style": "contentLeft", "kind": "longtext", "maskKey": "page_claim"},
        {"row": 6, "key": "gifts", "label": "买即赠详情", "style": "editableCenter", "kind": "gifts", "maskKey": "gifts"},
        {"row": 7, "key": "thresholdA", "label": "满额赠配置", "style": "editableCenter", "kind": "tier", "maskKey": "threshold_a"},
        {"row": 8, "key": "memberGift", "label": "会员专享权益", "style": "editableCenter", "kind": "text", "maskKey": "member_gift"},
        {"row": 9, "key": "addonBenefit", "label": "加购引导利益点", "style": "editableCenter", "kind": "text", "maskKey": "addon_benefit"},
        {"row": 10, "key": "sellingPoint", "label": "核心视觉卖点", "style": "contentLeftShaded", "kind": "longtext", "maskKey": "selling_point"},
        {"row": 11, "key": "price", "label": "页面显示价格", "style": "editableCenter", "kind": "price", "maskKey": "price"},
        {"row": 12, "key": "dateRange", "label": "首发/起止日期", "style": "editableCenter", "kind": "dateRange", "maskKey": "start_date"},
        {"row": 13, "key": "remarks", "label": "视觉设计备注", "style": "editableCenter", "kind": "longtext", "maskKey": "remarks"},
    ],
    "validation": {
        "requiredSubmissionFields": ["name", "shop"],
        "priceFieldKey": "price",
        "dateRangeFieldKey": "dateRange",
    },
}

TEMPLATES: Dict[str, dict] = {
    "main_image": MAIN_IMAGE_SCHEMA,
    "live_stream": LIVE_STREAM_SCHEMA,
    "detail_page": DETAIL_PAGE_SCHEMA,
}

DEFAULT_TEMPLATE_TYPE = "main_image"


def get_schema(template_type: Optional[str] = None) -> dict:
    return TEMPLATES.get(template_type or DEFAULT_TEMPLATE_TYPE, TEMPLATES[DEFAULT_TEMPLATE_TYPE])


def get_rows_per_block(template_type: Optional[str] = None) -> int:
    return get_schema(template_type)["rowsPerBlock"]


def get_fields(template_type: Optional[str] = None) -> List[dict]:
    return get_schema(template_type)["fields"]


def get_field_by_row(template_type: str, row_in_block: int) -> Optional[dict]:
    for f in get_fields(template_type):
        if f["row"] == row_in_block:
            return f
    return None


def get_maskkey_to_row(template_type: str) -> Dict[str, int]:
    """遮罩键 -> 块内行偏移，供 LoadProductSpecView 遮罩使用。"""
    return {f["maskKey"]: f["row"] for f in get_fields(template_type) if f.get("maskKey")}
