import os
from pathlib import Path
from application import settings

# ================================================= #
# ***************** 插件配置区开始 *******************
# ================================================= #
# 路由配置
plugins_url_patterns = [
    {"re_path": r'api/dvadmin3_flow/', "include": "dvadmin3_flow.urls"},
]
# app 配置
apps = ['dvadmin3_flow']
# 租户模式中，public模式共享app配置
tenant_shared_apps = []
# 只在普通租户建表，public中无表
tenant_exclusive_apps = ['dvadmin3_flow']
# ================================================= #
# ******************* 插件配置区结束 *****************
# ================================================= #

# ********** 赋值到 settings 中 **********
if not hasattr(settings, 'TENANT_SHARED_APPS'):
    settings.TENANT_SHARED_APPS = []
if not hasattr(settings, 'TENANT_EXCLUSIVE_APPS'):
    settings.TENANT_EXCLUSIVE_APPS = []
settings.TENANT_SHARED_APPS += tenant_shared_apps
settings.TENANT_EXCLUSIVE_APPS += tenant_exclusive_apps
settings.INSTALLED_APPS += [app for app in apps if app not in settings.INSTALLED_APPS]
# ********** 注册路由 **********
settings.PLUGINS_URL_PATTERNS += plugins_url_patterns
# ********** 添加前端模板 ***********
settings.TEMPLATES[0]["DIRS"].append(os.path.join(Path(__file__).resolve().parent, "templates"))
settings.STATICFILES_DIRS.append(os.path.join(Path(__file__).resolve().parent, "static"))
