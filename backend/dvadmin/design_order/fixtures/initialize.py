# 初始化
import json
import os
import sys

import django
from django.db import transaction

# 将后端根目录加入 PYTHONPATH，使其可被 `python manage.py init -A dvadmin.design_order` 直接调用
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
django.setup()

from dvadmin.system.fixtures.initSerializer import MenuInitSerializer
from dvadmin.system.models import (
    FieldPermission,
    Menu,
    MenuButton,
    MenuField,
    Role,
    RoleMenuButtonPermission,
    RoleMenuPermission,
)
from dvadmin.utils.core_initialize import CoreInitialize


OPERATION_MENU_COMPONENTS = {
    'productSpecSubmission',
    'productSpec',
}
OPERATION_BUTTON_VALUES = {
    'design_order:product_spec_submission:Search',
    'design_order:product_spec_submission:View',
    'design_order:product_spec_submission:Create',
    'design_order:product_spec_submission:Update',
    'design_order:product_spec_submission:Delete',
    'design_order:product_spec_submission:Copy',
    'design_order:product_spec_submission:AvailableTemplate',
    'design_order:product_spec:Save',
    'design_order:product_spec:Load',
    'design_order:product_spec:ReadTemplate',
    'design_order:design_workorder_archive:Search',
}
ICON_PRODUCT_VALIDATE_VALUE = 'design_order:icon_library:ProductValidate'
ICON_PRODUCT_VALIDATE_SOURCES = {
    'design_order:icon_library:Create',
    'design_order:icon_library:Update',
}
ICON_RESOLVE_VALUES = {
    'design_order:icon_library:Resolve',
    'design_order:icon_library:ResolveImageUrls',
}
ICON_RESOLVE_SOURCES = {
    'design_order:product_spec:Load',
    'design_order:product_spec:Save',
    'design_order:product_spec_submission:Search',
    'design_order:product_spec_submission:View',
}


