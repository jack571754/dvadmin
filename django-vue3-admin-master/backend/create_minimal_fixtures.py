# -*- coding: utf-8 -*-
"""
创建精简的测试数据 Fixtures

只包含最基本的测试数据：
- 1 个部门
- 1 个角色
- 1 个用户
- 1 条图书记录
- 必要的权限配置
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'application.settings')
django.setup()

from dvadmin.system.models import Dept, Role, Users, Menu, MenuButton, RoleMenuPermission, RoleMenuButtonPermission
from dvadmin.book.models import Book, BookCategory, BookAuthor, BookPublisher
from django.db import transaction


@transaction.atomic
def create_minimal_data():
    print("Creating minimal test data...")

    # 1. Create Department
    dept, _ = Dept.objects.get_or_create(
        name='Technology Dept',
        defaults={'parent': None, 'sort': 1, 'status': True}
    )
    print(f"  Created Dept ID: {dept.id}")

    # 2. Create Role
    role, _ = Role.objects.get_or_create(
        key='user',
        defaults={'name': 'User', 'sort': 1, 'status': True}
    )
    print(f"  Created Role ID: {role.id}")

    # 3. Create User
    user, created = Users.objects.get_or_create(
        username='test',
        defaults={
            'name': 'Test User',
            'email': 'test@example.com',
            'is_active': True,
            'is_superuser': False,
        }
    )
    if created:
        user.set_password('test123456')
        user.dept = dept
        user.save()
        user.role.add(role)
    print(f"  Created User: {user.username} (test/test123456)")

    # 4. Create Book Menu Parent
    parent_menu, _ = Menu.objects.get_or_create(
        web_path='/book',
        defaults={
            'name': 'Book Management',
            'parent': None,
            'is_catalog': True,
            'icon': 'Reading',
            'sort': 10,
            'status': True,
            'visible': True,
        }
    )

    # 5. Create Book Menu
    book_menu, _ = Menu.objects.get_or_create(
        web_path='/book/book',
        defaults={
            'name': 'Books',
            'component': 'book/book/index',
            'component_name': 'bookBook',
            'parent': parent_menu,
            'is_catalog': False,
            'icon': 'Document',
            'sort': 1,
            'status': True,
            'visible': True,
        }
    )

    # 6. Create Button Permissions
    buttons = [
        {'name': 'Search', 'value': 'book:book:Search', 'api': '/api/book/book/', 'method': 0},
        {'name': 'Create', 'value': 'book:book:Create', 'api': '/api/book/book/', 'method': 1},
        {'name': 'Update', 'value': 'book:book:Update', 'api': '/api/book/book/{id}/', 'method': 2},
        {'name': 'Delete', 'value': 'book:book:Delete', 'api': '/api/book/book/{id}/', 'method': 3},
    ]

    for btn_config in buttons:
        button, _ = MenuButton.objects.get_or_create(
            menu=book_menu,
            value=btn_config['value'],
            defaults={
                'name': btn_config['name'],
                'api': btn_config['api'],
                'method': btn_config['method'],
            }
        )
        # Assign permission to role
        RoleMenuButtonPermission.objects.get_or_create(
            role=role,
            menu_button=button,
            defaults={'data_range': 1}  # Department data
        )
    print(f"  Created {len(buttons)} button permissions")

    # 7. Assign menu permissions
    RoleMenuPermission.objects.get_or_create(role=role, menu=parent_menu)
    RoleMenuPermission.objects.get_or_create(role=role, menu=book_menu)

    # 8. Create test book data
    category, _ = BookCategory.objects.get_or_create(
        name='Technology',
        defaults={'code': 'TECH', 'dept_belong_id': dept.id}
    )

    publisher, _ = BookPublisher.objects.get_or_create(
        name='Test Publisher',
        defaults={'code': 'TEST_PUB', 'dept_belong_id': dept.id}
    )

    author, _ = BookAuthor.objects.get_or_create(
        name='Test Author',
        defaults={'dept_belong_id': dept.id}
    )

    book, _ = Book.objects.get_or_create(
        isbn='9787111111111',
        defaults={
            'title': 'Test Book',
            'category': category,
            'publisher': publisher,
            'price': 99.00,
            'total_quantity': 10,
            'available_quantity': 10,
            'status': 0,
            'dept_belong_id': dept.id,
        }
    )
    book.authors.add(author)
    print(f"  Created Book ID: {book.id}")

    print("\nMinimal test data created successfully!")
    print(f"  Login: test / test123456")
    print(f"  Dept ID: {dept.id}")
    print(f"  Book dept_belong_id: {book.dept_belong_id}")


if __name__ == '__main__':
    create_minimal_data()
