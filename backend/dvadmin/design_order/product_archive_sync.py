from collections import Counter
from dataclasses import dataclass
from datetime import datetime, time
from decimal import Decimal
from types import MappingProxyType
from typing import Iterable, Mapping

import MySQLdb
from django.db import transaction
from django.utils.dateparse import parse_date

from .models import ProductArchive
from .source_database import SourceDatabaseConfig, connect_source_database

SOURCE_QUERY = """
SELECT
    `货品编号` AS product_code,
    `货品名称` AS product_name,
    `型号规格/净含量（包装规格）` AS specification,
    `基本单位` AS unit,
    `货品简称` AS short_name,
    `品牌` AS brand,
    `产品类目` AS product_category,
    `产品分类` AS product_classification,
    `零售价` AS retail_price,
    `昵称` AS nickname,
    `系列` AS series,
    `类目` AS category,
    `正品/小样` AS product_type,
    `商品状态` AS product_status,
    `箱规` AS box_spec,
    `在售/新品` AS sale_status,
    `辅助` AS auxiliary,
    `是否需要维护` AS need_maintenance,
    `创建时间` AS source_create_date,
    `写入日期` AS source_write_date
FROM `jzsw_product_cmr`
"""
TEXT_LIMITS = MappingProxyType({
    "product_code": 64,
    "product_name": 200,
    "specification": 200,
    "unit": 20,
    "short_name": 100,
    "brand": 100,
    "product_category": 100,
    "product_classification": 100,
    "nickname": 100,
    "series": 100,
    "category": 100,
    "box_spec": 100,
    "auxiliary": 200,
})
SYNC_FIELDS = (
    "product_name",
    "specification",
    "unit",
    "short_name",
    "brand",
    "product_category",
    "product_classification",
    "retail_price",
    "nickname",
    "series",
    "category",
    "product_type",
    "product_status",
    "box_spec",
    "sale_status",
    "auxiliary",
    "need_maintenance",
    "create_datetime",
    "update_datetime",
)
SAMPLE_PRODUCT_TYPES = frozenset({"小样", "小样/引流品/赠品"})
OFF_SALE_STATUSES = frozenset({"下架", "消耗完下架"})
PENDING_STATUSES = frozenset({"新品"})
TRUE_VALUES = frozenset({"是", "true", "1", "yes"})
PRICE_QUANTUM = Decimal("0.01")
DEFAULT_BATCH_SIZE = 500


@dataclass(frozen=True)
class SyncResult:
    source_count: int
    created_count: int
    updated_count: int
    unchanged_count: int


def fetch_source_products(config: SourceDatabaseConfig) -> tuple[Mapping[str, object], ...]:
    connection = connect_source_database(config)
    try:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(SOURCE_QUERY)
        return tuple(cursor.fetchall())
    finally:
        connection.close()


