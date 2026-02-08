# -*- coding: utf-8 -*-
"""
定时任务菜单初始化命令

Usage:
    python manage.py init_celery_task_menu
"""

from django.core.management.base import BaseCommand
from dvadmin.system.models import Menu, Role, RoleMenuPermission, MenuButton, RoleMenuButtonPermission
from django.db import transaction


class Command(BaseCommand):
    help = '初始化定时任务管理菜单配置'

    def handle(self, *args, **options):
        with transaction.atomic():
            parent_menu, created = Menu.objects.update_or_create(
                web_path='/celeryTask',
                defaults={
                    'name': '定时任务',
                    'component': '',
                    'component_name': '',
                    'parent': None,
                    'is_catalog': True,
                    'icon': 'Timer',
                    'sort': 50,
                    'status': True,
                    'visible': True,
                    'is_affix': False,
                    'is_link': False,
                    'is_iframe': False
                }
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'[{action}] Parent menu: {parent_menu.name}')

            children_configs = [
                {
                    'name': '任务管理',
                    'web_path': '/celeryTask/task',
                    'component': 'system/celeryTask/index',
                    'component_name': 'celeryTask',
                    'icon': 'List',
                    'sort': 1,
                    'buttons': [
                        {'name': '查询', 'value': 'system:celeryTask:Query', 'api': '/api/system/celery_task/', 'method': 0},
                        {'name': '新增', 'value': 'system:celeryTask:Create', 'api': '/api/system/celery_task/', 'method': 1},
                        {'name': '编辑', 'value': 'system:celeryTask:Update', 'api': '/api/system/celery_task/{id}/', 'method': 2},
                        {'name': '删除', 'value': 'system:celeryTask:Delete', 'api': '/api/system/celery_task/{id}/', 'method': 3},
                    ]
                },
                {
                    'name': '执行记录',
                    'web_path': '/celeryTask/result',
                    'component': 'system/taskResult/index',
                    'component_name': 'taskResult',
                    'icon': 'Document',
                    'sort': 2,
                    'buttons': [
                        {'name': '查询', 'value': 'system:taskResult:Query', 'api': '/api/system/task_result/', 'method': 0},
                        {'name': '删除', 'value': 'system:taskResult:Delete', 'api': '/api/system/task_result/{id}/', 'method': 3},
                    ]
                },
            ]

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
                action = 'Created' if created else 'Updated'
                self.stdout.write(f'  [{action}] {child_menu.name}')

                for btn_config in config.get('buttons', []):
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
                        self.stdout.write(f'    [BTN] {btn_config["name"]}')

            # Assign permissions to admin role
            admin_role = Role.objects.filter(key__in=['admin', 'superadmin']).first()
            if not admin_role:
                admin_role = Role.objects.first()

            if admin_role:
                RoleMenuPermission.objects.get_or_create(role=admin_role, menu=parent_menu)
                for child in parent_menu.menu_set.all():
                    RoleMenuPermission.objects.get_or_create(role=admin_role, menu=child)
                    for button in child.menuPermission.all():
                        RoleMenuButtonPermission.objects.get_or_create(role=admin_role, menu_button=button)
                self.stdout.write(self.style.SUCCESS(f'Assigned permissions to role "{admin_role.name}"'))

        self.stdout.write(self.style.SUCCESS('Celery task menu initialization completed!'))
