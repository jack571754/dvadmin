from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from dvadmin.design_order.models import ProductSpecSubmission
from dvadmin.design_order.views import ProductSpecSubmissionViewSet


User = get_user_model()


PLATFORM_TEMPLATE_CODES = {
    "拼多多": "pdd_main_image",
    "抖音": "douyin_main_image",
    "唯品会": "vipshop_main_image",
    "小红书": "xiaohongshu_main_image",
    "中免日上": "zhongmian_main_image",
    "视频号": "shipinhao_main_image",
    "美团闪购": "meituan_flash_main_image",
    "招商银行": "cmb_main_image",
}


class ProductSpecSubmissionPlatformTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.superuser = User.objects.create(
            username="submission_admin",
            is_superuser=True,
            is_staff=True,
            is_active=True,
        )

    def call_view(self, method, path, action, data=None, pk=None):
        request = getattr(self.factory, method)(path, data=data, format="json")
        force_authenticate(request, user=self.superuser)
        kwargs = {"pk": pk} if pk is not None else {}
        return ProductSpecSubmissionViewSet.as_view(action)(request, **kwargs)

    def test_platform_defaults_to_jd_and_supports_filtering(self):
        ProductSpecSubmission.objects.create(name="京东提报", shop="京东店")
        ProductSpecSubmission.objects.create(
            name="天猫提报", shop="天猫店", platform="天猫"
        )

        response = self.call_view(
            "get",
            "/product_spec_submissions/?platform=京东",
            {"get": "list"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["data"][0]["platform"], "京东")

    def test_copy_preserves_submission_platform(self):
        source = ProductSpecSubmission.objects.create(
            name="京东主图提报",
            shop="巨子生物京东自营店",
            platform="京东",
        )

        response = self.call_view(
            "post",
            f"/product_spec_submissions/{source.id}/copy/",
            {"post": "copy"},
            {"name": "京东主图提报_复用", "shop": source.shop},
            source.id,
        )

        clone = ProductSpecSubmission.objects.get(id=response.data["data"]["id"])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(clone.platform, "京东")

    def test_create_assigns_the_platform_active_template(self):
        response = self.call_view(
            "post",
            "/product_spec_submissions/",
            {"post": "create"},
            {
                "name": "天猫主图提报",
                "shop": "天猫测试",
                "platform": "天猫",
            },
        )

        submission = ProductSpecSubmission.objects.get(
            id=response.data["data"]["id"]
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(submission.template_type, "tmall_main_image")

    def test_create_assigns_each_platform_active_template(self):
        for platform, template_code in PLATFORM_TEMPLATE_CODES.items():
            with self.subTest(platform=platform):
                response = self.call_view(
                    "post",
                    "/product_spec_submissions/",
                    {"post": "create"},
                    {
                        "name": f"{platform}主图提报",
                        "shop": f"{platform}测试店",
                        "platform": platform,
                    },
                )
                self.assertEqual(response.status_code, 200)
                self.assertIsNotNone(response.data["data"], response.data)
                submission = ProductSpecSubmission.objects.get(
                    id=response.data["data"]["id"],
                )
                self.assertEqual(submission.template_type, template_code)

    @patch("dvadmin.design_order.views._", side_effect=lambda message: f"translated:{message}")
    def test_update_translates_success_message(self, _translate):
        submission = ProductSpecSubmission.objects.create(
            name="待更新提报",
            shop="测试店铺",
            platform="京东",
            creator=self.superuser,
        )

        response = self.call_view(
            "put",
            f"/product_spec_submissions/{submission.id}/",
            {"put": "update"},
            {"name": "已更新提报", "shop": submission.shop, "platform": "京东"},
            submission.id,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["msg"], "translated:Update successful")
