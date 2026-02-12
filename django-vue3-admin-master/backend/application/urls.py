"""
Django后端URL路由配置文件

该文件定义了整个应用程序的URL路由规则，将不同的URL路径映射到相应的处理视图函数或类。
这是Django应用的核心配置文件之一，负责管理所有的API接口和页面访问路由。

主要功能包括：
1. 配置API文档界面（Swagger/Redoc）
2. 定义用户认证相关接口
3. 映射各个业务模块的API路由
4. 配置前端静态文件访问
5. 集成插件系统的URL模式

更多信息请参考Django官方文档：
https://docs.djangoproject.com/en/3.2/topics/http/urls/

使用示例说明：
函数视图配置示例：
    1. 从应用中导入视图函数：from my_app import views
    2. 使用path函数配置URL路由：path('', views.home, name='home')
    
基于类的视图配置示例：
    1. 从应用中导入视图类：from other_app.views import Home
    2. 使用as_view()方法配置URL路由：path('', Home.as_view(), name='home')
    
包含其他URL配置文件示例：
    1. 导入include函数：from django.urls import include, path
    2. 将子应用的URL配置包含进来：path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.static import serve
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from application import dispatch
from application import settings
from application.sse_views import sse_view
from dvadmin.system.views.dictionary import InitDictionaryViewSet
from dvadmin.system.views.login import (
    LoginView,
    CaptchaView,
    ApiLogin,
    LogoutView,
    LoginTokenView
)
from dvadmin.system.views.system_config import InitSettingsViewSet
from dvadmin.utils.swagger import CustomOpenAPISchemaGenerator

# =========== 系统初始化配置 =================
# 初始化系统基础配置参数
dispatch.init_system_config()
# 初始化系统字典数据
dispatch.init_dictionary()
# =========== 系统初始化配置结束 =================

# 根据调试模式设置API访问权限
# 调试模式下允许任意访问，生产环境下需要认证
permission_classes = [permissions.AllowAny, ] if settings.DEBUG else [permissions.IsAuthenticated, ]

# 配置API文档Schema视图
schema_view = get_schema_view(
    openapi.Info(
        title="Snippets API",           # API文档标题
        default_version="v1",           # 默认版本号
        description="Test description", # API描述信息
        terms_of_service="https://www.google.com/policies/terms/",  # 服务条款
        contact=openapi.Contact(email="contact@snippets.local"),    # 联系方式
        license=openapi.License(name="BSD License"),               # 授权协议
    ),
    public=True,                        # 是否公开访问
    permission_classes=permission_classes,  # 访问权限控制
    generator_class=CustomOpenAPISchemaGenerator,  # 自定义Schema生成器
)

# 前端页面相关导入
from django.http import Http404, HttpResponse
from django.shortcuts import render
import mimetypes
import os


def web_view(request):
    """
    渲染前端主页面的视图函数
    
    该函数负责渲染Vue.js前端应用的入口页面index.html
    所有前端路由都会指向这个页面，由前端Vue Router处理具体路由
    
    参数:
        request (HttpRequest): Django HTTP请求对象，包含请求的所有信息
        
    返回:
        HttpResponse: 渲染完成的HTML页面响应对象
    """
    return render(request, 'web/index.html')


def serve_web_files(request, filename):
    """
    提供前端静态资源文件服务的视图函数
    
    处理前端构建后的静态文件请求，如CSS、JavaScript、图片等资源文件
    支持根据文件扩展名自动识别MIME类型并正确返回文件内容
    
    参数:
        request (HttpRequest): Django HTTP请求对象
        filename (str): 请求的文件名，支持路径形式如 'css/style.css'
        
    返回:
        HttpResponse: 包含文件二进制内容和正确MIME类型的HTTP响应对象
        
    异常:
        Http404: 当请求的文件在服务器上不存在时抛出404错误
    """
    # 构建完整的文件物理路径
    filepath = os.path.join(settings.BASE_DIR, 'templates', 'web', filename)

    # 检查文件是否存在，不存在则返回404错误
    if not os.path.exists(filepath):
        raise Http404("请求的文件不存在")

    # 根据文件扩展名自动推断MIME类型（如text/css, application/javascript等）
    mime_type, _ = mimetypes.guess_type(filepath)

    # 以二进制模式打开文件并读取全部内容
    with open(filepath, 'rb') as f:
        # 创建HTTP响应对象，设置正确的Content-Type头部
        response = HttpResponse(f.read(), content_type=mime_type)
        return response


# 主要URL路由配置
urlpatterns = (
        [
            # API文档JSON/YAML格式接口
            re_path(
                r"^swagger(?P<format>\.json|\.yaml)$",
                schema_view.without_ui(cache_timeout=0),
                name="schema-json",
            ),
            # Swagger UI界面入口
            path(
                "",
                schema_view.with_ui("swagger", cache_timeout=0),
                name="schema-swagger-ui",
            ),
            # Redoc文档界面入口
            path(
                r"redoc/",
                schema_view.with_ui("redoc", cache_timeout=0),
                name="schema-redoc",
            ),
            # 系统管理模块API路由
            path("api/system/", include("dvadmin.system.urls")),
            # 图书管理模块API路由
            path("api/book/", include("dvadmin.book.urls")),
            # 博客管理模块API路由
            path("api/blog/", include("dvadmin.blog.urls")),
            # 用户登录认证接口
            path("api/login/", LoginView.as_view(), name="token_obtain_pair"),
            # 用户退出登录接口
            path("api/logout/", LogoutView.as_view(), name="token_obtain_pair"),
            # JWT Token刷新接口
            path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
            # Django REST Framework内置认证接口
            re_path(
                r"^api-auth/", include("rest_framework.urls", namespace="rest_framework")
            ),
            # 验证码获取接口
            path("api/captcha/", CaptchaView.as_view()),
            # 系统字典初始化接口
            path("api/init/dictionary/", InitDictionaryViewSet.as_view()),
            # 系统配置初始化接口
            path("api/init/settings/", InitSettingsViewSet.as_view()),
            # 第三方API登录接口
            path("apiLogin/", ApiLogin.as_view()),

            # 开发环境专用Token获取接口（生产环境应禁用）
            path("api/token/", LoginTokenView.as_view()),
            # 前端单页应用主页面路由
            path('web/', web_view, name='web_view'),
            # 前端静态资源文件路由
            path('web/<path:filename>', serve_web_files, name='serve_web_files'),
            # Server-Sent Events实时通信接口
            path('sse/', sse_view, name='sse'),
        ]
        # 添加媒体文件URL配置（用于上传文件访问）
        + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
        # 添加静态文件URL配置（用于CSS、JS等静态资源访问）
        + static(settings.STATIC_URL, document_root=settings.STATIC_URL)
        # 动态加载插件系统的URL模式配置
        + [re_path(ele.get('re_path'), include(ele.get('include'))) for ele in settings.PLUGINS_URL_PATTERNS]
)
