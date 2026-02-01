from django.contrib import admin
from .models import Category, Tag, Article, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'sort_order', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'color']
    search_fields = ['name']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'category', 'status', 'views_count', 'likes_count', 'is_top', 'created_time']
    search_fields = ['title']
    list_filter = ['status', 'is_top', 'category', 'created_time']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'article', 'user', 'content', 'is_active', 'created_time']
    list_filter = ['is_active', 'created_time']
