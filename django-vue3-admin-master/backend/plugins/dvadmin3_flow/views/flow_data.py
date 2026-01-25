import django_filters
from django.db.models import Q, F
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin3_flow.base_model import FlowBaseModel
from dvadmin3_flow.models import FlowData, FlowRecord, FlowAuditUsers, FlowNode, FlowInfo


class FlowDataSerializer(CustomModelSerializer):
    """
    流程管理 创建/更新时的列化器
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["current_node"] = instance.current_node
        data["status"] = instance.status
        data["start_user_name"] = instance.start_user and instance.start_user.name
        # 查询最新的一条记录表
        flow_record_obj = FlowRecord.objects.filter(flow_data_id=data.get('id')).order_by('-create_datetime').first()
        if flow_record_obj:
            data['pre_user'] = flow_record_obj.pre_user.all().values_list('name',flat=True)
            data['pre_dept'] = flow_record_obj.pre_dept.all().values_list('name',flat=True)
            data['pre_role'] = flow_record_obj.pre_role.all().values_list('name',flat=True)
        # 返回已审核人信息
        data['audit_users'] = FlowAuditUsers.objects.filter(flow_record__flow_data_id=data.get('id')).values('id',
                                                                                                             'audit_user',
                                                                                                             'status',
                                                                                                             'description',
                                                                                                             'create_datetime')
        return data

    class Meta:
        model = FlowData
        fields = ['id', 'no', 'name', 'models_name', 'start_user',
                  'completed_time', 'update_datetime', 'create_datetime','status']


class FlowDataCrudSerializer(CustomModelSerializer):
    """
    流程管理 创建/更新时的列化器
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # data["current_node"] = instance.current_node
        # data["status"] = instance.status
        # data["start_user_name"] = instance.start_user and instance.start_user.name
        # # 查询最新的一条记录表
        # flow_record_obj = FlowRecord.objects.filter(flow_data_id=data.get('id')).order_by('-create_datetime').first()
        # if flow_record_obj:
        #     data['pre_user'] = flow_record_obj.pre_user.all().values_list('name',flat=True)
        #     data['pre_dept'] = flow_record_obj.pre_dept.all().values_list('name',flat=True)
        #     data['pre_role'] = flow_record_obj.pre_role.all().values_list('name',flat=True)
        # # 返回已审核人信息
        # data['audit_users'] = FlowAuditUsers.objects.filter(flow_record__flow_data_id=data.get('id')).values('id',
        #                                                                                                      'audit_user',
        #                                                                                                      'status',
        #                                                                                                      'description',
        #                                                                                                      'create_datetime')
        if instance.flow_info.model_type==1:
            formData = instance.pre_change_content.get('formData')
            for key,value in formData.items():
                data[key] = value
        else:
            model_name = instance.flow_info.content_type.model
            formData = instance.pre_change_content.get('formData',{})
            for key, value in formData.items():
                data[f"{model_name}_{key}"] = value
        return data

    class Meta:
        model = FlowData
        exclude = ['pre_change_content','current_node','pre_user','pre_role','pre_dept']


class FlowDataFilter(django_filters.FilterSet):
    no = django_filters.CharFilter(field_name='no', lookup_expr='icontains')
    class Meta:
        model = None  # 需要在初始化时设置
        fields = []  # 初始为空，将在初始化时动态添加

    def filter_queryset(self, queryset):
        """
        重写filter_queryset方法，使得可以从query_params中解析出动态的过滤条件。
        """
        queryset = super().filter_queryset(queryset)
        request = self.request
        for key in request.query_params:
            if key.startswith('json_'):
                field_path = key.split('_', 1)[1]
                value = request.query_params.get(key)
                lookup_expression = f'pre_change_content__formData__{field_path}__icontains'
                queryset = queryset.filter(**{lookup_expression: value})
        return queryset


