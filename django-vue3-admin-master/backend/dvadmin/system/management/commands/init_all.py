# -*- coding: utf-8 -*-
"""
统一初始化命令 - 初始化所有模块的菜单和字典配置

使用方法:
    python manage.py init_all              # 初始化所有模块
    python manage.py init_all --reset      # 重置并重新初始化所有模块
"""

from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = '初始化所有模块的菜单和字典配置'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            dest='reset',
            default=False,
            help='重置并重新初始化所有数据',
        )
        parser.add_argument(
            '--modules',
            nargs='+',
            dest='modules',
            default=['system', 'blog', 'book'],
            help='指定要初始化的模块列表，默认: system blog book',
        )

    def handle(self, *args, **options):
        reset = options.get('reset', False)
        modules = options.get('modules', ['system', 'blog', 'book'])

        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('开始初始化所有模块...'))
        self.stdout.write('=' * 60)

        with transaction.atomic():
            for module in modules:
                self.stdout.write(f'\n正在初始化模块: {module}')
                self.stdout.write('-' * 40)

                try:
                    if module == 'system':
                        from dvadmin.system.fixtures.initialize import Initialize
                        Initialize(app='dvadmin.system', reset=reset).run()
                    elif module == 'blog':
                        from dvadmin.blog.fixtures.initialize import BlogInitialize
                        BlogInitialize(app='dvadmin.blog', reset=reset).run()
                    elif module == 'book':
                        from dvadmin.book.fixtures.initialize import BookInitialize
                        BookInitialize(app='dvadmin.book', reset=reset).run()
                    else:
                        self.stdout.write(self.style.WARNING(f'未知模块: {module}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'初始化模块 {module} 失败: {str(e)}'))

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('所有模块初始化完成！'))
        self.stdout.write('=' * 60)
