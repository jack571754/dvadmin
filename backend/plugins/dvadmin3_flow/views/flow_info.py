import importlib
from uuid import uuid4

from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Model, F, Q
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import Dept, Users, Role
from dvadmin.utils.filters import DataLevelPermissionsFilter
from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.string_util import random_str
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin3_flow.decorator import registered_functions, get_registered_flow_work
from dvadmin3_flow.models import FlowInfo, FlowNode


class FlowInfoSerializer(CustomModelSerializer):
    """
    流程管理 创建/更新时的列化器
    """
    content_type = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()

    def get_content_type(self, instance):
        if hasattr(instance, 'content_type') and instance.content_type is not None:
            return f"{instance.content_type.app_label}.{instance.content_type.model}"
        else:
            return ""

    def get_model_name(self, instance):
        if hasattr(instance, 'correlation_model_name') and instance.correlation_model_name is not None:
            app_label = instance.correlation_model_name.split('.')[0]
            model = instance.correlation_model_name.split('.')[-1]
            content_type_obj = ContentType.objects.filter(app_label=app_label, model=model).first()
            return content_type_obj.name
        return ""

    class Meta:
        model = FlowInfo
        fields = '__all__'


class FlowInfoViewSet(CustomModelViewSet):
    """
    流程管理接口:
    """
    queryset = FlowInfo.objects.filter(is_deleted=False)
    serializer_class = FlowInfoSerializer

    def list(self, request, *args, **kwargs):
        self.extra_filter_class = []
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['PUT'], detail=True, permission_classes=[IsAuthenticated])
    def put_status(self, request, pk):
        flow_info_obj = FlowInfo.objects.filter(id=pk).first()
        if not flow_info_obj:
            return ErrorResponse(msg="流程不存在")
        status = request.data.get('status')
        flow_info_obj.status = status
        flow_info_obj.save()
        return DetailResponse(data=None, msg="状态修改成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def flow_list(self, request, *args, **kwargs):
        """获取所有的动态表单流程"""
        _FlowInfo = FlowInfo.objects.filter(is_deleted=False,status=1)
        current_user = request.user
        result = []
        if current_user.is_superuser:
            queryset = _FlowInfo
            serializer = self.get_serializer(queryset, many=True, request=request)
            result = serializer.data
        else:
            current_user_dept = Dept.recursion_all_parent_dept(current_user.dept_id)
            current_user_role = current_user.role.values_list("id", flat=True)
            for flow_info in _FlowInfo:
                dept_info = flow_info.dept_info
                role_info = flow_info.role_info
                user_info = flow_info.user_info
                item = {
                        "id": flow_info.id,
                        "name": flow_info.name,
                        "icon": flow_info.icon,
                        "model_type": flow_info.model_type,
                        "operation":flow_info.operation
                }
                # 1.部门判定
                is_dept_ok = False
                is_role_ok = False
                if dept_info and set(current_user_dept) & set(dept_info):
                    is_dept_ok = True
                # 2.判定角色
                if role_info and set(current_user_role) & set(role_info):
                    is_role_ok = True
                print(not dept_info and not role_info and not user_info)
                if dept_info and role_info:
                    if is_dept_ok and is_role_ok:
                        result.append(item)
                elif role_info and is_role_ok:
                    result.append(item)
                elif dept_info and is_dept_ok:
                    result.append(item)
                elif not dept_info and not role_info and not user_info:
                    result.append(item)
                if user_info and current_user.id in user_info:
                    result.append(item)
        return DetailResponse(data=result, msg="获取成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def org_tree(self, request, *args, **kwargs):
        """
        获取组织架构列表
        """
        dept_id = self.request.query_params.get('deptId', None)
        type = self.request.query_params.get('type')
        dataPermission = self.request.query_params.get('dataPermission', 0)
        search = self.request.query_params.get('search', None)
        if str(dataPermission) == '1':
            self.extra_filter_class = [DataLevelPermissionsFilter]
        else:
            self.extra_filter_class = []
        if not type:
            return ErrorResponse(msg='参数错误')
        data = []
        if type == 'role':
            _Role = self.filter_queryset(Role.objects.all())
            for role in _Role:
                data.append({
                    "id": role.id,
                    "name": role.name,
                    "avatar": "",
                    "type": "role"
                })
            return DetailResponse(data=data, msg="获取成功")
        dept_ids = []
        filters = {}
        if dept_id is None or int(dept_id) == 0:
            filters['parent__isnull'] = True
        else:
            filters['parent_id'] = dept_id
        _Dept = self.filter_queryset(Dept.objects.filter(**filters))
        for dept in _Dept:
            data.append({
                "id": uuid4(),
                "dept_id": dept.id,
                "name": dept.name,
                "avatar": "",
                "type": "dept",
                "children": [],
                "disabled": True
            })
            dept_ids.append(dept.id)
        if type == 'dept':
            if str(dataPermission) == '1' and int(dept_id) == 0:
                _Dept = self.filter_queryset(Dept.objects.all())
            else:
                _Dept = self.filter_queryset(Dept.objects.filter(**filters))

        if type == 'user':
            if search is None:
                _Users = self.filter_queryset(Users.objects.filter(dept_id__in=[dept_id]))
            else:
                _Users = Users.objects.filter(
                    Q(name__icontains=search) | Q(username__icontains=search) | Q(mobile__icontains=search))
            for user in _Users:
                data.append({
                    "id": user.id,
                    "name": user.name,
                    "avatar": user.avatar,
                    "type": "user"
                })
        return DetailResponse(data=data, msg="获取成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def user_search(self, request, *args, **kwargs):
        """
        搜索用户
        """
        user_name = self.request.query_params.get('userName')
        if not user_name:
            return ErrorResponse(msg='参数错误')
        data = []

        for user in Users.objects.filter(name__icontains=user_name):
            data.append({
                "id": user.id,
                "name": user.name,
                "avatar": user.avatar,
                "type": "user"
            })
        return DetailResponse(data=data, msg="获取成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def get_all_flow_content_type(self, request, *args, **kwargs):
        """
        获取所有的model名称
        """
        data = []
        # 获取所有注册的app
        apps_list = apps.get_app_configs()
        #
        # # 遍历所有的app并获取其所有的model
        for app in apps_list:
            for model in app.get_models():
                if getattr(model, 'ONLY_PUBLIC_TENANTS', False):
                    continue
                if getattr(model, 'IS_FLOW', False):
                    fields = model._meta.get_fields()
                    field_list = []
                    for field in fields:
                        field_verbose_name = ""
                        if hasattr(field, 'verbose_name'):
                            field_verbose_name = field.verbose_name
                        choices = {}
                        if hasattr(field, 'choices') and field.choices:
                            for choice in field.choices:
                                choices[choice[0]] = choice[1]
                        field_list.append({
                            'name': field_verbose_name or field.name,
                            'key': field.name,
                            'type': field.__class__.__name__,
                            'choices': choices or None,
                            'columnShow':False
                        })
                    data.append({
                        "label": model._meta.verbose_name,
                        "value": str(model._meta),
                        "field_list": field_list
                    })
        return DetailResponse(data=data, msg="获取成功")

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_flow_process(self, request, pk):
        instance = FlowInfo.objects.get(id=pk)
        result = FlowNode.get_flow_node(instance)
        return DetailResponse(data=result)

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def get_model_fields(self, request):
        if not request.query_params.get('model_name'):
            return DetailResponse(data=[])
        app_label, model_name = request.query_params.get('model_name').split('.')
        try:
            # 获取模型类
            model_class = apps.get_model(app_label=app_label, model_name=model_name)
            # 检查是否为有效的模型
            if not issubclass(model_class, Model):
                raise ValueError(f"{model_name} is not a Django model.")
            # 获取模型的字段
            fields = model_class._meta.get_fields()
            # 如果你只想要字段的名字，可以这样做
            field_list = []
            for field in fields:
                field_verbose_name = ""
                if hasattr(field, 'verbose_name'):
                    field_verbose_name = field.verbose_name
                field_type = {
                    models.CharField: 'TextInput',
                    models.TextField: 'TextInput',
                    models.IntegerField: 'NumberInput',
                    models.FloatField: 'NumberInput',
                    models.BooleanField: 'BoolSelect',
                    models.DateTimeField: 'datetime',
                    # 添加更多字段类型映射...
                }.get(type(field), 'unknown')
                if field_type in ['unknown', 'datetime']:
                    continue
                field_list.append({
                    'label': field_verbose_name or field.name,
                    'value': field.name,
                    'type': field_type,
                    'key': field.name + '_' + random_str(6),
                })
            return DetailResponse(data=field_list)
        except LookupError as e:
            print(f"Model {model_name} not found in app {app_label}.")
            return DetailResponse(data=[])

    def create(self, request, *args, **kwargs):
        """
        创建审批流程
        """
        data = self.request.data
        if not data:
            return ErrorResponse(msg='流程数据不能为空')
        flow_id = data.get('id')
        if flow_id:
            flow_info_obj = FlowInfo.objects.get(id=flow_id)
        else:
            flow_info_obj = FlowInfo()
        flow_info_obj.name = data.get('name')
        flow_info_obj.icon = data.get('icon')
        flow_info_obj.operation = data.get('operation')
        flow_info_obj.form_conf = data.get('formConf')
        flow_info_obj.description = data.get('remark')
        flow_info_obj.model_type = data.get('model_type', 0)
        flow_info_obj.rule_status = data.get('rule_status', 1)
        flow_info_obj.dept_info = data.get('dept_info', {})
        flow_info_obj.role_info = data.get('role_info', {})
        flow_info_obj.user_info = data.get('user_info', {})
        flow_info_obj.exclude_fields = data.get('exclude_fields', [])
        flow_info_obj.enter_fields = data.get('enter_fields', [])
        # 保存 model 对象
        if data.get('model_type')==0 and data.get('content_type'):
            app_label = data.get('content_type').split('.')[0]
            model = data.get('content_type').split('.')[-1]
            content_type_obj = ContentType.objects.filter(app_label=app_label, model=model).first()
            flow_info_obj.content_type = content_type_obj
            flow_info_obj.correlation_model_name =data.get('content_type')

        if self.request.user:
            flow_info_obj.creator = self.request.user
            flow_info_obj.modifier = self.request.user.id
            flow_info_obj.dept_belong_id = self.request.user.dept_id
        flow_info_obj.save()
        all_node_ids = FlowNode.save_flow_node(data.get('process'), flow_info_obj)
        # 删除多余的 ids
        FlowNode.objects.filter(flow_info=flow_info_obj).exclude(node_id__in=all_node_ids).delete()
        return DetailResponse(msg="成功", data={'flow_id': flow_info_obj.id})

    def retrieve(self, request, *args, **kwargs):
        self.extra_filter_class = []
        instance = self.get_object()
        content_type = None
        if instance.content_type:
            content_type = f"{instance.content_type.app_label}.{instance.content_type.model}"
        data = {
            "id": instance.id,
            "content_type": instance.correlation_model_name,
            "correlation_model_name":instance.correlation_model_name,
            "formConf": instance.form_conf,
            "icon": instance.icon,
            "name": instance.name,
            "operation": instance.operation,
            "process": FlowNode.get_flow_node(instance),
            "remark": instance.description,
            "model_type":instance.model_type,
            "rule_status":instance.rule_status,
            "status":instance.status,
            "dept_info": instance.dept_info,
            "role_info": instance.role_info,
            "user_info": instance.user_info,
            "exclude_fields":instance.exclude_fields,
            "enter_fields":instance.enter_fields,
        }
        # 获取节点数据
        return DetailResponse(data=data, msg="获取成功")

    @action(methods=['POST'], detail=True, permission_classes=[IsAuthenticated])
    def publish(self, request, *args, **kwargs):
        """
        进行发布
        """
        instance = self.get_object()
        # 发布
        if instance.status == 1:
            return ErrorResponse(msg="该流程已发布")
        instance.status = 1
        instance.save()
        return DetailResponse(msg="发布成功")

    @action(methods=['POST'], detail=True, permission_classes=[IsAuthenticated])
    def unpublish(self, request, *args, **kwargs):
        """
        下架
        """
        instance = self.get_object()
        # 发布
        if instance.status == 1:
            return ErrorResponse(msg="该流程已下架")
        instance.status = 2
        instance.save()
        return DetailResponse(msg="下架成功")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return DetailResponse(data=[], msg="删除成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def get_end_function_list(self,request):
        """选择结束流程时执行的函数"""
        workflow_dict_list = get_registered_flow_work("end")
        return DetailResponse(data=workflow_dict_list, msg="获取成功")

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated])
    def get_approval_function_list(self, request):
        """选择审批流程时执行的函数"""
        workflow_dict_list = get_registered_flow_work("approval")
        return DetailResponse(data=workflow_dict_list, msg="获取成功")