class FlowDataViewSet(FieldPermissionMixin, CustomModelViewSet):
    """
    流程管理接口:
    """
    queryset = FlowData.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = FlowDataSerializer
    extra_filter_class = []

    @action(methods=['get'], detail=False, permission_classes=[IsAuthenticated])
    def get_all_flow_data(self, request):
        """
        获取所有审批流程数据
        :param request:
        :return:
        """
        self.extra_filter_class = []
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['POST'], detail=True, permission_classes=[IsAuthenticated])
    def submit_flow_data(self, request, pk):
        """
        流程为动态表单时,提交的数据
        """
        flow_info_obj = FlowInfo.objects.filter(id=pk).first()
        if not flow_info_obj:
            return ErrorResponse(msg="流程不存在")
        flow_node_obj = FlowNode.objects.filter(flow_info=flow_info_obj, node_type='Start').first()
        users = request.user
        data = {
            "flow_info": flow_info_obj,
            "models_name": None,
            "pre_change_content": {
                "formData": request.data,
            },
            "current_node": flow_node_obj.node_dict,
            "start_user": users,
            "name": f"{users.name}发起的{flow_info_obj.name}的流程",
            "creator": users,
            "handler": users,
            "modifier": users.id,
            "dept_belong_id": users.dept_id,
        }
        flow_data_obj = FlowData.objects.create(**data)
        # 直接创建一条记录数据，并更新
        flow_record_obj = FlowRecord.objects.create(**{
            "flow_data_id": flow_data_obj.id,
            "current_node_id": flow_node_obj.node_id,
            "type": flow_node_obj.node_type,
            "status": 1,
            "parent_node_id": flow_node_obj.parent.node_id if flow_node_obj.parent else None,
        })
        if users:
            flow_record_obj.pre_user.set([users.id])
        FlowAuditUsers.objects.create(**{
            "flow_record": flow_record_obj,
            "audit_user": flow_data_obj.start_user,
            "status": 1,
            "description": "自动审核通过",
        })
        # 调用一次执行审批流程
        FlowBaseModel.process_engine(flow_data_obj.id)
        return DetailResponse(data=flow_data_obj.id, msg="提交成功")

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_pre_change_content(self,request,pk):
        """
        获取预审核数据
        """
        instance = FlowData.objects.get(id=pk)
        if instance.flow_info.model_type == 0:
            model_class = instance.flow_info.content_type.model_class()
            field_verbose_names = {}
            for field in model_class._meta.get_fields():
                if hasattr(field, 'verbose_name'):
                    field_verbose_names[field.name] = field.verbose_name
            print(field_verbose_names)

            update_fields = instance.pre_change_content.get("update_fields")
            print(update_fields)
            def get_verbose_names_from_dicts(dict1, dict2):
                verbose_names = {}
                for field, value in dict2.items():
                    if field in dict1:
                        verbose_names[dict1[field]] = value
                    else:
                        verbose_names[field] = value
                return verbose_names

            verbose_names = get_verbose_names_from_dicts(field_verbose_names, update_fields)
            print(verbose_names)
            instance.pre_change_content["form_data"]=verbose_names
            result = instance.pre_change_content
        else:
            result = instance.pre_change_content
        return DetailResponse(data={
            'model_type':instance.flow_info.model_type,
            'pre_change_content':result,
            'formConf':instance.flow_info.form_conf
        })

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_flow_record(self,request,pk):
        """
        获取审核记录
        """
        instance = FlowData.objects.get(id=pk)
        flow_record = FlowRecord.objects.filter(flow_data_id=pk).order_by("id")
        result = list()
        for record in flow_record:
            node_data = FlowNode.objects.filter(flow_info_id=instance.flow_info_id,node_id=record.current_node_id).values()
            audit_users = FlowAuditUsers.objects.filter(flow_record_id=record.id).values(name=F('audit_user__name'))
            result.append({
                "startUserName":instance.start_user.name,
                "nodeData":node_data[0],
                "auditUsers":audit_users,
                "preInfo":{
                    "pre_user": record.pre_user.all().values('id', 'name'),
                    "pre_dept": record.pre_dept.all().values('id', 'name'),
                    "pre_role": record.pre_role.all().values('id', 'name'),
                },
                "nodeStatus":record.status
            })
        return DetailResponse(data=result)

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_flow_process(self, request, pk):
        """
        获取流程图
        """
        instance = FlowData.objects.get(id=pk)
        result = FlowNode.get_flow_node(instance.flow_info)
        return DetailResponse(data=result)

    @action(methods=['get'], detail=False, permission_classes=[IsAuthenticated])
    def my_pending_handle(self, request):
        """
        获取待我处理数据
        :param request:
        :return:
        """
        # 0待我处理；1我已处理；2我已提交；3抄送我的
        status = int(request.query_params.get('handle_status', 0))
        filter = Q(flowrecord__pre_user__id=request.user.id)
        if request.user:
            filter |= Q(flowrecord__pre_role__id__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(flowrecord__pre_dept__id=request.user.dept.id)
        # queryset = self.filter_queryset(self.get_queryset())
        queryset = self.get_queryset()
        if status == 0:
            filter = Q(filter) & Q(flowrecord__status=0)
            queryset = queryset.filter(filter)
        elif status == 1:
            queryset = queryset.filter(flowrecord__flowauditusers__audit_user_id=request.user.id)
        elif status == 2:
            queryset = self.filter_queryset(self.get_queryset()).filter(start_user=self.request.user).filter(filter)
        elif status == 3:
            filter = Q(filter) & Q(flowrecord__type='Cc')
            queryset = queryset.filter(filter)
        page = self.paginate_queryset(queryset.distinct())
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['post'], detail=True, permission_classes=[IsAuthenticated])
    def handle_pass(self, request,pk, *args, **kwargs):
        """
        处理通过
        :param request:
        :return:
        """
        reason = request.data.get("reason","无")
        instance = FlowData.objects.get(id=pk)
        if instance.status != 0:
            return ErrorResponse(msg="流程数据状态错误")
        filter = Q(flowrecord__pre_user=request.user.id)
        if request.user:
            filter |= Q(flowrecord__pre_role__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(flowrecord__pre_dept=request.user.dept.id)
        if not FlowData.objects.filter(id=instance.id).filter(filter).exists():
            return ErrorResponse(msg="当前数据您无权限审核")
        # 进行审核
        flow_record_obj = FlowRecord.objects.filter(flow_data=instance.id).first()
        flow_record_obj.status = 1
        flow_record_obj.save()
        flow_record_obj.save()
        FlowAuditUsers.objects.create(**{
            "flow_record": flow_record_obj,
            "audit_user": self.request.user,
            "status": 1,
            "description": f"审核通过,处理意见:{reason}",
        })

        return DetailResponse(data=None, msg="处理通过")

    @action(methods=['post'], detail=True, permission_classes=[IsAuthenticated])
    def handle_reject(self, request, pk,*args, **kwargs):
        """
        处理驳回
        :param request:
        :return:
        """
        reason = request.data.get("reason")
        instance = FlowData.objects.get(id=pk)
        if instance.status != 0:
            return ErrorResponse(msg="流程数据状态错误")
        filter = Q(flowrecord__pre_user=request.user.id)
        if request.user:
            filter |= Q(flowrecord__pre_role__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(flowrecord__pre_dept=request.user.dept.id)
        if not FlowData.objects.filter(id=instance.id).filter(filter).exists():
            return ErrorResponse(msg="当前数据您无权限审核")
        # 进行审核
        flow_record_obj = FlowRecord.objects.filter(flow_data=instance.id).first()
        flow_record_obj.status = 2
        flow_record_obj.save()
        FlowAuditUsers.objects.create(**{
            "flow_record": flow_record_obj,
            "audit_user": self.request.user,
            "status": 2,
            "description": reason,
        })
        return DetailResponse(data=None, msg="处理驳回")

    @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated])
    def handle_cancel(self, request, *args, **kwargs):
        """
        审核撤销
        :param request:
        :return:
        """
        instance = FlowData.objects.get(id=request.data.get('id'))
        if instance.status != 0:
            return ErrorResponse(msg="流程数据状态错误")
        filter = Q(flowrecord__pre_user=request.user.id)
        if request.user:
            filter |= Q(flowrecord__pre_role__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(flowrecord__pre_dept=request.user.dept.id)
        if not FlowData.objects.filter(id=instance.id).filter(filter).exists():
            return ErrorResponse(msg="当前数据您无权限审核")
        # 进行审核撤销
        flow_record_obj = FlowRecord.objects.filter(flow_data=instance.id).first()
        flow_record_obj.status = 3
        flow_record_obj.save()
        FlowAuditUsers.objects.create(**{
            "flow_record": flow_record_obj,
            "audit_user": self.request.user,
            "status": 3,
            "description": "手动审核撤销",
        })
        return DetailResponse(data=None, msg="处理驳回")


    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_crud_columns(self, request, pk):
        """
        发起流程中查看数据的表格列设置
        """
        instance = FlowInfo.objects.filter(id=pk).first()
        if not instance:
            return ErrorResponse(msg="流程不存在")
        model_type = instance.model_type
        if model_type==0:
            conf = instance.form_conf
            components = conf.get("components")
            result = {}
            model_name = instance.content_type.model
            for component in components:
                key = component.get('key')
                title = component.get('name')
                colunmShow = component.get('columnShow')
                if colunmShow:
                    result[f"{model_name}_{key}"] = {
                        "title": title,
                        "type": "text",
                        "column": {
                            "order": 0
                        }
                    }
            return DetailResponse(data=result, msg="获取成功")
        else:
            conf = instance.form_conf
            components = conf.get("components")
            result = {}
            for component in components:
                key = component.get('key')
                title = component.get('name')
                result[f'json_{key}'] = {
                    "title": title,
                    "type": "text",
                    "search": {
                        "show": True,
                    },
                    "column": {
                        "show":False
                    }
                }
                result[key] = {
                    "title":title,
                    "type":"text",
                    "column":{
                        "order":0
                    }
                }
            return DetailResponse(data=result, msg="获取成功")

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_crud_data(self, request, pk):
        """
        发起流程中的数据详情查看
        """
        instance = FlowInfo.objects.filter(id=pk).first()
        if not instance:
            return ErrorResponse(msg="流程不存在")
        model_type = instance.model_type
        queryset = FlowData.objects.filter(flow_info=instance.id)
        self.filter_class = FlowDataFilter
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = FlowDataCrudSerializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = FlowDataCrudSerializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")


