from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, Role, MenuButton, MenuField, RoleMenuPermission
from django.db import transaction


class Command(BaseCommand):
    help = '初始化审批流程菜单数据'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('开始初始化审批流程菜单...')

        # 获取或创建审批流程父菜单
        flow_parent, created = Menu.objects.get_or_create(
            name='审批流程',
            defaults={
                'icon': 'ele-Operation',
                'sort': 4,
                'is_link': False,
                'is_catalog': True,
                'web_path': '/flow',
                'component': '',
                'component_name': 'flow',
                'status': True,
                'cache': False,
                'visible': True,
                'is_affix': False,
                'is_iframe': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'创建父菜单: {flow_parent.name}'))
        else:
            self.stdout.write(f'父菜单已存在: {flow_parent.name}')

        # 定义子菜单
        flow_menus = [
            {
                'name': '流程管理',
                'icon': 'ele-Edit',
                'sort': 1,
                'web_path': '/management',
                'component': 'plugins/dvadmin3_flow/flowManagement/index',
                'component_name': 'flowManagement',
                'menu_button': [
                    {'name': '查询', 'value': 'flowManagement:Search', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
                    {'name': '新增', 'value': 'flowManagement:Create', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 1},
                    {'name': '编辑', 'value': 'flowManagement:Update', 'api': '/api/dvadmin3_flow/flow_info/{id}/', 'method': 2},
                    {'name': '删除', 'value': 'flowManagement:Delete', 'api': '/api/dvadmin3_flow/flow_info/{id}/', 'method': 3},
                    {'name': '发布', 'value': 'flowManagement:Publish', 'api': '/api/dvadmin3_flow/flow_info/{id}/publish/', 'method': 1},
                ]
            },
            {
                'name': '流程列表',
                'icon': 'ele-Document',
                'sort': 2,
                'web_path': '/list',
                'component': 'plugins/dvadmin3_flow/flowList/index',
                'component_name': 'flowList',
                'menu_button': [
                    {'name': '查询', 'value': 'flowList:Search', 'api': '/api/dvadmin3_flow/flow_info/flow_list/', 'method': 0},
                ]
            },
            {
                'name': '我的待办',
                'icon': 'ele-Bell',
                'sort': 3,
                'web_path': '/todo',
                'component': 'plugins/dvadmin3_flow/flowTodo/index',
                'component_name': 'flowTodo',
                'menu_button': [
                    {'name': '查询', 'value': 'flowTodo:Search', 'api': '/api/dvadmin3_flow/flow_data/my_pending_handle/', 'method': 0},
                    {'name': '通过', 'value': 'flowTodo:Pass', 'api': '/api/dvadmin3_flow/flow_data/{id}/handle_pass/', 'method': 1},
                    {'name': '驳回', 'value': 'flowTodo:Reject', 'api': '/api/dvadmin3_flow/flow_data/{id}/handle_reject/', 'method': 1},
                ]
            },
            {
                'name': '我发起的',
                'icon': 'ele-Send',
                'sort': 4,
                'web_path': '/submitted',
                'component': 'plugins/dvadmin3_flow/flowSubmitted/index',
                'component_name': 'flowSubmitted',
                'menu_button': [
                    {'name': '查询', 'value': 'flowSubmitted:Search', 'api': '/api/dvadmin3_flow/flow_data/my_submitted/', 'method': 0},
                ]
            },
            {
                'name': '流程数据',
                'icon': 'ele-DocumentCopy',
                'sort': 5,
                'web_path': '/data',
                'component': 'plugins/dvadmin3_flow/flowData/index',
                'component_name': 'flowData',
                'menu_button': [
                    {'name': '查询', 'value': 'flowData:Search', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
                    {'name': '详情', 'value': 'flowData:Retrieve', 'api': '/api/dvadmin3_flow/flow_data/{id}/', 'method': 0},
                ]
            },
            {
                'name': '流程信息',
                'icon': 'ele-InfoFilled',
                'sort': 6,
                'web_path': '/info',
                'component': 'plugins/dvadmin3_flow/flowInfo/index',
                'component_name': 'flowInfo',
                'menu_button': [
                    {'name': '查询', 'value': 'flowInfo:Search', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
                    {'name': '详情', 'value': 'flowInfo:Retrieve', 'api': '/api/dvadmin3_flow/flow_info/{id}/', 'method': 0},
                ]
            },
        ]

        for menu_data in flow_menus:
            menu_buttons = menu_data.pop('menu_button', [])
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
                self.stdout.write(self.style.SUCCESS(f'  创建子菜单: {menu.name}'))
                # 创建按钮权限
                for button_data in menu_buttons:
                    MenuButton.objects.get_or_create(
                        menu=menu,
                        name=button_data['name'],
                        defaults={
                            'value': button_data['value'],
                            'api': button_data['api'],
                            'method': button_data['method'],
                        }
                    )
            else:
                self.stdout.write(f'  子菜单已存在: {menu.name}')

        # 为管理员角色分配菜单权限
        admin_role = Role.objects.filter(name='管理员').first()
        if admin_role:
            # 获取所有审批流程菜单（包括父菜单和子菜单）
            all_flow_menus = Menu.objects.filter(id=flow_parent.id) | Menu.objects.filter(parent=flow_parent)
            for menu in all_flow_menus:
                RoleMenuPermission.objects.get_or_create(
                    role=admin_role,
                    menu=menu
                )
            self.stdout.write(self.style.SUCCESS(f'已为管理员角色分配审批流程菜单权限 (共{all_flow_menus.count()}个菜单)'))
        else:
            self.stdout.write(self.style.WARNING('未找到管理员角色，跳过权限分配'))

        self.stdout.write(self.style.SUCCESS('审批流程菜单初始化完成！'))
