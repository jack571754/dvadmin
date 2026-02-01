"""
博客过滤器
"""
from django_filters import rest_framework as filters
from .models import Article


class ArticleFilter(filters.FilterSet):
    """
    文章过滤器
    """
    title = filters.CharFilter(field_name='title', lookup_expr='icontains', help_text='标题模糊搜索')
    category = filters.NumberFilter(field_name='category', help_text='分类ID')
    tags = filters.NumberFilter(field_name='tags', help_text='标签ID')
    status = filters.ChoiceFilter(
        field_name='status',
        choices=Article.STATUS_CHOICES,
        help_text='文章状态'
    )
    created_time_start = filters.DateTimeFilter(field_name='create_datetime', lookup_expr='gte', help_text='创建时间-开始')
    created_time_end = filters.DateTimeFilter(field_name='create_datetime', lookup_expr='lte', help_text='创建时间-结束')

    class Meta:
        model = Article
        fields = ['title', 'category', 'tags', 'status', 'is_top', 'created_time_start', 'created_time_end']
