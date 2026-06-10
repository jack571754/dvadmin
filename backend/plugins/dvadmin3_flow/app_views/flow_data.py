from django.db import models
from django.db.models import Q, F
from django.db.models.functions import TruncDay
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import Dept, Users
from dvadmin.utils.filters import DataLevelPermissionsFilter
from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin3_flow.base_model import FlowBaseModel
from dvadmin3_flow.models import FlowData, FlowRecord, FlowAuditUsers, FlowNode, FlowInfo


def flow_data_page(request):
    """
    审批流处理页面
    """
    return render(request,'flow_data.html')

def flow_data_detail_page(request):
    """
    审批流详情页面
    """
    return render(request,'flow_data_detail.html')

class AppFlowDataSerializer(CustomModelSerializer):
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
            data['pre_user'] = flow_record_obj.pre_user.all().values('id', 'name')
            data['pre_dept'] = flow_record_obj.pre_dept.all().values('id', 'name')
            data['pre_role'] = flow_record_obj.pre_role.all().values('id', 'name')
        # 返回已审核人信息
        data['audit_users'] = FlowAuditUsers.objects.filter(flow_record__flow_data_id=data.get('id')).values('id',
                                                                                                             'audit_user',
                                                                                                             'status',
                                                                                                             'description',
                                                                                                             'create_datetime')
        # 返回流程内容
        data["form_conf"] =  instance.flow_info.form_conf
        # 格式化外键
        if instance.flow_info.model_type == 0:
            model_class = instance.flow_info.content_type.model_class()
            field_verbose_names = {}
            update_fields = instance.pre_change_content.get("update_fields")
            update_id = update_fields.get('id')
            if update_id:
                instance_obj = model_class.all_objects.filter(id=update_id).first()
                for field in model_class._meta.get_fields():
                    if hasattr(field, 'verbose_name'):
                        field_verbose_names[field.name] = field.verbose_name
                    if field.name == 'modifier':
                        users = Users.objects.filter(id=update_fields['modifier']).first()
                        if users:
                            update_fields['modifier'] = users.name
                    if field.name == 'dept_belong_id':
                        dept = Dept.objects.filter(id=update_fields['dept_belong_id']).first()
                        if dept:
                            update_fields['dept_belong_id'] = dept.name
                    if isinstance(field, models.ForeignKey):
                        related_instance = getattr(instance_obj, field.name, None)
                        if related_instance:
                            related_field_value = getattr(related_instance, 'name', None)
                            update_fields[field.name] = related_field_value
        return data

    class Meta:
        model = FlowData
        fields = ['id', 'no', 'name', 'models_name', 'start_user',
                  'completed_time', 'update_datetime', 'create_datetime','pre_change_content']


