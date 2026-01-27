"""
初始化图书管理菜单和权限
使用方法：python manage.py init_book_menu
"""

from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, MenuButton, Role, RoleMenuButtonPermission


class Command(BaseCommand):
    help = '初始化图书管理菜单和权限'

    def handle(self, *args, **options):
        self.stdout.write('开始初始化图书管理菜单...')

        # 获取或创建图书管理父菜单
        book_menu, created = Menu.objects.get_or_create(
            defaults={
                'name': '图书管理',
                'value': '/book',
                'parent': None,
                'component': '',
                'icon': 'el-icon-reading',
                'type': 0,  # 目录
                'status': True,
                'sort': 100,
                'is_show': True,
                'is_affix': False,
            },
            value='/book'
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ 创建图书管理父菜单: {book_menu.name}'))
        else:
            self.stdout.write(f'  图书管理父菜单已存在: {book_menu.name}')

        # 定义子菜单
        menus_data = [
            {
                'name': '图书列表',
                'value': '/book/book',
                'component': 'book/BookList',
                'icon': 'el-icon-document',
                'type': 1,  # 菜单
                'parent': book_menu,
                'sort': 1,
            },
            {
                'name': '图书分类',
                'value': '/book/category',
                'component': 'book/CategoryList',
                'icon': 'el-icon-folder',
                'type': 1,
                'parent': book_menu,
                'sort': 2,
            },
            {
                'name': '作者管理',
                'value': '/book/author',
                'component': 'book/AuthorList',
                'icon': 'el-icon-user',
                'type': 1,
                'parent': book_menu,
                'sort': 3,
            },
            {
                'name': '出版社管理',
                'value': '/book/publisher',
                'component': 'book/PublisherList',
                'icon': 'el-icon-office-building',
                'type': 1,
                'parent': book_menu,
                'sort': 4,
            },
            {
                'name': '借阅记录',
                'value': '/book/borrow',
                'component': 'book/BorrowList',
                'icon': 'el-icon-notebook-2',
                'type': 1,
                'parent': book_menu,
                'sort': 5,
            },
        ]

        created_menus = []
        for menu_data in menus_data:
            menu, created = Menu.objects.get_or_create(
                defaults={
                    **menu_data,
                    'status': True,
                    'is_show': True,
                    'is_affix': False,
                },
                value=menu_data['value'],
                parent=menu_data['parent']
            )
            created_menus.append(menu)
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ 创建菜单: {menu.name}'))
            else:
                self.stdout.write(f'    菜单已存在: {menu.name}')

            # 为每个菜单创建按钮权限
            self._create_menu_buttons(menu)

        # 分配权限给超级管理员角色
        self._assign_permissions_to_admin(created_menus)

        self.stdout.write(self.style.SUCCESS('✓ 图书管理菜单初始化完成！'))
        self.stdout.write('请重启后端服务器，然后在前端菜单管理中查看。')

    def _create_menu_buttons(self, menu):
        """为菜单创建按钮权限"""
        buttons_data = [
            {'name': '查询', 'value': 'book:query', 'index': 1},
            {'name': '新增', 'value': 'book:create', 'index': 2},
            {'name': '修改', 'value': 'book:update', 'index': 3},
            {'name': '删除', 'value': 'book:delete', 'index': 4},
            {'name': '导出', 'value': 'book:export', 'index': 5},
        ]

        for button_data in buttons_data:
            button, created = MenuButton.objects.get_or_create(
                defaults={
                    **button_data,
                    'menu': menu,
                    'status': True,
                },
                value=button_data['value'],
                menu=menu
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'    ✓ 创建按钮: {menu.name} - {button.name}'))

    def _assign_permissions_to_admin(self, menus):
        """分配权限给超级管理员角色"""
        try:
            admin_role = Role.objects.get(key='admin')
        except Role.DoesNotExist:
            self.stdout.write(self.style.WARNING('  未找到管理员角色，跳过权限分配'))
            return

        for menu in menus:
            # 添加菜单权限
            if menu not in admin_role.menu.all():
                admin_role.menu.add(menu)
                self.stdout.write(self.style.SUCCESS(f'    ✓ 为管理员分配菜单: {menu.name}'))

            # 添加按钮权限
            buttons = MenuButton.objects.filter(menu=menu)
            for button in buttons:
                # 检查权限是否已存在
                exists = RoleMenuButtonPermission.objects.filter(
                    role=admin_role,
                    menu_button=button
                ).exists()

                if not exists:
                    RoleMenuButtonPermission.objects.create(
                        role=admin_role,
                        menu_button=button
                    )
                    self.stdout.write(self.style.SUCCESS(f'      ✓ 为管理员分配按钮: {button.name}'))
