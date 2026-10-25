import importlib
from enum import Enum
from functools import lru_cache
import logging
import threading

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局变量，存储注册的函数
registered_functions = {}
# 缓存已导入的模块
imported_modules = {}

# 线程锁，确保注册函数时线程安全
registration_lock = threading.RLock()

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


def flow_work(name=None,type=None):
    """
    装饰器，用于给函数添加额外的功能，并允许通过名称注册。
    :param name: 字符串，用来描述函数。
    :return: 返回装饰器。
    """
    def TypeEnum(type):
        type_map = {
            "end": "end",
            "approval": "approval",
        }
        return type_map.get(type, "end")


    def decorator(func):
        print("name",name)
        func_name = func.__name__

        with registration_lock:
            if func_name in registered_functions:
                logger.warning(f"函数 {func_name} 已经被注册，将覆盖原有注册项")
            registered_functions[func_name] = {
                "name": name,
                "func": func,
                "type": TypeEnum(type),
            }

        def wrapper(*args, **kwargs):
            logger.info(f"开始执行 {func_name}，参数: args={args}, kwargs={kwargs}")
            result = func(*args, **kwargs)
            logger.info(f"{func_name} 执行完毕.")
            return result

        return wrapper

    return decorator


def get_registered_flow_work(type=None):
    """
    获取所有注册的 flowwork 函数名。
    """
    # 确保模块已加载
    load_workflow_modules()
    if type is None:
        return [{"label": info["name"], "value": key, "type": info["type"]} for key, info in registered_functions.items()]
    return [{"label": info["name"], "value": key, "type": info["type"]} for key, info in registered_functions.items() if info["type"] == type]


def run_flow_work(name, *args, **kwargs):
    """
    执行指定名称的 flowwork 函数。
    """
    # 确保模块已加载
    load_workflow_modules()
    func_info = registered_functions.get(name)
    if not func_info:
        raise ValueError(f"工作流函数 '{name}' 没有找到!")

    func = func_info.get("func")
    if not callable(func):
        raise TypeError(f"注册项 '{name}' 不是可调用对象")

    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.exception(f"执行工作流函数 '{name}' 时发生异常: {e}")
        raise
