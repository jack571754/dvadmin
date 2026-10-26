from django.test import TestCase

from dvadmin.design_order.template_models import ProductSpecTemplate
from dvadmin.design_order.template_serializers import ProductSpecTemplateSerializer
from dvadmin.design_order.template_service import get_schema


EXPECTED_PLATFORM_TEMPLATES = {
    "拼多多": (
        "pdd_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "thresholdA", "sellingPoint", "icon", "remarks"],
    ),
    "抖音": (
        "douyin_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "sellingPoint", "price", "icon", "remark", "remarks"],
    ),
    "唯品会": (
        "vipshop_main_image",
        ["nickname", "fullName", "efficacy", "gifts",
         "sellingPoint", "icon", "remark", "remarks"],
    ),
    "小红书": (
        "xiaohongshu_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "thresholdA", "sellingPoint", "price", "icon", "remark", "remarks"],
    ),
    "中免日上": (
        "zhongmian_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "thresholdA", "sellingPoint", "remark", "remarks"],
    ),
    "视频号": (
        "shipinhao_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "thresholdA", "sellingPoint", "price", "icon", "remark", "remarks"],
    ),
    "美团闪购": (
        "meituan_flash_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "thresholdA", "sellingPoint", "remarks"],
    ),
    "招商银行": (
        "cmb_main_image",
        ["brand", "nickname", "fullName", "efficacy", "gifts",
         "sellingPoint", "price", "remark", "remarks"],
    ),
}


class ProductSpecTemplatePlatformTests(TestCase):
    def test_platform_has_one_active_template(self):
        active_templates = ProductSpecTemplate.objects.filter(platform="京东", status=True)
        self.assertEqual(active_templates.count(), 1)
        template = active_templates.get()
        self.assertEqual(template.template_code, "main_image")
        self.assertEqual(template.icon, "Picture")
        self.assertTrue(template.remark)

    def test_main_image_schema_contains_icon_and_remark_table_fields(self):
        schema = get_schema("main_image")

        self.assertEqual(schema["rowsPerBlock"], 14)
        self.assertFalse(
            {"spec", "memberGift", "memberValue"}
            & {field["key"] for field in schema["fields"]}
        )
        self.assertEqual(
            [field["key"] for field in schema["fields"]][-3:],
            ["icon", "remark", "remarks"],
        )
        icon_field = next(field for field in schema["fields"] if field["key"] == "icon")
        self.assertEqual(icon_field["kind"], "longtext")

    def test_tmall_template_copies_jd_main_image_schema(self):
        jd_template = ProductSpecTemplate.objects.get(
            template_code="main_image",
        )
        tmall_template = ProductSpecTemplate.objects.get(
            template_code="tmall_main_image",
        )

        self.assertEqual(tmall_template.platform, "天猫")
        self.assertEqual(tmall_template.template_name, jd_template.template_name)
        self.assertEqual(tmall_template.icon, jd_template.icon)
        self.assertEqual(
            tmall_template.rows_per_block,
            jd_template.rows_per_block,
        )
        self.assertEqual(
            tmall_template.columns_per_block,
            jd_template.columns_per_block,
        )
        self.assertEqual(tmall_template.fields, jd_template.fields)
        self.assertEqual(tmall_template.validation, jd_template.validation)
        self.assertTrue(tmall_template.status)

    def test_seeded_platform_templates_match_configured_fields(self):
        for platform, config in EXPECTED_PLATFORM_TEMPLATES.items():
            template_code, field_keys = config
            with self.subTest(platform=platform):
                templates = ProductSpecTemplate.objects.filter(
                    platform=platform,
                    status=True,
                )
                self.assertEqual(templates.count(), 1)
                template = templates.get()
                self.assertEqual(template.template_code, template_code)
                self.assertEqual(
                    [field["key"] for field in template.fields],
                    field_keys,
                )
                self.assertEqual(template.rows_per_block, len(field_keys) + 2)
                self.assertEqual(template.columns_per_block, 6)
                self._assert_template_validation(template, platform, field_keys)

    def _assert_template_validation(self, template, platform, field_keys):
        self.assertEqual(
            template.validation["requiredSubmissionFields"],
            ["name", "shop"],
        )
        # 除主品（昵称）外不再有产品级必填字段
        self.assertEqual(
            template.validation.get("requiredProductFields"),
            [],
        )
        self.assertEqual(
            template.validation.get("priceFieldKey"),
            "price" if "price" in field_keys else None,
        )
        self.assertNotIn("dateRangeFieldKey", template.validation)

    def test_enabling_second_template_for_platform_is_rejected(self):
        template = ProductSpecTemplate.objects.get(template_code="main_image")
        serializer = ProductSpecTemplateSerializer(
            data={
                "template_code": "jd_main_image_backup",
                "template_name": "京东主图备份模板",
                "platform": template.platform,
                "rows_per_block": template.rows_per_block,
                "columns_per_block": template.columns_per_block,
                "fields": template.fields,
                "validation": template.validation,
                "status": True,
            },
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("已有启用模板", str(serializer.errors))
