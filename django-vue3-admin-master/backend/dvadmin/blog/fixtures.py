"""
博客模块初始化脚本
添加 API 白名单配置
"""
from dvadmin.system.models import ApiWhiteList


def init_blog_api_whitelist():
    """
    初始化博客模块 API 白名单
    """
    api_list = [
        # 用户注册接口（公开）
        {
            'url': '/api/blog/register/',
            'method': 1,  # POST
            'enable_datasource': False
        },
        # 文章列表（公开）
        {
            'url': '/api/blog/articles/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 文章详情（公开）
        {
            'url': '/api/blog/articles/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 热门文章（公开）
        {
            'url': '/api/blog/articles/hot/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 点赞文章（公开）
        {
            'url': '/api/blog/articles/',
            'method': 1,  # POST
            'enable_datasource': False
        },
        # 分类列表（公开）
        {
            'url': '/api/blog/categories/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 标签列表（公开）
        {
            'url': '/api/blog/tags/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 评论列表（公开）
        {
            'url': '/api/blog/comments/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 文章评论列表（公开）
        {
            'url': '/api/blog/comments/by_article/',
            'method': 0,  # GET
            'enable_datasource': False
        },
        # 创建评论（需要登录，不需要白名单）
        # {
        #     'url': '/api/blog/comments/',
        #     'method': 1,  # POST
        #     'enable_datasource': False
        # },
    ]

    created_count = 0
    for api_data in api_list:
        url = api_data['url']
        method = api_data['method']

        # 检查是否已存在
        exists = ApiWhiteList.objects.filter(url=url, method=method).exists()
        if not exists:
            ApiWhiteList.objects.create(**api_data)
            created_count += 1
            print(f"[+] Added: {url} [{['GET', 'POST', 'PUT', 'DELETE'][method]}]")
        else:
            print(f"[=] Exists: {url} [{['GET', 'POST', 'PUT', 'DELETE'][method]}]")

    print(f"\n[*] Done! Added {created_count} whitelist records")


if __name__ == '__main__':
    import django
    import os

    # 设置 Django 环境
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'application.settings')
    django.setup()

    init_blog_api_whitelist()
