# -*- coding: utf-8 -*-
"""
Blog Menu Initialization Command

Usage:
    python manage.py init_blog_menu

Features:
    Create or update all blog menu configurations
"""

from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, Role, RoleMenuPermission, MenuButton, RoleMenuButtonPermission
from django.db import transaction


class Command(BaseCommand):
    help = 'Initialize blog management menu configuration'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write('Blog Management Menu Initialization')
        self.stdout.write('=' * 60)

        with transaction.atomic():
            # 1. Create or update parent menu
            self.stdout.write('\n[1/3] Create/Update parent menu...')

            parent_menu, created = Menu.objects.update_or_create(
                web_path='/blog',
                defaults={
                    'name': '博客管理',
                    'component': '',
                    'component_name': '',
                    'parent': None,
                    'is_catalog': True,
                    'icon': 'Document',
                    'sort': 100,
                    'status': True,
                    'visible': True,
                    'is_affix': False,
                    'is_link': False,
                    'is_iframe': False
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'  [OK] Create parent menu: {parent_menu.name} (ID={parent_menu.id})'))
            else:
                self.stdout.write(self.style.WARNING(f'  [UP] Update parent menu: {parent_menu.name} (ID={parent_menu.id})'))

            # 2. Define child menu configurations (including button permissions)
            children_configs = [
                {
                    'name': '文章管理',
                    'web_path': '/blog/article',
                    'component': 'blog/article/index',
                    'component_name': 'blog:article',
                    'icon': 'Document',
                    'sort': 1,
                    'buttons': [
                        {'name': '查询', 'value': 'blog:article:Query', 'api': '/api/blog/articles/', 'method': 0},
                        {'name': '新增', 'value': 'blog:article:Create', 'api': '/api/blog/articles/', 'method': 1},
                        {'name': '编辑', 'value': 'blog:article:Update', 'api': '/api/blog/articles/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'blog:article:Delete', 'api': '/api/blog/articles/{id}/', 'method': 3},
                        {'name': '发布', 'value': 'blog:article:Publish', 'api': '/api/blog/articles/{id}/publish/', 'method': 1},
                    ]
                },
                {
                    'name': '分类管理',
                    'web_path': '/blog/category',
                    'component': 'blog/category/index',
                    'component_name': 'blog:category',
                    'icon': 'FolderOpened',
                    'sort': 2,
                    'buttons': [
                        {'name': '查询', 'value': 'blog:category:Query', 'api': '/api/blog/categories/', 'method': 0},
                        {'name': '新增', 'value': 'blog:category:Create', 'api': '/api/blog/categories/', 'method': 1},
                        {'name': '编辑', 'value': 'blog:category:Update', 'api': '/api/blog/categories/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'blog:category:Delete', 'api': '/api/blog/categories/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '标签管理',
                    'web_path': '/blog/tag',
                    'component': 'blog/tag/index',
                    'component_name': 'blog:tag',
                    'icon': 'PriceTag',
                    'sort': 3,
                    'buttons': [
                        {'name': '查询', 'value': 'blog:tag:Query', 'api': '/api/blog/tags/', 'method': 0},
                        {'name': '新增', 'value': 'blog:tag:Create', 'api': '/api/blog/tags/', 'method': 1},
                        {'name': '编辑', 'value': 'blog:tag:Update', 'api': '/api/blog/tags/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'blog:tag:Delete', 'api': '/api/blog/tags/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '评论管理',
                    'web_path': '/blog/comment',
                    'component': 'blog/comment/index',
                    'component_name': 'blog:comment',
                    'icon': 'ChatDotRound',
                    'sort': 4,
                    'buttons': [
                        {'name': '查询', 'value': 'blog:comment:Query', 'api': '/api/blog/comments/', 'method': 0},
                        {'name': '新增', 'value': 'blog:comment:Create', 'api': '/api/blog/comments/', 'method': 1},
                        {'name': '编辑', 'value': 'blog:comment:Update', 'api': '/api/blog/comments/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'blog:comment:Delete', 'api': '/api/blog/comments/{id}/', 'method': 3},
                    ]
                },
            ]

            # 3. Create or update child menus and button permissions
            self.stdout.write('\n[2/3] Create/Update child menus and button permissions...')

            for config in children_configs:
                child_menu, created = Menu.objects.update_or_create(
                    web_path=config['web_path'],
                    defaults={
                        'name': config['name'],
                        'component': config['component'],
                        'component_name': config['component_name'],
                        'parent': parent_menu,
                        'is_catalog': False,
                        'icon': config['icon'],
                        'sort': config['sort'],
                        'status': True,
                        'visible': True,
                        'is_affix': False,
                        'is_link': False,
                        'is_iframe': False
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'  [OK] Create: {child_menu.name} (ID={child_menu.id})'))
                else:
                    self.stdout.write(self.style.WARNING(f'  [UP] Update: {child_menu.name} (ID={child_menu.id})'))

                # Create or update button permissions
                buttons = config.get('buttons', [])
                for btn_config in buttons:
                    button, btn_created = MenuButton.objects.update_or_create(
                        menu=child_menu,
                        value=btn_config['value'],
                        defaults={
                            'name': btn_config['name'],
                            'api': btn_config['api'],
                            'method': btn_config['method'],
                        }
                    )
                    if btn_created:
                        self.stdout.write(self.style.SUCCESS(f'    [BTN] {btn_config["name"]}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'    [UP] {btn_config["name"]}'))

            # 4. Clean up extra child menus and buttons
            existing_web_paths = {cfg['web_path'] for cfg in children_configs}
            extra_menus = parent_menu.menu_set.exclude(web_path__in=existing_web_paths)

            if extra_menus.exists():
                self.stdout.write('\n[Clean] Remove extra menus and buttons...')
                for child in extra_menus:
                    self.stdout.write(self.style.WARNING(f'  [DEL] Delete: {child.name} (ID={child.id})'))
                    child.delete()

            # Clean up extra buttons (delete buttons that don't belong to existing menus)
            existing_button_values = set()
            for cfg in children_configs:
                for btn in cfg.get('buttons', []):
                    existing_button_values.add(btn['value'])

            for child in parent_menu.menu_set.all():
                extra_buttons = child.menuPermission.exclude(value__in=existing_button_values)
                for btn in extra_buttons:
                    self.stdout.write(self.style.WARNING(f'  [DEL] Button: {btn.name}'))
                    btn.delete()

            # 5. Automatically assign permissions to admin role (menu permissions + button permissions)
            self.stdout.write('\n[3/3] Assign permissions to admin role...')

            try:
                # Try to find admin role
                admin_role = Role.objects.filter(key__in=['admin', 'superadmin']).first()
                if not admin_role:
                    # If not found, use the first role
                    admin_role = Role.objects.first()

                if admin_role:
                    # Assign parent menu permission
                    RoleMenuPermission.objects.get_or_create(
                        role=admin_role,
                        menu=parent_menu
                    )

                    # Assign all child menu permissions
                    for child in parent_menu.menu_set.all():
                        RoleMenuPermission.objects.get_or_create(
                            role=admin_role,
                            menu=child
                        )

                        # Assign all button permissions
                        for button in child.menuPermission.all():
                            RoleMenuButtonPermission.objects.get_or_create(
                                role=admin_role,
                                menu_button=button
                            )

                    self.stdout.write(self.style.SUCCESS(f'  [OK] Assigned menu & button permissions to role "{admin_role.name}"'))
                else:
                    self.stdout.write(self.style.WARNING('  [WARN] Admin role not found, please assign permissions manually'))

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  [WARN] Permission assignment failed: {str(e)}'))

        # 6. Output result summary
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('Initialization completed!'))
        self.stdout.write('=' * 60)

        # Display current menu configuration
        self.stdout.write('\nCurrent blog menu configuration:')
        self.stdout.write('-' * 60)
        all_menus = Menu.objects.filter(
            web_path__startswith='/blog'
        ).order_by('parent_id', 'sort')

        for menu in all_menus:
            indent = '  ' if menu.parent_id else ''
            menu_type = '[CAT]' if menu.is_catalog else '[MENU]'
            component_info = f"{menu.component} ({menu.component_name})" if menu.component else '-'

            self.stdout.write(
                f"{indent}ID:{menu.id} {menu_type} {menu.name}\n"
                f"{indent}      Path: {menu.web_path}\n"
                f"{indent}      Comp: {component_info}\n"
            )

        self.stdout.write('=' * 60)
        self.stdout.write('\nNext steps:')
        self.stdout.write('  1. Clear browser cache (Ctrl+Shift+Delete)')
        self.stdout.write('  2. Re-login to system')
        self.stdout.write('  3. Visit: http://localhost:8080/#/blog/article')
        self.stdout.write('=' * 60)