class AppFlowDataViewSet(CustomModelViewSet):
    """
    流程管理接口:
    """
    queryset = FlowData.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = AppFlowDataSerializer
    search_fields = ['name']
    extra_filter_class = []

    @action(methods=['get'], detail=False, permission_classes=[IsAuthenticated])
    def get_flow_data(self, request):
        """
        获取待我处理数据
        :param request:
        :return:
        """
        # 0待我处理；1我已处理；2我已提交；3抄送我的
        status = int(request.query_params.get('handle_status', 0))
        filter = Q(pre_user__id=request.user.id)
        if request.user:
            filter |= Q(pre_role__id__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(pre_dept__id=request.user.dept.id)
        queryset = self.get_queryset()
        if status == 0:
            flow_data_ids = FlowRecord.objects.filter(filter, status=0).values_list('flow_data__id', flat=True)
            filter = Q(id__in=flow_data_ids)
            self.extra_filter_class = [DataLevelPermissionsFilter]
            queryset = self.filter_queryset(queryset.filter(filter))
        elif status == 1:
            flow_record_ids = FlowAuditUsers.objects.filter(audit_user=request.user.id, status__in=[1, 2]).values_list(
                'flow_record_id', flat=True)
            flow_data_ids = FlowRecord.objects.filter(id__in=flow_record_ids, type='Approval').values_list(
                'flow_data_id', flat=True)
            queryset = queryset.filter(id__in=flow_data_ids)
        elif status == 2:
            queryset = self.filter_queryset(self.get_queryset()).filter(start_user=self.request.user)
        elif status == 3:
            filter = Q(filter) & Q(flowrecord__type='Cc')
            queryset = queryset.filter(filter)
        page = self.paginate_queryset(queryset.distinct())
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")


    @action(methods=['get'], detail=False,permission_classes=[IsAuthenticated])
    def handle_to_me(self, request):
        """
        待我处理
        """
        filter = Q(pre_user__id=request.user.id)
        if request.user:
            filter |= Q(pre_role__id__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(pre_dept__id=request.user.dept.id)
        flow_data_ids = FlowRecord.objects.filter(filter, status=0).values_list('flow_data__id', flat=True)
        filter = Q(id__in=flow_data_ids)
        # self.extra_filter_class = [DataLevelPermissionsFilter]
        queryset = self.filter_queryset(FlowData.objects.filter(filter))
        page = self.paginate_queryset(queryset.distinct())
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['get'], detail=False)
    def get_handle_to_me_count(self, request):
        filter = Q(pre_user__id=request.user.id)
        if request.user:
            filter |= Q(pre_role__id__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(pre_dept__id=request.user.dept.id)
        flow_data_ids = FlowRecord.objects.filter(filter, status=0).values_list('flow_data__id', flat=True)
        filter = Q(id__in=flow_data_ids)
        queryset = self.filter_queryset(FlowData.objects.filter(filter)).count()
        return DetailResponse(data={
            "count": queryset
        }, msg="获取成功")
    @action(methods=['get'], detail=False)
    def handle_completed(self, request):
        """
        我已处理
        """
        flow_record_ids = FlowAuditUsers.objects.filter(audit_user=request.user.id, status__in=[1, 2]).values_list(
            'flow_record_id', flat=True)
        flow_data_ids = FlowRecord.objects.filter(id__in=flow_record_ids, type='Approval').values_list(
            'flow_data_id', flat=True)
        queryset = self.get_queryset().filter(id__in=flow_data_ids)
        page = self.paginate_queryset(queryset.distinct())
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['get'], detail=False)
    def handle_my_submit(self, request):
        """
        我发起的
        """
        queryset = self.get_queryset().filter(start_user=self.request.user)
        page = self.paginate_queryset(queryset.distinct())
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg="获取成功")

    @action(methods=['get'], detail=False)
    def cc_to_me(self, request):
        """
        抄送我的
        """
        filter = Q(pre_user__id=request.user.id)
        if request.user:
            filter |= Q(pre_role__id__in=list(request.user.role.all().values_list('id', flat=True)))
        if request.user.dept:
            filter |= Q(pre_dept__id=request.user.dept.id)
        filter = Q(filter) & Q(flowrecord__type='Cc')
        queryset = self.queryset.filter(filter)
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
        instance  = FlowData.objects.filter(id=pk).first()
        if instance.status != 0:
            return ErrorResponse(msg="流程数据状态错误")
        if not instance:
            return ErrorResponse(msg="数据不存在")
        if not FlowData.approval_permission(instance=instance,user=request.user):
            return ErrorResponse(msg="当前数据您无权限审核")
        # 进行审核
        flow_record_obj = FlowRecord.objects.filter(flow_data=instance.id).first()
        flow_record_obj.status = 1
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
        reason = request.data.get("reason", "无")
        instance = FlowData.objects.filter(id=pk).first()
        if instance.status != 0:
            return ErrorResponse(msg="流程数据状态错误")
        if not instance:
            return ErrorResponse(msg="数据不存在")
        if not FlowData.approval_permission(instance=instance, user=request.user):
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
    def get_flow_record(self, request, pk):
        """
        获取审核记录
        """
        instance = FlowData.objects.get(id=pk)
        flow_record = FlowRecord.objects.filter(flow_data_id=pk).order_by("id")
        result = list()
        for record in flow_record:
            node_data = FlowNode.objects.filter(flow_info_id=instance.flow_info_id,
                                                node_id=record.current_node_id).values().first()
            audit_users = FlowAuditUsers.objects.filter(flow_record_id=record.id).values(name=F('audit_user__name'))
            result.append({
                "startUserName": instance.start_user.name,
                "startDatetime":instance.create_datetime,
                "nodeData": node_data,
                "auditUsers": audit_users,
                "preInfo": {
                    "pre_user": record.pre_user.all().values('id', 'name'),
                    "pre_dept": record.pre_dept.all().values('id', 'name'),
                    "pre_role": record.pre_role.all().values('id', 'name'),
                },
                "nodeStatus": record.status
            })
        return DetailResponse(data=result)
