# -*- coding: utf-8 -*-
import os
import django
import sys

# Set UTF-8 output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'application.settings')
django.setup()

from dvadmin.system.models import Menu, MenuButton, Role, RoleMenuPermission, RoleMenuButtonPermission
from django.db import transaction

# First, execute the transaction without any print
with transaction.atomic():
    parent_menu = Menu.objects.get(web_path='/blog')

    article_menu, created = Menu.objects.update_or_create(
        web_path='/blog/article',
        defaults={
            'name': '文章管理',
            'component': 'blog/article/index',
            'component_name': 'blog:article',
            'parent': parent_menu,
            'is_catalog': False,
            'icon': 'Document',
            'sort': 1,
            'status': True,
            'visible': True,
            'is_affix': False,
            'is_link': False,
            'is_iframe': False
        }
    )

    buttons_data = [
        ('查询', 'blog:article:Query', '/api/blog/articles/', 0),
        ('新增', 'blog:article:Create', '/api/blog/articles/', 1),
        ('编辑', 'blog:article:Update', '/api/blog/articles/{id}/', 2),
        ('删除', 'blog:article:Delete', '/api/blog/articles/{id}/', 3),
    ]

    buttons = []
    for name, value, api, method in buttons_data:
        btn, _ = MenuButton.objects.update_or_create(
            menu=article_menu,
            value=value,
            defaults={'name': name, 'api': api, 'method': method}
        )
        buttons.append(btn)

    admin_role = Role.objects.filter(key__in=['admin', 'superadmin']).first()
    if admin_role:
        RoleMenuPermission.objects.get_or_create(role=admin_role, menu=article_menu)

        for button in buttons:
            RoleMenuButtonPermission.objects.get_or_create(role=admin_role, menu_button=button)

# Now print the results (outside transaction)
status = 'CREATED' if created else 'UPDATED'
print(f'[{status}] Article menu ID={article_menu.id}')
print(f'[BUTTONS] {len(buttons)} buttons created')
for btn in buttons:
    print(f'  - {btn.value}')
if admin_role:
    print(f'[ROLE] Permissions assigned to {admin_role.name}')
else:
    print('[WARN] Admin role not found')
