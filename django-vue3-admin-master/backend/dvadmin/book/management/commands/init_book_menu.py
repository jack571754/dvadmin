# -*- coding: utf-8 -*-
"""
图书管理菜单初始化命令

使用方法:
    python manage.py init_book_menu

功能:
    创建或更新图书管理的所有菜单配置
"""

from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, Role, RoleMenuPermission, MenuButton, RoleMenuButtonPermission
from django.db import transaction


class Command(BaseCommand):
    help = '初始化图书管理菜单配置'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write('图书管理菜单初始化脚本')
        self.stdout.write('=' * 60)

        with transaction.atomic():
            # 1. 创建或更新父菜单
            self.stdout.write('\n[1/2] 创建/更新父菜单...')

            parent_menu, created = Menu.objects.update_or_create(
                web_path='/book',
                defaults={
                    'name': '图书管理',
                    'component': '',
                    'component_name': '',
                    'parent': None,
                    'is_catalog': True,
                    'icon': 'Reading',
                    'sort': 10,
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

            # 2. 定义子菜单配置（包含按钮权限）
            children_configs = [
                {
                    'name': '图书信息',
                    'web_path': '/book/book',
                    'component': 'book/book/index',
                    'component_name': 'bookBook',
                    'icon': 'Document',
                    'sort': 1,
                    'buttons': [
                        {'name': '查询', 'value': 'book:book:Search', 'api': '/api/book/book/', 'method': 0},
                        {'name': '新增', 'value': 'book:book:Create', 'api': '/api/book/book/', 'method': 1},
                        {'name': '编辑', 'value': 'book:book:Update', 'api': '/api/book/book/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'book:book:Delete', 'api': '/api/book/book/{id}/', 'method': 3},
                        {'name': '导出', 'value': 'book:book:Export', 'api': '/api/book/book/export/', 'method': 1},
                        {'name': '导入', 'value': 'book:book:Import', 'api': '/api/book/book/import/', 'method': 1},
                        {'name': '借阅', 'value': 'book:book:Borrow', 'api': '/api/book/book/{id}/borrow/', 'method': 1},
                        {'name': '归还', 'value': 'book:book:Return', 'api': '/api/book/book/{id}/return_book/', 'method': 1},
                    ]
                },
                {
                    'name': '图书分类',
                    'web_path': '/book/category',
                    'component': 'book/category/index',
                    'component_name': 'bookCategory',
                    'icon': 'Files',
                    'sort': 2,
                    'buttons': [
                        {'name': '查询', 'value': 'book:category:Search', 'api': '/api/book/category/', 'method': 0},
                        {'name': '新增', 'value': 'book:category:Create', 'api': '/api/book/category/', 'method': 1},
                        {'name': '编辑', 'value': 'book:category:Update', 'api': '/api/book/category/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'book:category:Delete', 'api': '/api/book/category/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '图书作者',
                    'web_path': '/book/author',
                    'component': 'book/author/index',
                    'component_name': 'bookAuthor',
                    'icon': 'User',
                    'sort': 3,
                    'buttons': [
                        {'name': '查询', 'value': 'book:author:Search', 'api': '/api/book/author/', 'method': 0},
                        {'name': '新增', 'value': 'book:author:Create', 'api': '/api/book/author/', 'method': 1},
                        {'name': '编辑', 'value': 'book:author:Update', 'api': '/api/book/author/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'book:author:Delete', 'api': '/api/book/author/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '图书出版社',
                    'web_path': '/book/publisher',
                    'component': 'book/publisher/index',
                    'component_name': 'bookPublisher',
                    'icon': 'OfficeBuilding',
                    'sort': 4,
                    'buttons': [
                        {'name': '查询', 'value': 'book:publisher:Search', 'api': '/api/book/publisher/', 'method': 0},
                        {'name': '新增', 'value': 'book:publisher:Create', 'api': '/api/book/publisher/', 'method': 1},
                        {'name': '编辑', 'value': 'book:publisher:Update', 'api': '/api/book/publisher/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'book:publisher:Delete', 'api': '/api/book/publisher/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '借阅记录',
                    'web_path': '/book/borrow',
                    'component': 'book/borrow/index',
                    'component_name': 'bookBorrow',
                    'icon': 'List',
                    'sort': 5,
                    'buttons': [
                        {'name': '查询', 'value': 'book:borrow:Search', 'api': '/api/book/borrow/', 'method': 0},
                        {'name': '新增', 'value': 'book:borrow:Create', 'api': '/api/book/borrow/', 'method': 1},
                        {'name': '编辑', 'value': 'book:borrow:Update', 'api': '/api/book/borrow/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'book:borrow:Delete', 'api': '/api/book/borrow/{id}/', 'method': 3},
                        {'name': '续借', 'value': 'book:borrow:Renew', 'api': '/api/book/borrow/{id}/renew/', 'method': 1},
                    ]
                },
            ]

            # 3. 创建或更新子菜单及按钮权限
            self.stdout.write('\n[2/3] 创建/更新子菜单及按钮权限...')

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

                # 创建或更新按钮权限
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

            # 4. 清理多余的子菜单和按钮
            existing_web_paths = {cfg['web_path'] for cfg in children_configs}
            extra_menus = parent_menu.menu_set.exclude(web_path__in=existing_web_paths)

            if extra_menus.exists():
                self.stdout.write('\n[Clean] Remove extra menus and buttons...')
                for child in extra_menus:
                    self.stdout.write(self.style.WARNING(f'  [DEL] Delete: {child.name} (ID={child.id})'))
                    child.delete()

            # 清理多余按钮（删除不属于现有菜单的按钮）
            existing_button_values = set()
            for cfg in children_configs:
                for btn in cfg.get('buttons', []):
                    existing_button_values.add(btn['value'])

            for child in parent_menu.menu_set.all():
                extra_buttons = child.menuPermission.exclude(value__in=existing_button_values)
                for btn in extra_buttons:
                    self.stdout.write(self.style.WARNING(f'  [DEL] Button: {btn.name}'))
                    btn.delete()

            # 5. 自动分配权限给管理员角色（菜单权限+按钮权限）
            self.stdout.write('\n[3/3] Assign permissions to admin role...')

            try:
                # 尝试找到管理员角色
                admin_role = Role.objects.filter(key__in=['admin', 'superadmin']).first()
                if not admin_role:
                    # 如果找不到，使用第一个角色
                    admin_role = Role.objects.first()

                if admin_role:
                    # 分配父菜单权限
                    RoleMenuPermission.objects.get_or_create(
                        role=admin_role,
                        menu=parent_menu
                    )

                    # 分配所有子菜单权限
                    for child in parent_menu.menu_set.all():
                        RoleMenuPermission.objects.get_or_create(
                            role=admin_role,
                            menu=child
                        )

                        # 分配所有按钮权限
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

        # 6. 输出结果摘要
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('Initialization completed!'))
        self.stdout.write('=' * 60)

        # 显示当前菜单配置
        self.stdout.write('\nCurrent book menu configuration:')
        self.stdout.write('-' * 60)
        all_menus = Menu.objects.filter(
            web_path__startswith='/book'
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
        self.stdout.write('  3. Visit: http://172.20.96.1:9001/#/book/book')
        self.stdout.write('=' * 60)
