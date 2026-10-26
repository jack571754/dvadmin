"""Integration boundaries for restoring the business app inside the current framework."""
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from dvadmin.system.models import Dictionary, Menu, Role, RoleMenuButtonPermission, Users
from dvadmin.design_order.icon_storage import get_storage_config
from dvadmin.design_order.models import ProductArchive, ProductSpecShare, ProductSpecSubmission
from dvadmin.design_order.source_database import SourceDatabaseConfig


class RestoredApplicationTests(TestCase):
    def setUp(self):
        self.admin = Users.objects.create(username="restoration-admin", is_superuser=True, is_active=True)
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        Menu.objects.create(name="用户", component="system/user/index")
        call_command("seed_design_order_support", verbosity=0)

    def test_registered_list_apis_keep_existing_product(self):
        product = ProductArchive.objects.create(product_code="RESTORE-001", product_name="既有产品")
        for resource in ("product_archives", "stores", "product_spec_submissions", "product_specs", "spec_templates", "icons"):
            with self.subTest(resource=resource):
                response = self.client.get(f"/api/design_order/{resource}/")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["code"], 2000)
        self.assertTrue(ProductArchive.objects.filter(pk=product.pk, product_name="既有产品").exists())

    def test_support_seed_preserves_custom_values_and_grants_no_roles(self):
        parent = Dictionary.objects.get(value="design_order_store_platform", parent=None)
        parent.label = "自定义平台标签"
        parent.save()
        custom = Dictionary.objects.create(parent=parent, label="自有平台", value="自有平台", is_value=True)
        Role.objects.create(name="普通角色", key="restore-reader")
        before = RoleMenuButtonPermission.objects.count()
        call_command("seed_design_order_support", verbosity=0)
        parent.refresh_from_db()
        self.assertEqual(parent.label, "自定义平台标签")
        self.assertTrue(Dictionary.objects.filter(pk=custom.pk).exists())
        self.assertEqual(RoleMenuButtonPermission.objects.count(), before)

    def test_share_read_is_anonymous_but_create_stays_protected(self):
        client = APIClient()
        response = client.get("/api/design_order/product_spec_shares/unknown-code/")
        self.assertNotIn(response.status_code, (401, 403))
        response = client.post("/api/design_order/product_spec_shares/", {}, format="json")
        self.assertIn(response.data["code"], (401, 4000, 4001))
        self.assertEqual(response.data["msg"].code, "not_authenticated")

    def test_anonymous_share_preserves_snapshot_and_respects_disabled_link(self):
        snapshot = {"sheets": {"sheet1": {"cellData": {"2": {"1": {"v": "历史产品"}}}}}}
        submission = ProductSpecSubmission.objects.create(name="历史提报", creator=self.admin, snapshot_data=snapshot)
        share = ProductSpecShare.objects.create(submission=submission)
        client = APIClient()
        response = client.get(f"/api/design_order/product_spec_shares/{share.share_code}/")
        self.assertEqual(response.data["code"], 2000)
        self.assertEqual(response.data["data"]["snapshot"], snapshot)
        share.enabled = False
        share.save()
        response = client.get(f"/api/design_order/product_spec_shares/{share.share_code}/")
        self.assertNotEqual(response.data["code"], 2000)
        self.assertIn("停用", response.data["msg"])

    @override_settings(ICON_MINIO_ENDPOINT_URL="", ICON_MINIO_ACCESS_KEY="", ICON_MINIO_SECRET_KEY="", ICON_MINIO_BUCKET_NAME="")
    def test_unconfigured_external_services_fail_explicitly(self):
        with self.assertRaisesRegex(RuntimeError, "MinIO 配置不完整"):
            get_storage_config()
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaisesRegex(ValueError, "缺少源数据库环境变量"):
                SourceDatabaseConfig.from_environment()
