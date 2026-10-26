from decimal import Decimal

from django.test import TestCase

from dvadmin.design_order.models import ProductArchive
from dvadmin.design_order.product_archive_sync import sync_product_archive


def build_source_row(**overrides):
    row = {
        "product_code": "SKU-001",
        "product_name": "测试产品",
        "specification": "100ml",
        "unit": "瓶",
        "short_name": "测试简称",
        "brand": "测试品牌",
        "product_category": "-",
        "product_classification": "普通用途化妆品",
        "retail_price": 99.9,
        "nickname": "测试昵称",
        "series": "测试系列",
        "category": "面部护理",
        "product_type": "小样/引流品/赠品",
        "product_status": "消耗完下架",
        "box_spec": "24瓶/箱",
        "sale_status": "新品",
        "auxiliary": 1,
        "need_maintenance": "是",
        "source_create_date": "2025-08-15",
        "source_write_date": "2026-07-16",
    }
    return {**row, **overrides}


class ProductArchiveSyncTests(TestCase):
    def test_sync_creates_and_normalizes_source_product(self):
        result = sync_product_archive((build_source_row(),))

        product = ProductArchive.objects.get(product_code="SKU-001")
        self.assertEqual(result.created_count, 1)
        self.assertEqual(product.retail_price, Decimal("99.90"))
        self.assertEqual(product.regulatory_category, ProductArchive.CATEGORY_COSMETIC)
        self.assertEqual(product.product_type, "sample")
        self.assertEqual(product.product_status, "off_sale")
        self.assertEqual(product.sale_status, "new")
        self.assertTrue(product.need_maintenance)
        self.assertEqual(product.auxiliary, "1")
        self.assertEqual(product.create_datetime.date().isoformat(), "2025-08-15")
        self.assertEqual(product.update_datetime.date().isoformat(), "2026-07-16")

    def test_sync_updates_existing_product_and_keeps_target_only_product(self):
        ProductArchive.objects.create(
            product_code="SKU-001",
            product_name="旧名称",
        )
        ProductArchive.objects.create(
            product_code="LOCAL-001",
            product_name="本地产品",
        )

        result = sync_product_archive((build_source_row(product_name="新名称"),))

        self.assertEqual(result.updated_count, 1)
        self.assertEqual(
            ProductArchive.objects.get(product_code="SKU-001").product_name,
            "新名称",
        )
        self.assertTrue(ProductArchive.objects.filter(product_code="LOCAL-001").exists())

    def test_second_sync_is_idempotent(self):
        source_rows = (build_source_row(),)
        sync_product_archive(source_rows)

        result = sync_product_archive(source_rows)

        self.assertEqual(result.created_count, 0)
        self.assertEqual(result.updated_count, 0)
        self.assertEqual(result.unchanged_count, 1)

    def test_sync_infers_medical_device_category(self):
        source_row = build_source_row(product_classification="二类医疗器械")

        sync_product_archive((source_row,))

        product = ProductArchive.objects.get(product_code="SKU-001")
        self.assertEqual(
            product.regulatory_category,
            ProductArchive.CATEGORY_MEDICAL_DEVICE,
        )

    def test_placeholder_create_date_is_null(self):
        source_rows = (build_source_row(source_create_date="-"),)

        sync_product_archive(source_rows)

        product = ProductArchive.objects.get(product_code="SKU-001")
        self.assertIsNone(product.create_datetime)

    def test_dry_run_does_not_write(self):
        result = sync_product_archive((build_source_row(),), dry_run=True)

        self.assertEqual(result.created_count, 1)
        self.assertFalse(ProductArchive.objects.filter(product_code="SKU-001").exists())
