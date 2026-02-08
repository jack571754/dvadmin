from dvadmin.system.models import Menu, MenuButton, RoleMenuPermission

# 获取审批流程父菜单
flow_parent = Menu.objects.filter(name='审批流程', is_catalog=True).first()
admin_role = Role.objects.filter(name='管理员').first()

# 要添加的新菜单
new_menus = [
    {
        'name': '流程数据',
        'icon': 'ele-DocumentCopy',
        'sort': 5,
        'web_path': '/data',
        'component': 'plugins/dvadmin3_flow/flowData/index',
        'component_name': 'flowData',
        'buttons': [
            {'name': '查询', 'value': 'flowData:Search', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
        ]
    },
    {
        'name': '流程信息',
        'icon': 'ele-InfoFilled',
        'sort': 6,
        'web_path': '/info',
        'component': 'plugins/dvadmin3_flow/flowInfo/index',
        'component_name': 'flowInfo',
        'buttons': [
            {'name': '查询', 'value': 'flowInfo:Search', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
        ]
    },
]

print('Adding new menus...')
for menu_data in new_menus:
    buttons = menu_data.pop('buttons', [])

    menu, created = Menu.objects.get_or_create(
        parent=flow_parent,
        name=menu_data['name'],
        defaults={
            **menu_data,
            'is_link': False,
            'is_catalog': False,
            'status': True,
            'cache': False,
            'visible': True,
            'is_affix': False,
            'is_iframe': False,
        }
    )

    if created:
        print(f'Created: {menu.name} (id={menu.id})')
        for btn_data in buttons:
            MenuButton.objects.get_or_create(
                menu=menu,
                name=btn_data['name'],
                defaults={
                    'value': btn_data['value'],
                    'api': btn_data['api'],
                    'method': btn_data['method'],
                }
            )
    else:
        print(f'Already exists: {menu.name} (id={menu.id})')

    RoleMenuPermission.objects.get_or_create(role=admin_role, menu=menu)

print('Done!')
