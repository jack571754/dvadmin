import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from dvadmin.system.models import Dictionary, Menu, MenuButton


class Command(BaseCommand):
    help = "仅补种设计工单三组店铺字典及用户平台授权按钮，保留既有权限与业务数据"

    @transaction.atomic
    def handle(self, *args, **options):
        user_menu = Menu.objects.filter(component="system/user/index").first()
        if user_menu is None:
            raise CommandError("未找到用户管理菜单，未执行任何补种")
        rows = json.loads((Path(__file__).resolve().parents[2] / "fixtures/store_dictionaries.json").read_text("utf-8"))
        for row in rows:
            defaults = {key: value for key, value in row.items() if key not in {"children", "parent", "value"}}
            parent, _ = Dictionary.objects.get_or_create(parent=None, value=row["value"], defaults=defaults)
            for child in row["children"]:
                defaults = {key: value for key, value in child.items() if key not in {"children", "parent", "value"}}
                Dictionary.objects.get_or_create(parent=parent, value=child["value"], defaults=defaults)
        for value, name, endpoint, method in (
            ("user:PlatformPermission", "平台权限", "platform_permissions", 0),
            ("user:PlatformPermissionUpdate", "保存平台权限", "update_platform_permissions", 2),
        ):
            MenuButton.objects.update_or_create(value=value, defaults={
                "menu": user_menu, "name": name,
                "api": f"/api/system/user/{{id}}/{endpoint}/", "method": method,
            })
        self.stdout.write(self.style.SUCCESS("设计工单三组字典及两个平台授权按钮已幂等补种；未授予任何角色新权限"))
