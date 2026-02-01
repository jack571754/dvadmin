"""
博客模块菜单初始化脚本
在后台管理系统添加博客菜单
"""
import os
import sys

# 将 backend 目录添加到 Python 搜索路径
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'application.settings')

import django
django.setup()

from django.db import transaction
from dvadmin.system.models import Menu, MenuButton, Role, RoleMenuPermission, RoleMenuButtonPermission


def init_blog_menu():
    """
    初始化博客模块菜单
    """
    # 获取或创建博客父菜单
    blog_menu, created = Menu.objects.get_or_create(
        parent=None,
        name='博客管理',
        component='Layout',
        defaults={
            'web_path': 'blog',
            'component_name': 'blog',
            'icon': 'Document',
            'sort': 100,
            'status': True,
            'is_catalog': True,  # 是目录
            'is_link': False,
            'is_affix': False,
            'visible': True,
            'is_iframe': False,
        }
    )
    print(f"[{'Created' if created else 'Exists'}] 父菜单: 博客管理")

    # 定义子菜单
    # 注意：web_path 应该只包含子路径，前端会自动拼接父路径
    # 例如：父路径为 "blog"，子路径为 "category"，最终路径为 "blog/category"
    menus_data = [
        {
            'name': '分类管理',
            'component_name': 'blog:category',
            'web_path': 'category',  # 只包含子路径，不包含父路径
            'component': 'blog/category/index',
            'icon': 'FolderOpened',
            'sort': 1,
            'is_catalog': False,
        },
        {
            'name': '标签管理',
            'component_name': 'blog:tag',
            'web_path': 'tag',  # 只包含子路径
            'component': 'blog/tag/index',
            'icon': 'PriceTag',
            'sort': 2,
            'is_catalog': False,
        },
        {
            'name': '文章管理',
            'component_name': 'blog:article',
            'web_path': 'article',  # 只包含子路径
            'component': 'blog/article/index',
            'icon': 'Document',
            'sort': 3,
            'is_catalog': False,
        },
        {
            'name': '评论管理',
            'component_name': 'blog:comment',
            'web_path': 'comment',  # 只包含子路径
            'component': 'blog/comment/index',
            'icon': 'ChatDotRound',
            'sort': 4,
            'is_catalog': False,
        },
    ]

    # 按钮权限定义
    buttons_data = {
        'blog:category': ['blog:category:Create', 'blog:category:Update', 'blog:category:Delete', 'blog:category:Query'],
        'blog:tag': ['blog:tag:Create', 'blog:tag:Update', 'blog:tag:Delete', 'blog:tag:Query'],
        'blog:article': ['blog:article:Create', 'blog:article:Update', 'blog:article:Delete', 'blog:article:Query', 'blog:article:Publish'],
        'blog:comment': ['blog:comment:Create', 'blog:comment:Update', 'blog:comment:Delete', 'blog:comment:Query'],
    }

    button_names = {
        'blog:category:Create': '分类新增',
        'blog:category:Update': '分类编辑',
        'blog:category:Delete': '分类删除',
        'blog:category:Query': '分类查询',
        'blog:tag:Create': '标签新增',
        'blog:tag:Update': '标签编辑',
        'blog:tag:Delete': '标签删除',
        'blog:tag:Query': '标签查询',
        'blog:article:Create': '文章新增',
        'blog:article:Update': '文章编辑',
        'blog:article:Delete': '文章删除',
        'blog:article:Query': '文章查询',
        'blog:article:Publish': '文章发布',
        'blog:comment:Create': '评论新增',
        'blog:comment:Update': '评论编辑',
        'blog:comment:Delete': '评论删除',
        'blog:comment:Query': '评论查询',
    }

    created_count = 0

    with transaction.atomic():
        for menu_data in menus_data:
            # 检查菜单是否已存在
            existing_menu = Menu.objects.filter(
                parent=blog_menu,
                component_name=menu_data['component_name']
            ).first()

            if not existing_menu:
                menu = Menu.objects.create(
                    parent=blog_menu,
                    **menu_data,
                    status=True,
                    is_link=False,
                    is_affix=False,
                    visible=True,
                    is_iframe=False,
                )
                print(f"[Created] 子菜单: {menu_data['name']}")

                # 创建按钮权限
                for button_value in buttons_data.get(menu_data['component_name'], []):
                    MenuButton.objects.get_or_create(
                        menu=menu,
                        value=button_value,
                        defaults={
                            'name': button_names.get(button_value, button_value),
                            'api': f'/api/blog/{menu_data["component_name"].split(":")[1]}/',
                            'method': 0,  # GET
                        }
                    )
                created_count += 1
            else:
                print(f"[Exists] 子菜单: {menu_data['name']}")

    print(f"\n[*] 完成！共创建 {created_count} 个菜单")

    # 分配给超级管理员角色
    try:
        superadmin_role = Role.objects.filter(
            key__in=['superadmin', 'admin']
        ).first()

        if superadmin_role:
            blog_menus = Menu.objects.filter(parent=blog_menu)
            for menu in blog_menus:
                RoleMenuPermission.objects.get_or_create(
                    role=superadmin_role,
                    menu=menu
                )

                # 分配按钮权限
                for button in menu.menuPermission.all():
                    RoleMenuButtonPermission.objects.get_or_create(
                        role=superadmin_role,
                        menu_button=button
                    )

            print(f"[*] 已分配菜单权限给角色: {superadmin_role.name}")
    except Exception as e:
        print(f"[!] 分配权限时出错: {e}")

    return blog_menu


if __name__ == '__main__':
    init_blog_menu()
