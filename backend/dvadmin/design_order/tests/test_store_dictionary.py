from django.test import TestCase

from django.core.management import call_command
from dvadmin.system.models import Menu, MenuButton
from dvadmin.system.models import Dictionary


STORE_DICTIONARIES = {
    "design_order_store_type": ["达播", "运营"],
    "design_order_store_brand": ["可复美", "可丽金", "可复美械品", "可预"],
    "design_order_store_platform": [
        "京东",
        "天猫",
        "拼多多",
        "抖音",
        "唯品会",
        "小红书",
        "中免日上",
        "视频号",
        "美团闪购",
        "招商银行",
        "得物",
        "丁香妈妈",
        "有赞",
    ],

}


class StoreDictionaryInitializationTests(TestCase):
    def test_store_dictionaries_are_initialized_with_expected_options(self):
        Menu.objects.create(name="用户", component="system/user/index")
        call_command("seed_design_order_support")
        first_count = Dictionary.objects.count()
        call_command("seed_design_order_support")
        self.assertEqual(Dictionary.objects.count(), first_count)
        self.assertEqual(MenuButton.objects.filter(value__startswith="user:PlatformPermission").count(), 2)

        for dictionary_key, expected_values in STORE_DICTIONARIES.items():
            with self.subTest(dictionary_key=dictionary_key):
                parent = Dictionary.objects.get(
                    value=dictionary_key,
                    parent__isnull=True,
                    is_value=False,
                )
                actual_values = list(
                    Dictionary.objects.filter(
                        parent=parent,
                        status=True,
                        is_value=True,
                    )
                    .order_by("sort")
                    .values_list("value", flat=True)
                )
                self.assertEqual(actual_values, expected_values)
