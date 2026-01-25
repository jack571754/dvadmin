from django.apps import AppConfig


class BookConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'dvadmin.book'
    verbose_name = '图书管理'
