# 初始化
import os
import sys
import django

# 将后端根目录加入 PYTHONPATH，使其可被 `python manage.py init -A dvadmin.design_order` 直接调用
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
django.setup()

from dvadmin.system.fixtures.initSerializer import MenuInitSerializer
from dvadmin.system.models import Menu
from dvadmin.utils.core_initialize import CoreInitialize


class Initialize(CoreInitialize):
    """
    设计工单管理模块初始化。

    由 `python manage.py init` 或 `python manage.py init -A dvadmin.design_order` 触发，
    读取同目录 `init_menu.json`，幂等地初始化「设计工单管理」菜单树
    （含图标 icon、路由 component/component_name、菜单按钮 menu_button、字段权限 menu_field）。

    唯一性校验字段（与 system / portfolio 一致）：
        ['name', 'web_path', 'component', 'component_name']
    """

    def clean_dirty_menus(self):
        """
        清理历史脏数据：design_order 顶级目录下 component_name 为空的子菜单。

        早期「规格书模板管理」菜单缺失 component_name / icon，导致前端 dynamicImport 注册
        路由时 name 为空、并产生重复路由。此处先删除这类脏记录，避免 init_base 按
        unique_fields（含 component_name）匹配时，因 null != 'productSpecTemplate' 而重复新建。
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

    def run(self):
        self.init_menu()


if __name__ == "__main__":
    Initialize(app='dvadmin.design_order').run()
