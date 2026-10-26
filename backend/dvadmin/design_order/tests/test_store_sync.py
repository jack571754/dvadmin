from django.test import TestCase

from dvadmin.design_order.store_models import DesignOrderStore
from dvadmin.design_order.store_sync import sync_design_order_stores


def build_source_store(**overrides):
    row = {
        "store_code": "6001",
        "store_name": "可丽金护肤旗舰店",
        "brand": "可丽金",
        "platform": "抖音",
        "department": "电商二部",
    }
    return {**row, **overrides}


class StoreSyncTests(TestCase):
    def test_sync_creates_operating_store_with_explicit_defaults(self):
        result = sync_design_order_stores((build_source_store(),))

        store = DesignOrderStore.objects.get(store_code="6001")
        self.assertEqual(result.created_count, 1)
        self.assertEqual(store.store_name, "可丽金护肤旗舰店")
        self.assertEqual(store.store_type, "运营")
        self.assertEqual(store.owner_name, "")
        self.assertTrue(store.status)

    def test_sync_updates_existing_store_and_preserves_target_only_store(self):
        DesignOrderStore.objects.create(
            store_code="6001",
            store_name="旧名称",
            store_type="达播",
            brand="可丽金",
            platform="抖音",
            department="旧部门",
            owner_name="旧负责人",
            status=False,
        )
        DesignOrderStore.objects.create(
            store_code="LOCAL-001",
            store_name="本地店铺",
            store_type="运营",
            brand="可复美",
            platform="天猫",
            department="电商一部",
            owner_name="",
            status=True,
        )

        result = sync_design_order_stores((build_source_store(),))

        store = DesignOrderStore.objects.get(store_code="6001")
        self.assertEqual(result.updated_count, 1)
        self.assertEqual(store.store_name, "可丽金护肤旗舰店")
        self.assertEqual(store.department, "电商二部")
        self.assertEqual(store.owner_name, "")
        self.assertTrue(store.status)
        self.assertTrue(
            DesignOrderStore.objects.filter(store_code="LOCAL-001").exists()
        )

    def test_second_sync_is_idempotent(self):
        source_rows = (build_source_store(),)
        sync_design_order_stores(source_rows)

        result = sync_design_order_stores(source_rows)

        self.assertEqual(result.created_count, 0)
        self.assertEqual(result.updated_count, 0)
        self.assertEqual(result.unchanged_count, 1)

    def test_dry_run_does_not_write(self):
        result = sync_design_order_stores(
            (build_source_store(),),
            dry_run=True,
        )

        self.assertEqual(result.created_count, 1)
        self.assertFalse(
            DesignOrderStore.objects.filter(store_code="6001").exists()
        )
