import re
from collections import OrderedDict

from django.db import transaction
from django.db.models import F, Q

from .icon_models import IconDefinition, IconProductRelation
from .icon_storage import build_icon_file_url_map
from .models import ProductArchive

MAX_BATCH_PRODUCTS = 500
SPLIT_PATTERN = re.compile(r"[\s,，、;；]+")


class IconProductError(ValueError):
    def __init__(self, message: str, details=None):
        super().__init__(message)
        self.details = details or {}


def normalize_product_codes(value) -> tuple[list[str], list[str]]:
    raw_items = SPLIT_PATTERN.split(value) if isinstance(value, str) else value
    if isinstance(raw_items, tuple):
        raw_items = list(raw_items)
    if not isinstance(raw_items, list):
        raise IconProductError("商品编码必须是数组或文本")
    cleaned = [str(item).strip() for item in raw_items if str(item).strip()]
    if len(cleaned) > MAX_BATCH_PRODUCTS:
        raise IconProductError(f"商品编码最多支持 {MAX_BATCH_PRODUCTS} 条")
    unique = list(OrderedDict.fromkeys(cleaned))
    duplicates = list(OrderedDict.fromkeys(code for code in cleaned if cleaned.count(code) > 1))
    return unique, duplicates


def _load_products_by_code(codes: list[str]) -> dict[str, ProductArchive]:
    return {
        product.product_code: product
        for product in ProductArchive.objects.filter(product_code__in=codes)
    }


def _classify_product_codes(codes, products_by_code, brand):
    missing = [code for code in codes if code not in products_by_code]
    brand_mismatches = [
        code
        for code in codes
        if code in products_by_code and products_by_code[code].brand != brand
    ]
    return missing, brand_mismatches


def _product_validation_item(code, product, brand) -> dict:
    if not product:
        return {"product_code": code, "status": "missing"}
    status = "valid" if product.brand == brand else "brand_mismatch"
    return {
        "id": product.id,
        "product_code": code,
        "product_name": product.product_name,
        "nickname": product.nickname,
        "brand": product.brand,
        "series": product.series,
        "specification": product.specification,
        "status": status,
    }


def inspect_product_codes(value, brand: str) -> dict:
    normalized_brand = str(brand).strip()
    if not normalized_brand:
        raise IconProductError("请先选择品牌")
    codes, duplicates = normalize_product_codes(value)
    if not codes:
        raise IconProductError("请填写至少一个商品编码")
    products_by_code = _load_products_by_code(codes)
    missing, brand_mismatches = _classify_product_codes(
        codes, products_by_code, normalized_brand
    )
    invalid_codes = set(missing + brand_mismatches)
    return {
        "items": [
            _product_validation_item(code, products_by_code.get(code), normalized_brand)
            for code in codes
        ],
        "valid_codes": [code for code in codes if code not in invalid_codes],
        "missing": missing,
        "brand_mismatches": brand_mismatches,
        "duplicates": duplicates,
    }


def validate_products(icon: IconDefinition, codes: list[str]) -> list[ProductArchive]:
    products_by_code = _load_products_by_code(codes)
    missing, brand_mismatches = _classify_product_codes(
        codes, products_by_code, icon.brand
    )
    if missing or brand_mismatches:
        details = {"missing": missing, "brand_mismatches": brand_mismatches}
        message = "商品不存在" if missing and not brand_mismatches else "商品编码校验失败"
        raise IconProductError(message, details)
    return [products_by_code[code] for code in codes]


@transaction.atomic
def replace_icon_products(icon: IconDefinition, value) -> dict:
    codes, duplicates = normalize_product_codes(value)
    if icon.scope_type == IconDefinition.SCOPE_ALL:
        icon.product_relations.all().delete()
        return {"added": [], "duplicates": duplicates}
    if not codes:
        raise IconProductError("指定商品范围至少需要一个商品编码")
    products = validate_products(icon, codes)
    icon.product_relations.all().delete()
    IconProductRelation.objects.bulk_create([
        IconProductRelation(icon=icon, product=item) for item in products
    ])
    return {"added": codes, "duplicates": duplicates}


@transaction.atomic
def add_icon_products(icon: IconDefinition, value) -> dict:
    _require_selected_scope(icon)
    codes, duplicates = normalize_product_codes(value)
    if not codes:
        raise IconProductError("请填写至少一个商品编码")
    products = validate_products(icon, codes)
    existing = set(icon.product_relations.filter(
        product__product_code__in=codes
    ).values_list("product__product_code", flat=True))
    additions = [product for product in products if product.product_code not in existing]
    IconProductRelation.objects.bulk_create([
        IconProductRelation(icon=icon, product=item) for item in additions
    ])
    return {
        "added": [item.product_code for item in additions],
        "existing": [code for code in codes if code in existing],
        "duplicates": duplicates,
    }


