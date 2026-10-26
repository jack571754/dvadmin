from django.core.management.base import BaseCommand, CommandError

from dvadmin.system.models import Menu, MenuButton


class Command(BaseCommand):
    help = "幂等同步设计工单菜单按钮，不重置现有角色权限"

    def handle(self, *args, **options):
        menu = Menu.objects.filter(web_path="product_spec_submission").first()
        if not menu:
            raise CommandError("未找到规格提报历史菜单，请先初始化 design_order 菜单")

        button, created = MenuButton.objects.update_or_create(
            value="design_order:product_spec_submission:Share",
            defaults={
                "menu": menu,
                "name": "分享提报",
                "api": "/api/design_order/product_spec_shares/",
                "method": 1,
            },
        )
        action = "创建" if created else "更新"
        self.stdout.write(self.style.SUCCESS(f"{action}菜单按钮成功: {button.value}"))