def sync_product_archive(
    source_rows: Iterable[Mapping[str, object]],
    *,
    dry_run: bool = False,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> SyncResult:
    payloads = tuple(_build_payload(row) for row in source_rows)
    _validate_unique_codes(payloads)
    existing = ProductArchive.all_objects.in_bulk(field_name="product_code")
    to_create, to_update, unchanged_count = _partition_payloads(payloads, existing)
    if not dry_run:
        _persist_changes(to_create, to_update, batch_size)
    return SyncResult(
        source_count=len(payloads),
        created_count=len(to_create),
        updated_count=len(to_update),
        unchanged_count=unchanged_count,
    )


def _build_payload(row: Mapping[str, object]) -> Mapping[str, object]:
    product_classification = _clean_text(row["product_classification"])
    payload = {
        "product_code": _clean_text(row["product_code"]),
        "product_name": _clean_text(row["product_name"]),
        "specification": _clean_text(row["specification"]),
        "unit": _clean_text(row["unit"]),
        "short_name": _clean_text(row["short_name"]),
        "brand": _clean_text(row["brand"]),
        "regulatory_category": _infer_regulatory_category(product_classification),
        "product_category": _clean_text(row["product_category"]),
        "product_classification": product_classification,
        "retail_price": _normalize_price(row["retail_price"]),
        "nickname": _clean_text(row["nickname"]),
        "series": _clean_text(row["series"]),
        "category": _clean_text(row["category"]),
        "product_type": _normalize_product_type(row["product_type"]),
        "product_status": _normalize_product_status(row["product_status"]),
        "box_spec": _clean_text(row["box_spec"]),
        "sale_status": _normalize_sale_status(row["sale_status"]),
        "auxiliary": _clean_text(row["auxiliary"]),
        "need_maintenance": _normalize_boolean(row["need_maintenance"]),
        "create_datetime": _normalize_date(row["source_create_date"]),
        "update_datetime": _normalize_date(row["source_write_date"]),
    }
    _validate_payload(payload)
    return MappingProxyType(payload)


def _partition_payloads(payloads, existing):
    to_create = []
    to_update = []
    unchanged_count = 0
    for payload in payloads:
        current = existing.get(payload["product_code"])
        if current is None:
            to_create.append(ProductArchive(**payload))
            continue
        if _has_changes(current, payload):
            to_update.append(ProductArchive(id=current.id, **payload))
            continue
        unchanged_count += 1
    return to_create, to_update, unchanged_count


def _persist_changes(to_create, to_update, batch_size):
    if batch_size < 1:
        raise ValueError("batch_size 必须大于 0")
    with transaction.atomic():
        source_dates = {
            instance.product_code: (
                instance.create_datetime,
                instance.update_datetime,
            )
            for instance in to_create
        }
        ProductArchive.all_objects.bulk_create(to_create, batch_size=batch_size)
        created_products = ProductArchive.all_objects.in_bulk(
            source_dates,
            field_name="product_code",
        )
        created_date_updates = [
            ProductArchive(
                id=created_products[product_code].id,
                create_datetime=dates[0],
                update_datetime=dates[1],
            )
            for product_code, dates in source_dates.items()
        ]
        ProductArchive.all_objects.bulk_update(
            created_date_updates,
            fields=("create_datetime", "update_datetime"),
            batch_size=batch_size,
        )
        ProductArchive.all_objects.bulk_update(
            to_update,
            fields=SYNC_FIELDS,
            batch_size=batch_size,
        )


def _has_changes(instance, payload):
    return any(getattr(instance, field) != payload[field] for field in SYNC_FIELDS)


def _validate_unique_codes(payloads):
    code_counts = Counter(payload["product_code"] for payload in payloads)
    duplicate_codes = sorted(
        code for code, count in code_counts.items() if count > 1
    )
    if duplicate_codes:
        raise ValueError(f"源表货品编号重复: {', '.join(duplicate_codes[:10])}")


def _validate_payload(payload):
    if not payload["product_code"]:
        raise ValueError("源表存在空货品编号")
    if not payload["product_name"]:
        raise ValueError(f"货品 {payload['product_code']} 的货品名称为空")
    for field, limit in TEXT_LIMITS.items():
        if len(payload[field]) > limit:
            raise ValueError(
                f"货品 {payload['product_code']} 的 {field} 超过 {limit} 个字符"
            )


def _clean_text(value) -> str:
    return "" if value is None else str(value).strip()


def _normalize_price(value):
    if value is None or _clean_text(value) == "":
        return None
    return Decimal(str(value)).quantize(PRICE_QUANTUM)


def _normalize_product_type(value) -> str:
    return "sample" if _clean_text(value) in SAMPLE_PRODUCT_TYPES else "authentic"


def _normalize_product_status(value) -> str:
    status = _clean_text(value)
    if status in OFF_SALE_STATUSES:
        return "off_sale"
    if status in PENDING_STATUSES:
        return "pending"
    return "on_sale"


def _normalize_sale_status(value) -> str:
    return "new" if _clean_text(value) == "新品" else "on_sale"


def _normalize_boolean(value) -> bool:
    return _clean_text(value).lower() in TRUE_VALUES


def _infer_regulatory_category(product_classification: str) -> str:
    if "医疗器械" in product_classification or "械字号" in product_classification:
        return ProductArchive.CATEGORY_MEDICAL_DEVICE
    if "化妆品" in product_classification or "妆字号" in product_classification:
        return ProductArchive.CATEGORY_COSMETIC
    return ""


def _normalize_date(value):
    text_value = _clean_text(value)
    if text_value in {"", "-"}:
        return None
    parsed_date = parse_date(text_value)
    if parsed_date is None:
        raise ValueError(f"无法解析源日期: {text_value}")
    return datetime.combine(parsed_date, time.min)
