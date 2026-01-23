# 存储所有注册的函数及其名称
import importlib
from functools import lru_cache
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局变量，存储注册的函数
registered_functions = {}
# 缓存已导入的模块
imported_modules = {}

@lru_cache(maxsize=None)
def load_workflow_modules():
    """
    加载所有应用的 workflow 模块，并缓存结果。
    """
    from application import settings
    if not hasattr(settings, 'INSTALLED_APPS') or not isinstance(settings.INSTALLED_APPS, (list, tuple)):
        logger.error("settings.INSTALLED_APPS 未正确配置")
        return {}

    modules = {}
    for app in settings.INSTALLED_APPS:
        try:
            module = importlib.import_module(f'{app}.workflow')
            modules[app] = module
        except ImportError as e:
            logger.warning(f"无法导入模块 {app}.workflow: {e}")
    return modules


def flow_work(name=None):
    """
    装饰器，用于给函数添加额外的功能，并允许通过名称注册。
    :param name: 字符串，用来描述函数。
    :return: 返回装饰器。
    """
    def decorator(func):
        # 使用提供的名字或默认的函数名作为键值
        func_name = func.__name__

        # 检查是否已经注册过同名函数
        if func_name in registered_functions:
            logger.warning(f"函数 {func_name} 已经被注册，将覆盖原有注册项")

        # 注册函数
        registered_functions[func_name] = {
            "name": name or func_name,
            "func": func
        }

        def wrapper(*args, **kwargs):
            print(f"开始执行 {func_name}...")
            result = func(*args, **kwargs)
            print(f"{func_name} 执行完毕.")
            return result

        return wrapper

    return decorator


def get_registered_flow_work():
    """
    获取所有注册的 flowwork 函数名。
    """
    # 确保模块已加载
    load_workflow_modules()

    workflow_dict_list = []
    for key, value in registered_functions.items():
        workflow_dict_list.append({
            "label": f'{value["name"]}',
            "value": f'{key}'
        })
    return workflow_dict_list


def run_flow_work(name, *args, **kwargs):
    """
    执行指定名称的 flowwork 函数。
    """
    # 确保模块已加载
    load_workflow_modules()

    # 检查函数是否存在
    func_info = registered_functions.get(name)
    if not func_info:
        raise ValueError(f"工作流函数 '{name}' 没有找到!")

    # 提取并调用函数
    func = func_info.get("func")
    if not callable(func):
        raise TypeError(f"注册项 '{name}' 不是可调用对象")

    return func(*args, **kwargs)
