# 博客模块初始化
import os
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")

import django
django.setup()

from django.apps import apps
from django.core.management import call_command
from dvadmin.utils.core_initialize import CoreInitialize
from dvadmin.system.fixtures.initSerializer import MenuInitSerializer, DictionaryInitSerializer


class BlogInitialize(CoreInitialize):
    """博客模块初始化类"""

    def init_blog_menu(self):
        """
        初始化博客菜单和按钮权限
        """
        print("[*] 正在初始化博客菜单...")
        # 使用 MenuInitSerializer 加载菜单配置
        path_file = os.path.join(
            apps.get_app_config('blog').path,
            'fixtures',
            'init_blog_menu.json'
        )
        if not os.path.isfile(path_file):
            print(f"[!] 文件不存在: {path_file}")
            return
        
        with open(path_file, encoding="utf-8") as f:
            menu_data = json.load(f)
        
        for data in menu_data:
            # 检查菜单是否已存在
            filter_data = {
                "name": data['name'],
                "web_path": data['web_path'],
                "component": data.get('component', ''),
                "component_name": data.get('component_name', ''),
            }
            from dvadmin.system.models import Menu
            instance = Menu.objects.filter(**filter_data).first()
            data["reset"] = self.reset
            serializer = MenuInitSerializer(instance, data=data, request=self.request)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        
        print("[✓] 博客菜单初始化完成")

    def init_blog_dictionary(self):
        """
        初始化博客字典
        """
        print("[*] 正在初始化博客字典...")
        # 使用 DictionaryInitSerializer 加载字典配置
        path_file = os.path.join(
            apps.get_app_config('blog').path,
            'fixtures',
            'init_blog_dictionary.json'
        )
        if not os.path.isfile(path_file):
            print(f"[!] 文件不存在: {path_file}")
            return
        
        with open(path_file, encoding="utf-8") as f:
            dict_data = json.load(f)
        
        for data in dict_data:
            # 检查字典是否已存在
            filter_data = {
                "value": data['value'],
                "parent": None
            }
            from dvadmin.system.models import Dictionary
            instance = Dictionary.objects.filter(**filter_data).first()
            data["reset"] = self.reset
            serializer = DictionaryInitSerializer(instance, data=data, request=self.request)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        
        print("[✓] 博客字典初始化完成")

    def run(self):
        """执行初始化"""
        print("=" * 50)
        print("开始初始化博客模块...")
        print("=" * 50)

        self.init_blog_menu()
        self.init_blog_dictionary()

        print("=" * 50)
        print("🎉 博客模块初始化完成！")
        print("=" * 50)


if __name__ == "__main__":
    BlogInitialize(app='dvadmin.blog').run()
