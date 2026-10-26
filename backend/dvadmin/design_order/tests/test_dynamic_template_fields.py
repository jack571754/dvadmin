from dvadmin.design_order.models import ProductSpecSubmission
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from dvadmin.design_order.models import ProductArchive, ProductSpec
from dvadmin.design_order.views import (
    LoadProductSpecView,
    ProductArchiveViewSet,
    SaveProductSpecView,
)
from dvadmin.system.models import Role


class DynamicTemplateFieldTests(TestCase):
    def setUp(self):
        Role.objects.get_or_create(
            name="管理员",
            defaults={"key": "admin", "sort": 1, "status": True},
        )
        self.user = get_user_model().objects.create_superuser(
            username="dynamic_admin",
            password="p",
            mobile="13800000001",
        )
        self.factory = APIRequestFactory()

    def test_save_reads_dynamic_fields_from_spec_data(self):
        product = {
            "cardIndex": 0,
            "nickname": "测试产品",
            "brand": "测试品牌",
            "fullName": "测试产品全称",
            "spec": "100ml",
            "price": "99",
            "startDate": "2026-07-01 00:00",
            "endDate": "2026-07-31 00:00",
            "specData": {
                "icon": "主图角标",
                "remark": "重点标注",
            },
        }
        request = self.factory.post(
            "/save_spec/",
            {
                "name": "动态字段提报",
                "shop": "京东测试店",
                "platform": "京东",
                "status": "draft",
                "templateType": "main_image",
                "formCount": 1,
                "products": [product],
                "snapshot": None,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        response = SaveProductSpecView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        spec = ProductSpec.objects.get(submission_id=response.data["data"]["id"])
        self.assertEqual(spec.spec_data["icon"], "主图角标")
        self.assertEqual(spec.spec_data["remark"], "重点标注")

    def test_save_persists_structured_gift_strategies(self):
        strategies = [{
            "name": "直播间下单加赠",
            "value": "价值待同步",
            "items": [{
                "nickname": "舒舒贴",
                "brand": "可复美",
                "spec": "2片",
                "qty": 1,
                "unit": "份",
                "retailPrice": "待同步",
            }],
        }]
        product = {
            "cardIndex": 0,
            "nickname": "测试产品",
            "brand": "测试品牌",
            "fullName": "测试产品全称",
            "price": "99",
            "startDate": "2026-07-01 00:00",
            "endDate": "2026-07-31 00:00",
            "gifts": [{"name": "舒舒贴", "qty": "1份"}],
            "specData": {"gifts": strategies},
        }
        request = self.factory.post(
            "/save_spec/",
            {
                "name": "赠品策略提报",
                "shop": "京东测试店",
                "platform": "京东",
                "status": "draft",
                "templateType": "main_image",
                "formCount": 1,
                "products": [product],
                "snapshot": None,
            },
            format="json",
        )
        force_authenticate(request, user=self.user)

        response = SaveProductSpecView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        spec = ProductSpec.objects.get(submission_id=response.data["data"]["id"])
        self.assertEqual(spec.spec_data["gifts"], strategies)
        self.assertEqual(spec.gifts, "🎁 舒舒贴 x 1份")

    def test_product_dictionary_exposes_gift_metadata(self):
        ProductArchive.objects.create(
            product_code="GIFT-001",
            product_name="测试赠品",
            nickname="赠品昵称",
            short_name="赠品简称",
            specification="2片",
            unit="盒",
            retail_price="29.90",
        )
        request = self.factory.get("/product_archives/dict/")
        force_authenticate(request, user=self.user)

        response = ProductArchiveViewSet.as_view({"get": "dict"})(request)

        self.assertEqual(response.status_code, 200)
        gift = next(item for item in response.data["data"] if item["product_code"] == "GIFT-001")
        self.assertEqual(gift["unit"], "盒")
        self.assertEqual(gift["short_name"], "赠品简称")
        self.assertEqual(str(gift["retail_price"]), "29.90")

    def test_product_dictionary_exposes_efficacy_scope(self):
        ProductArchive.objects.create(
            product_code="EFFICACY-001",
            product_name="功效辅助测试产品",
            nickname="功效辅助产品",
            efficacy_scope="帮助改善肌肤屏障状态。",
        )
        request = self.factory.get("/product_archives/dict/")
        force_authenticate(request, user=self.user)

        response = ProductArchiveViewSet.as_view({"get": "dict"})(request)

        product = next(
            item for item in response.data["data"]
            if item["product_code"] == "EFFICACY-001"
        )
        self.assertEqual(product["efficacy_scope"], "帮助改善肌肤屏障状态。")

    def test_load_returns_structured_gift_strategies(self):
        strategies = [{
            "name": "下单赠",
            "items": [{
                "productCode": "GIFT-001",
                "nickname": "赠品昵称",
                "retailPrice": "29.90",
                "qty": 1,
            }],
        }]
        save_request = self.factory.post(
            "/save_spec/",
            {
                "name": "结构化赠品回显",
                "platform": "京东",
                "products": [{
                    "cardIndex": 0,
                    "nickname": "测试产品",
                    "specData": {"gifts": strategies},
                }],
            },
            format="json",
        )
        force_authenticate(save_request, user=self.user)
        save_response = SaveProductSpecView.as_view()(save_request)
        submission_id = save_response.data["data"]["id"]
        load_request = self.factory.get("/load_spec/", {"id": submission_id})
        force_authenticate(load_request, user=self.user)

        response = LoadProductSpecView.as_view()(load_request)

        self.assertEqual(
            response.data["data"]["productGiftStrategies"],
            [{"cardIndex": 0, "giftStrategies": strategies}],
        )

    def test_load_returns_structured_efficacy_items(self):
        efficacy_items = [
            {"id": "efficacy-1", "name": "屏障修护", "definition": "帮助改善肌肤屏障状态"},
            {"id": "efficacy-2", "name": "补水保湿", "definition": "提升肌肤水润度"},
        ]
        save_request = self.factory.post(
            "/save_spec/",
            {
                "name": "结构化功效回显",
                "platform": "京东",
                "products": [{
                    "cardIndex": 0,
                    "nickname": "测试产品",
                    "efficacy": "屏障修护[1]\n补水保湿[2]",
                    "specData": {"efficacyItems": efficacy_items},
                }],
            },
            format="json",
        )
        force_authenticate(save_request, user=self.user)
        save_response = SaveProductSpecView.as_view()(save_request)
        submission_id = save_response.data["data"]["id"]
        load_request = self.factory.get("/load_spec/", {"id": submission_id})
        force_authenticate(load_request, user=self.user)

        response = LoadProductSpecView.as_view()(load_request)

        self.assertEqual(
            response.data["data"]["productEfficacyItems"],
            [{"cardIndex": 0, "efficacyItems": efficacy_items}],
        )

    def test_masked_efficacy_save_preserves_structured_items(self):
        efficacy_items = [
            {"id": "efficacy-1", "name": "屏障修护", "definition": "帮助改善肌肤屏障状态"},
        ]
        submission = ProductSpecSubmission.objects.create(
            name="字段权限功效保留",
            platform="京东",
            status="draft",
            creator=self.user,
        )
        ProductSpec.objects.create(
            submission=submission,
            card_index=0,
            nickname="测试产品",
            efficacy="屏障修护[1]",
            spec_data={"efficacy": "屏障修护[1]", "efficacyItems": efficacy_items},
        )
        save_request = self.factory.post(
            "/save_spec/",
            {
                "id": submission.id,
                "name": submission.name,
                "platform": "京东",
                "products": [{
                    "cardIndex": 0,
                    "nickname": "测试产品",
                    "efficacy": "***",
                    "specData": {"efficacy": "***", "efficacyItems": []},
                }],
            },
            format="json",
        )
        force_authenticate(save_request, user=self.user)

        SaveProductSpecView.as_view()(save_request)

        saved_spec = ProductSpec.objects.get(submission=submission, card_index=0)
        self.assertEqual(saved_spec.spec_data["efficacyItems"], efficacy_items)