@transaction.atomic
def remove_icon_products(icon: IconDefinition, value) -> dict:
    _require_selected_scope(icon)
    codes, duplicates = normalize_product_codes(value)
    current_codes = set(icon.product_relations.values_list("product__product_code", flat=True))
    removable = [code for code in codes if code in current_codes]
    if not removable:
        raise IconProductError("没有可移出的关联商品")
    if len(removable) == len(current_codes):
        raise IconProductError("部分适用至少需要保留一个关联商品")
    icon.product_relations.filter(product__product_code__in=removable).delete()
    return {
        "removed": removable,
        "not_related": [code for code in codes if code not in current_codes],
        "duplicates": duplicates,
    }


def _require_selected_scope(icon: IconDefinition) -> None:
    if icon.scope_type != IconDefinition.SCOPE_SELECTED:
        raise IconProductError("品牌全部商品范围不支持单独维护商品")


def _first_image_file_id(images) -> int | None:
    """取 Icon 的封面图（第一张）文件 ID。images 列存的是 [{file_id, sort}]，不含直链。"""
    if not isinstance(images, list):
        return None
    for item in images:
        if isinstance(item, dict) and item.get("file_id"):
            try:
                return int(item["file_id"])
            except (TypeError, ValueError):
                return None
    return None


def _build_icon_payload(icon: dict, scope_type: str, url_map: dict) -> dict:
    file_id = _first_image_file_id(icon.get("images"))
    return {
        "id": icon["id"],
        "short_name": icon["short_name"],
        "interpretation": icon["interpretation"],
        "scope_type": scope_type,
        "default_image": (
            {"file_id": file_id, "url": url_map[file_id]}
            if file_id and file_id in url_map
            else None
        ),
    }

def resolve_icons_by_products(product_codes) -> list[dict]:
    """
    批量解析商品的 Icon，优化性能：
    1. 一次查询所有商品
    2. 一次查询所有品牌全部商品的 Icon
    3. 一次查询所有指定商品的 Icon
    4. 一次批量生成封面图直链
    5. 内存中组装结果，避免 N+1 查询
    """
    codes, _ = normalize_product_codes(product_codes)
    if not codes:
        return []

    # 1. 查询所有商品，按 product_code 建立索引
    products = {
        item.product_code: item
        for item in ProductArchive.objects.filter(product_code__in=codes)
    }

    if not products:
        return [{"product_code": code, "icons": []} for code in codes]

    # 2. 按品牌分组商品
    brands = {product.brand for product in products.values()}

    # 3. 查询所有"品牌全部商品"范围的 Icon
    brand_icons = list(
        IconDefinition.objects.filter(
            status=IconDefinition.STATUS_ENABLED,
            scope_type=IconDefinition.SCOPE_ALL,
            brand__in=brands
        ).values("id", "short_name", "interpretation", "images", "brand")
    )

    # 4. 查询所有"指定商品"范围的 Icon（预加载关联关系）
    selected_icons = list(
        IconDefinition.objects.filter(
            status=IconDefinition.STATUS_ENABLED,
            scope_type=IconDefinition.SCOPE_SELECTED,
            product_relations__product__product_code__in=codes,
            brand=F("product_relations__product__brand"),
            brand__in=brands
        ).prefetch_related("product_relations__product")
        .values("id", "short_name", "interpretation", "images", "product_relations__product__product_code")
    )

    # 5. 构建 Icon 到商品的映射
    icon_to_products = {}
    for item in selected_icons:
        icon_id = item["id"]
        product_code = item["product_relations__product__product_code"]
        if icon_id not in icon_to_products:
            icon_to_products[icon_id] = {
                "id": icon_id,
                "short_name": item["short_name"],
                "interpretation": item["interpretation"],
                "images": item["images"],
                "product_codes": []
            }
        icon_to_products[icon_id]["product_codes"].append(product_code)

    # 6. 一次性生成所有封面图直链；对象存储不可用时降级为无图，不阻断提报页
    cover_file_ids = [
        file_id
        for item in [*brand_icons, *icon_to_products.values()]
        if (file_id := _first_image_file_id(item.get("images")))
    ]
    try:
        url_map = build_icon_file_url_map(cover_file_ids)
    except Exception:
        url_map = {}

    # 7. 同一个 Icon 可能命中多个商品，载荷只组装一次后复用
    brand_payloads = {
        icon["id"]: _build_icon_payload(icon, IconDefinition.SCOPE_ALL, url_map)
        for icon in brand_icons
    }
    selected_payloads = {
        icon["id"]: _build_icon_payload(icon, IconDefinition.SCOPE_SELECTED, url_map)
        for icon in icon_to_products.values()
    }

    # 8. 按商品组装结果
    result = []
    for code in codes:
        product = products.get(code)
        if not product:
            result.append({"product_code": code, "icons": []})
            continue

        icons = []

        # 添加品牌全部商品的 Icon
        for icon in brand_icons:
            if icon["brand"] == product.brand:
                icons.append(brand_payloads[icon["id"]])

        # 添加指定商品的 Icon
        for icon in icon_to_products.values():
            if code in icon["product_codes"]:
                icons.append(selected_payloads[icon["id"]])

        # 按 ID 排序（保证顺序稳定）
        icons.sort(key=lambda x: x["id"])

        result.append({"product_code": code, "icons": icons})

    return result
