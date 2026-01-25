"""
审批流程模块菜单初始化命令
使用方法: python manage.py init_flow_menu
"""
from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, MenuButton, Role, RoleMenuPermission, RoleMenuButtonPermission


class Command(BaseCommand):
    help = '初始化审批流程菜单和权限'

    def handle(self, *args, **options):
        self.stdout.write('开始初始化审批流程菜单...')

        # 创建或获取审批流程父菜单
        flow_menu, created = Menu.objects.get_or_create(
            parent__isnull=True,
            name='审批管理',
            defaults={
                'name': '审批管理',
                'web_path': 'flow',
                'component': '',
                'component_name': '',
                'icon': 'ele-Tickets',
                'is_catalog': True,  # 目录
                'sort': 100,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建父菜单: {flow_menu.name}'))
        else:
            self.stdout.write(f'  父菜单已存在: {flow_menu.name}')

        # ========== 流程定义菜单 ==========
        flow_info_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='流程定义',
            defaults={
                'name': '流程定义',
                'web_path': 'flowInfo',
                'component': 'plugins/dvadmin3_flow/flowInfo/index',
                'component_name': 'flowInfo',
                'icon': 'ele-DocumentCopy',
                'is_catalog': False,  # 菜单
                'sort': 1,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_info_menu.name}'))

            # 创建流程定义按钮权限
            flow_buttons = [
                {'name': '查询', 'value': 'flowInfo:List', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
                {'name': '新增', 'value': 'flowInfo:Create', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 1},
                {'name': '编辑', 'value': 'flowInfo:Update', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 2},
                {'name': '删除', 'value': 'flowInfo:Delete', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 3},
                {'name': '详情', 'value': 'flowInfo:Retrieve', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
            ]

            for btn_data in flow_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_info_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建流程定义按钮权限'))

        # ========== 流程管理菜单（含流程设计器）==========
        flow_management_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='流程管理',
            defaults={
                'name': '流程管理',
                'web_path': 'flowManagement',
                'component': 'plugins/dvadmin3_flow/flowManagement/index',
                'component_name': 'flowManagement',
                'icon': 'ele-SetUp',
                'is_catalog': False,
                'sort': 2,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_management_menu.name}'))

            # 创建流程管理按钮权限
            management_buttons = [
                {'name': '查询', 'value': 'flowManagement:List', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
                {'name': '新增', 'value': 'flowManagement:Create', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 1},
                {'name': '编辑', 'value': 'flowManagement:Update', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 2},
                {'name': '删除', 'value': 'flowManagement:Delete', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 3},
                {'name': '设计流程', 'value': 'flowManagement:Design', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 0},
                {'name': '发布流程', 'value': 'flowManagement:Publish', 'api': '/api/dvadmin3_flow/flow_info/', 'method': 1},
            ]

            for btn_data in management_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_management_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建流程管理按钮权限'))

        # ========== 待办审批菜单 ==========
        flow_todo_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='待办审批',
            defaults={
                'name': '待办审批',
                'web_path': 'flowTodo',
                'component': 'plugins/dvadmin3_flow/flowTodo/index',
                'component_name': 'flowTodo',
                'icon': 'ele-Clock',
                'is_catalog': False,
                'sort': 3,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_todo_menu.name}'))

            # 创建待办审批按钮权限
            todo_buttons = [
                {'name': '查询', 'value': 'flowTodo:List', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
                {'name': '审批', 'value': 'flowTodo:Approve', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '拒绝', 'value': 'flowTodo:Reject', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '转交', 'value': 'flowTodo:Transfer', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
            ]

            for btn_data in todo_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_todo_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建待办审批按钮权限'))

        # ========== 已提交审批菜单 ==========
        flow_submitted_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='已提交审批',
            defaults={
                'name': '已提交审批',
                'web_path': 'flowSubmitted',
                'component': 'plugins/dvadmin3_flow/flowSubmitted/index',
                'component_name': 'flowSubmitted',
                'icon': 'ele-Finished',
                'is_catalog': False,
                'sort': 4,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_submitted_menu.name}'))

            # 创建已提交审批按钮权限
            submitted_buttons = [
                {'name': '查询', 'value': 'flowSubmitted:List', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
                {'name': '撤回', 'value': 'flowSubmitted:Withdraw', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '查看详情', 'value': 'flowSubmitted:Detail', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
            ]

            for btn_data in submitted_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_submitted_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建已提交审批按钮权限'))

        # ========== 流程数据菜单（我的审批）==========
        flow_data_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='我的审批',
            defaults={
                'name': '我的审批',
                'web_path': 'flowData',
                'component': 'plugins/dvadmin3_flow/flowData/index',
                'component_name': 'flowData',
                'icon': 'ele-Checked',
                'is_catalog': False,
                'sort': 5,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_data_menu.name}'))

            # 创建流程数据按钮权限
            flow_data_buttons = [
                {'name': '查询', 'value': 'flowData:List', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
                {'name': '新增', 'value': 'flowData:Create', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '编辑', 'value': 'flowData:Update', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 2},
                {'name': '删除', 'value': 'flowData:Delete', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 3},
                {'name': '提交', 'value': 'flowData:Submit', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '审批', 'value': 'flowData:Approve', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '拒绝', 'value': 'flowData:Reject', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
            ]

            for btn_data in flow_data_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_data_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建流程数据按钮权限'))

        # ========== 流程列表菜单 ==========
        flow_list_menu, created = Menu.objects.get_or_create(
            parent=flow_menu,
            name='流程列表',
            defaults={
                'name': '流程列表',
                'web_path': 'flowList',
                'component': 'plugins/dvadmin3_flow/flowList/index',
                'component_name': 'flowList',
                'icon': 'ele-List',
                'is_catalog': False,
                'sort': 6,
                'status': True,
                'visible': True,
                'is_link': False,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'√ 创建菜单: {flow_list_menu.name}'))

            # 创建流程列表按钮权限
            list_buttons = [
                {'name': '查询', 'value': 'flowList:List', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
                {'name': '发起流程', 'value': 'flowList:Start', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 1},
                {'name': '查看进度', 'value': 'flowList:Progress', 'api': '/api/dvadmin3_flow/flow_data/', 'method': 0},
            ]

            for btn_data in list_buttons:
                MenuButton.objects.get_or_create(
                    menu=flow_list_menu,
                    name=btn_data['name'],
                    defaults={
                        'name': btn_data['name'],
                        'value': btn_data['value'],
                        'api': btn_data['api'],
                        'method': btn_data['method'],
                    }
                )
            self.stdout.write(self.style.SUCCESS('  √ 创建流程列表按钮权限'))

        # 为管理员角色分配菜单权限
        try:
            admin_role = Role.objects.filter(name__icontains='管理员').first()
            if admin_role:
                # 为审批管理父菜单创建权限
                RoleMenuPermission.objects.get_or_create(
                    role=admin_role,
                    menu=flow_menu,
                    defaults={'creator': None, 'dept_belong_id': ''}
                )
                # 为所有子菜单创建权限
                for child_menu in Menu.objects.filter(parent=flow_menu):
                    RoleMenuPermission.objects.get_or_create(
                        role=admin_role,
                        menu=child_menu,
                        defaults={'creator': None, 'dept_belong_id': ''}
                    )
                    # 为所有按钮创建权限
                    for button in MenuButton.objects.filter(menu=child_menu):
                        RoleMenuButtonPermission.objects.get_or_create(
                            role=admin_role,
                            menu_button=button,
                            defaults={'creator': None, 'dept_belong_id': '', 'data_range': 0}
                        )
                self.stdout.write(self.style.SUCCESS('√ 为管理员角色分配审批菜单权限'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'[警告] 分配权限失败: {e}'))

        self.stdout.write(self.style.SUCCESS('\n[完成] 审批流程菜单初始化完成！'))
        self.stdout.write('\n已创建的菜单：')
        self.stdout.write('  1. 流程定义 - 设计和管理流程定义')
        self.stdout.write('  2. 流程管理 - 使用流程设计器设计流程')
        self.stdout.write('  3. 待办审批 - 查看和审批待处理的流程')
        self.stdout.write('  4. 已提交审批 - 查看已提交的审批记录')
        self.stdout.write('  5. 我的审批 - 我的审批数据管理')
        self.stdout.write('  6. 流程列表 - 发起和查看流程')
        self.stdout.write('\n接下来请：')
        self.stdout.write('1. 重新登录系统')
        self.stdout.write('2. 在左侧菜单中找到【审批管理】')