class Initialize(CoreInitialize):
    """
    设计工单管理模块初始化。

    由 `python manage.py init` 或 `python manage.py init -A dvadmin.design_order` 触发，
    读取同目录 `init_menu.json`，幂等地初始化「设计工单管理」菜单树
    （含图标 icon、路由 component/component_name、菜单按钮 menu_button、字段权限 menu_field）。

    唯一性校验字段（与 system 一致）：
        ['name', 'web_path', 'component', 'component_name']
    """

    def clean_dirty_menus(self):
        """
        清理历史脏数据：design_order 顶级目录下 component_name 为空的子菜单。

        早期菜单缺失 component_name / icon，导致前端 dynamicImport 注册路由时
        name 为空、并产生重复路由。此处先删除这类脏记录，避免 init_base 按
        unique_fields（含 component_name）匹配时因空值不一致而重复新建。
        """
        root = Menu.objects.filter(name='设计工单管理', web_path='/design_order').first()
        if not root:
            return
        dirty = Menu.objects.filter(parent_id=root.id).filter(component_name__isnull=True) \
            | Menu.objects.filter(parent_id=root.id, component_name='')
        count = dirty.count()
        if count:
            dirty.delete()
            print(f"[design_order] 清理 {count} 条 component_name 为空的历史脏菜单")

    def init_menu(self):
        """
        初始化菜单信息（路由 + 图标 + 按钮 + 字段权限）
        """
        self.clean_dirty_menus()
        self.init_base(MenuInitSerializer, unique_fields=['name', 'web_path', 'component', 'component_name'])
        self.merge_noncanonical_relative_menus()
        self.sync_existing_child_menus()
        self.sync_icon_product_validation_permissions()
        self.sync_operation_permissions()
        self.sync_icon_resolve_permissions()

    @transaction.atomic
    def merge_noncanonical_relative_menus(self):
        """将无前导斜杠的历史页面菜单合并到规范的绝对路径菜单。"""
        root = Menu.objects.filter(
            name='\u8bbe\u8ba1\u5de5\u5355\u7ba1\u7406',
            web_path='/design_order',
        ).first()
        if not root:
            return

        relative_menus = list(
            Menu.objects.filter(parent_id=root.id)
            .exclude(web_path__startswith='/')
            .exclude(web_path__isnull=True)
        )
        merged_count = 0
        for duplicate in relative_menus:
            canonical = self.find_canonical_menu(duplicate)
            if not canonical:
                continue
            self.merge_menu_permissions(duplicate, canonical)
            duplicate.delete()
            merged_count += 1
        if merged_count:
            print(f"[design_order] merged {merged_count} noncanonical relative menus")

    @staticmethod
    def find_canonical_menu(duplicate):
        return Menu.objects.filter(
            parent_id=duplicate.parent_id,
            component=duplicate.component,
            component_name=duplicate.component_name,
            web_path=f'/{duplicate.web_path.lstrip("/")}',
        ).exclude(id=duplicate.id).first()

    def merge_menu_permissions(self, legacy, canonical):
        role_ids = RoleMenuPermission.objects.filter(
            menu=legacy,
        ).values_list('role_id', flat=True)
        for role_id in role_ids:
            RoleMenuPermission.objects.get_or_create(
                role_id=role_id,
                menu=canonical,
            )
        MenuButton.objects.filter(menu=legacy).update(menu=canonical)
        self.merge_menu_fields(legacy, canonical)

    def merge_menu_fields(self, legacy, canonical):
        for legacy_field in MenuField.objects.filter(menu=legacy):
            canonical_field = MenuField.objects.filter(
                menu=canonical,
                model=legacy_field.model,
                field_name=legacy_field.field_name,
            ).first()
            if not canonical_field:
                legacy_field.menu = canonical
                legacy_field.save(update_fields=['menu'])
                continue
            self.merge_field_permissions(legacy_field, canonical_field)
            legacy_field.delete()

    @staticmethod
    def merge_field_permissions(legacy_field, canonical_field):
        for permission in FieldPermission.objects.filter(field=legacy_field):
            target, created = FieldPermission.objects.get_or_create(
                role_id=permission.role_id,
                field=canonical_field,
                defaults={
                    'is_query': permission.is_query,
                    'is_create': permission.is_create,
                    'is_update': permission.is_update,
                },
            )
            if created:
                continue
            target.is_query = target.is_query or permission.is_query
            target.is_create = target.is_create or permission.is_create
            target.is_update = target.is_update or permission.is_update
            target.save(update_fields=['is_query', 'is_create', 'is_update'])

    def sync_operation_permissions(self):
        """保证运营角色可以访问规格提报列表及其隐藏编辑页。"""
        operation_role, _ = Role.objects.get_or_create(
            key='operation',
            defaults={'name': '运营', 'sort': 2, 'status': True},
        )
        menus = Menu.objects.filter(component_name__in=OPERATION_MENU_COMPONENTS)
        missing_components = OPERATION_MENU_COMPONENTS.difference(
            menus.values_list('component_name', flat=True)
        )
        if missing_components:
            raise Menu.DoesNotExist(
                f'规格提报权限依赖的菜单不存在: {sorted(missing_components)}'
            )
        for menu in menus:
            RoleMenuPermission.objects.get_or_create(role=operation_role, menu=menu)

        buttons = MenuButton.objects.filter(
            value__in=OPERATION_BUTTON_VALUES,
        )
        missing_values = OPERATION_BUTTON_VALUES.difference(
            buttons.values_list('value', flat=True)
        )
        if missing_values:
            raise MenuButton.DoesNotExist(
                f'规格提报权限依赖的按钮不存在: {sorted(missing_values)}'
            )
        for button in buttons:
            RoleMenuButtonPermission.objects.get_or_create(
                role=operation_role,
                menu_button=button,
            )

    def sync_icon_product_validation_permissions(self):
        """已有 Icon 新增或编辑权限的角色自动获得编码校验权限。"""
        target = MenuButton.objects.filter(value=ICON_PRODUCT_VALIDATE_VALUE).first()
        if not target:
            raise MenuButton.DoesNotExist(
                f'Icon 商品编码校验按钮不存在: {ICON_PRODUCT_VALIDATE_VALUE}'
            )
        role_ids = (
            RoleMenuButtonPermission.objects.filter(
                menu_button__value__in=ICON_PRODUCT_VALIDATE_SOURCES
            )
            .values_list('role_id', flat=True)
            .distinct()
        )
        for role_id in role_ids:
            RoleMenuButtonPermission.objects.get_or_create(
                role_id=role_id,
                menu_button=target,
            )

    def sync_icon_resolve_permissions(self):
        """规格提报相关角色自动获得 Icon 图片地址解析权限。"""
        targets = MenuButton.objects.filter(value__in=ICON_RESOLVE_VALUES)
        missing_values = ICON_RESOLVE_VALUES.difference(
            targets.values_list('value', flat=True)
        )
        if missing_values:
            raise MenuButton.DoesNotExist(
                f'Icon 解析按钮不存在: {sorted(missing_values)}'
            )
        role_ids = (
            RoleMenuButtonPermission.objects.filter(
                menu_button__value__in=ICON_RESOLVE_SOURCES
            )
            .values_list('role_id', flat=True)
            .distinct()
        )
        for target in targets:
            for role_id in role_ids:
                RoleMenuButtonPermission.objects.get_or_create(
                    role_id=role_id,
                    menu_button=target,
                )

    def sync_existing_child_menus(self):
        fixture_path = os.path.join(os.path.dirname(__file__), 'init_menu.json')
        with open(fixture_path, encoding='utf-8') as fixture_file:
            root_configs = json.load(fixture_file)

        for root_config in root_configs:
            root = Menu.objects.filter(
                name=root_config['name'],
                web_path=root_config['web_path'],
                component=root_config['component'],
                component_name=root_config['component_name'],
            ).first()
            if not root:
                continue
            for child_config in root_config.get('children', []):
                self.sync_child_menu(root, child_config)

    def sync_child_menu(self, root, child_config):
        lookup = {
            'parent_id': root.id,
            'name': child_config['name'],
            'web_path': child_config['web_path'],
            'component': child_config['component'],
            'component_name': child_config['component_name'],
        }
        instance = Menu.objects.filter(**lookup).first()
        if not instance:
            return
        payload = {**child_config, 'parent': root.id}
        serializer = MenuInitSerializer(
            instance,
            data=payload,
            request=self.request,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def run(self):
        self.init_menu()


if __name__ == "__main__":
    Initialize(app='dvadmin.design_order').run()
