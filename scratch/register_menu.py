# -*- coding: utf-8 -*-
import os
import sys

# Add backend directory to sys.path so it can import application modules correctly
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
django.setup()

from dvadmin.system.models import Menu, MenuButton, Role, RoleMenuPermission, RoleMenuButtonPermission

def run():
    print("Starting menu registration...")
    
    # 1. Get or create the parent menu
    parent_menu = Menu.objects.filter(name='设计工单管理').first()
    if not parent_menu:
        # Fallback to id=63 or create one
        parent_menu = Menu.objects.filter(id=63).first()
    
    if not parent_menu:
        print("Parent menu '设计工单管理' or ID 63 not found!")
        return
        
    print(f"Parent menu: {parent_menu.name} (id={parent_menu.id})")
    
    # 2. Get or create the submission menu
    menu, created = Menu.objects.get_or_create(
        web_path='product_spec_submission',
        component='design_order/product_spec_submission/index',
        defaults={
            'parent': parent_menu,
            'name': '规格提报历史',
            'icon': 'ele-Tickets',
            'sort': 3,
            'is_link': False,
            'is_catalog': False,
            'component_name': 'productSpecSubmission',
            'status': True,
            'cache': False,
            'visible': True,
            'is_iframe': False,
            'is_affix': False,
        }
    )
    
    if created:
        print(f"Created menu: {menu.name} (id={menu.id})")
    else:
        print(f"Menu already exists: {menu.name} (id={menu.id})")
        # Update fields just in case
        menu.parent = parent_menu
        menu.name = '规格提报历史'
        menu.icon = 'ele-Tickets'
        menu.sort = 3
        menu.component_name = 'productSpecSubmission'
        menu.visible = True
        menu.status = True
        menu.save()

    # 2.5 Get or create the product spec detail menu (hidden, but route needed)
    spec_menu, spec_created = Menu.objects.get_or_create(
        web_path='product_spec',
        component='design_order/product_spec/index',
        defaults={
            'parent': parent_menu,
            'name': '产品规格对比',
            'icon': 'ele-Tickets',
            'sort': 4,
            'is_link': False,
            'is_catalog': False,
            'component_name': 'productSpec',
            'status': True,
            'cache': False,
            'visible': False,  # Hidden from sidebar
            'is_iframe': False,
            'is_affix': False,
        }
    )

    if spec_created:
        print(f"Created menu: {spec_menu.name} (id={spec_menu.id})")
    else:
        print(f"Menu already exists: {spec_menu.name} (id={spec_menu.id})")
        # Update fields just in case
        spec_menu.parent = parent_menu
        spec_menu.name = '产品规格对比'
        spec_menu.icon = 'ele-Tickets'
        spec_menu.sort = 4
        spec_menu.component_name = 'productSpec'
        spec_menu.visible = False
        spec_menu.status = True
        spec_menu.save()
        
    # 3. Create/update MenuButtons
    buttons_data = [
        {'name': '查询', 'value': 'design_order:product_spec_submission:Search', 'api': '/api/design_order/product_spec_submissions/', 'method': 0},
        {'name': '单例查询', 'value': 'design_order:product_spec_submission:View', 'api': '/api/design_order/product_spec_submissions/{id}/', 'method': 0},
        {'name': '新增', 'value': 'design_order:product_spec_submission:Create', 'api': '/api/design_order/product_spec_submissions/', 'method': 1},
        {'name': '编辑', 'value': 'design_order:product_spec_submission:Update', 'api': '/api/design_order/product_spec_submissions/{id}/', 'method': 2},
        {'name': '删除', 'value': 'design_order:product_spec_submission:Delete', 'api': '/api/design_order/product_spec_submissions/{id}/', 'method': 3},
        {'name': '复用提报', 'value': 'design_order:product_spec_submission:Copy', 'api': '/api/design_order/product_spec_submissions/{id}/copy/', 'method': 1},
    ]
    
    buttons = []
    for btn_info in buttons_data:
        btn, btn_created = MenuButton.objects.get_or_create(
            value=btn_info['value'],
            defaults={
                'menu': menu,
                'name': btn_info['name'],
                'api': btn_info['api'],
                'method': btn_info['method']
            }
        )
        if btn_created:
            print(f"Created button: {btn.name} ({btn.value})")
        else:
            print(f"Button already exists: {btn.name} ({btn.value})")
            # Update fields
            btn.menu = menu
            btn.name = btn_info['name']
            btn.api = btn_info['api']
            btn.method = btn_info['method']
            btn.save()
        buttons.append(btn)
        
    # 4. Assign permissions to Roles: 'admin', 'user', 'public'
    roles = Role.objects.filter(key__in=['admin', 'user', 'public'])
    for role in roles:
        print(f"Assigning permissions for role: {role.name} ({role.key})...")
        
        # Menu permission for the new menu
        rmp, rmp_created = RoleMenuPermission.objects.get_or_create(role=role, menu=menu)
        if rmp_created:
            print(f"  Assigned MenuPermission for '{menu.name}'")
            
        # Menu permission for parent menu if not present
        rmp_parent, rmp_parent_created = RoleMenuPermission.objects.get_or_create(role=role, menu=parent_menu)
        if rmp_parent_created:
            print(f"  Assigned MenuPermission for parent '{parent_menu.name}'")
            
        # Menu permission for spec_menu if not present
        rmp_spec, rmp_spec_created = RoleMenuPermission.objects.get_or_create(role=role, menu=spec_menu)
        if rmp_spec_created:
            print(f"  Assigned MenuPermission for '{spec_menu.name}'")

        # Sibling menu permission just to make sure they are accessible
        for sibling_path in ['product_archive']:
            sibling = Menu.objects.filter(web_path=sibling_path).first()
            if sibling:
                rmp_sib, rmp_sib_created = RoleMenuPermission.objects.get_or_create(role=role, menu=sibling)
                if rmp_sib_created:
                    print(f"  Assigned MenuPermission for sibling '{sibling.name}'")
                    
        # Button permissions
        for btn in buttons:
            rmbp, rmbp_created = RoleMenuButtonPermission.objects.get_or_create(
                role=role, 
                menu_button=btn,
                defaults={'data_range': 3}  # 全部数据权限
            )
            if rmbp_created:
                print(f"  Assigned ButtonPermission: {btn.name} ({btn.value})")
            else:
                rmbp.data_range = 3
                rmbp.save()

    print("Menu registration finished successfully!")

if __name__ == '__main__':
    run()
