from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from types import MappingProxyType
from typing import Iterable, Mapping

import MySQLdb
from django.db import transaction

from .source_database import SourceDatabaseConfig, connect_source_database
from .store_models import DesignOrderStore


SOURCE_QUERY = """
SELECT
    `店铺编号` AS store_code,
    `店铺名称` AS store_name,
    `品牌` AS brand,
    `平台` AS platform,
    `部门` AS department
FROM `jzsw_shop_number`
WHERE TRIM(COALESCE(`是否在营业`, '')) = '1'
"""
TEXT_LIMITS = MappingProxyType({
    "store_code": 64,
    "store_name": 200,
    "store_type": 50,
    "brand": 100,
    "platform": 100,
    "department": 100,
    "owner_name": 100,
})
BUSINESS_FIELDS = (
    "store_name",
    "store_type",
    "brand",
    "platform",
    "department",
    "owner_name",
    "status",
)
UPDATE_FIELDS = BUSINESS_FIELDS + ("update_datetime",)
DEFAULT_STORE_TYPE = "运营"
DEFAULT_OWNER_NAME = ""
DEFAULT_BATCH_SIZE = 500


@dataclass(frozen=True)
class StoreSyncResult:
    source_count: int
    created_count: int
    updated_count: int
    unchanged_count: int


def fetch_operating_stores(
    config: SourceDatabaseConfig,
) -> tuple[Mapping[str, object], ...]:
    connection = connect_source_database(config)
    try:
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(SOURCE_QUERY)
        return tuple(cursor.fetchall())
    finally:
        connection.close()


def sync_design_order_stores(
    source_rows: Iterable[Mapping[str, object]],
    *,
    dry_run: bool = False,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> StoreSyncResult:
    payloads = tuple(_build_payload(row) for row in source_rows)
    _validate_unique_codes(payloads)
    existing = DesignOrderStore.all_objects.in_bulk(field_name="store_code")
    to_create, to_update, unchanged_count = _partition_payloads(payloads, existing)
    if not dry_run:
        _persist_changes(to_create, to_update, batch_size)
    return StoreSyncResult(
        source_count=len(payloads),
        created_count=len(to_create),
        updated_count=len(to_update),
        unchanged_count=unchanged_count,
    )


def _build_payload(row: Mapping[str, object]) -> Mapping[str, object]:
    payload = {
        "store_code": _clean_text(row["store_code"]),
        "store_name": _clean_text(row["store_name"]),
        "store_type": DEFAULT_STORE_TYPE,
        "brand": _clean_text(row["brand"]),
        "platform": _clean_text(row["platform"]),
        "department": _clean_text(row["department"]),
        "owner_name": DEFAULT_OWNER_NAME,
        "status": True,
    }
    _validate_payload(payload)
    return MappingProxyType(payload)


def _partition_payloads(payloads, existing):
    to_create = []
    to_update = []
    unchanged_count = 0
    for payload in payloads:
        current = existing.get(payload["store_code"])
        if current is None:
            to_create.append(DesignOrderStore(**payload))
            continue
        if _has_changes(current, payload):
            to_update.append(
                DesignOrderStore(
                    id=current.id,
                    update_datetime=datetime.now(),
                    **payload,
                )
            )
            continue
        unchanged_count += 1
    return to_create, to_update, unchanged_count


def _persist_changes(to_create, to_update, batch_size):
    if batch_size < 1:
        raise ValueError("batch_size 必须大于 0")
    with transaction.atomic():
        DesignOrderStore.all_objects.bulk_create(
            to_create,
            batch_size=batch_size,
        )
        DesignOrderStore.all_objects.bulk_update(
            to_update,
            fields=UPDATE_FIELDS,
            batch_size=batch_size,
        )


def _has_changes(instance, payload):
    return any(
        getattr(instance, field) != payload[field]
        for field in BUSINESS_FIELDS
    )


def _validate_unique_codes(payloads):
    code_counts = Counter(payload["store_code"] for payload in payloads)
    duplicate_codes = sorted(
        code for code, count in code_counts.items() if count > 1
    )
    if duplicate_codes:
        raise ValueError(f"源表店铺编号重复: {', '.join(duplicate_codes[:10])}")


def _validate_payload(payload):
    required_fields = (
        "store_code",
        "store_name",
        "brand",
        "platform",
        "department",
    )
    missing = [field for field in required_fields if not payload[field]]
    if missing:
        raise ValueError(
            f"源店铺 {payload['store_code'] or '<空>'} 缺少字段: {', '.join(missing)}"
        )
    for field, limit in TEXT_LIMITS.items():
        if len(payload[field]) > limit:
            raise ValueError(
                f"源店铺 {payload['store_code']} 的 {field} 超过 {limit} 个字符"
            )


def _clean_text(value) -> str:
    return "" if value is None else str(value).strip()
