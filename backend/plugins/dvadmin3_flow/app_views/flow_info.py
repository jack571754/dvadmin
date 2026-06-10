from django.db.models import Q
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny,IsAuthenticated

from dvadmin.system.models import Dept
from dvadmin.utils.json_response import DetailResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin3_flow.models import FlowInfo

def flow_list_page(request):
    """
    审批流列表页面
    """
    return render(request,'flow_list.html')
def flow_form_page(request):
    """
    审批流form页面
    """
    return render(request,'flow_form.html')


class AppFlowInfoSerializer(CustomModelSerializer):

    class Meta:
        model = FlowInfo
        fields = "__all__"

class AppFlowInfoViewSet(CustomModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = FlowInfo.objects.all()
    serializer_class = AppFlowInfoSerializer

    componentType = {
        "TextInput": {
            "type": 'input',
        },
        "TextareaInput":{
            "type": 'input',
        },
        "NumberInput":{
            "type": 'stepper',
        },
        "Score":{
            "type": 'rate',
        },
        "SinglePicker":{
            "type": 'radio',
        },
        "MultiplePicker":{
            "type": 'checkbox',
        },
        "DateTimePicker":{
            "type": 'datetime-picker',
        },
        "DateTimeRangePicker":{
            "type": 'datetime-range-picker',
        }
    }

    @action(methods=['get'], detail=False, permission_classes=[IsAuthenticated])
    def get_form_list(self,request):
        """获取动态流程列表"""
        _FlowInfo = FlowInfo.objects.filter(status=1,model_type=1,is_deleted=False)
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
                    "operation": flow_info.operation
                }
                # 1.部门判定
                is_dept_ok = False
                is_role_ok = False
                if dept_info and set(current_user_dept) & set(dept_info):
                    is_dept_ok = True
                # 2.判定角色
                if role_info and set(current_user_role) & set(role_info):
                    is_role_ok = True

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
        return DetailResponse(data=result)

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_formConfig(self,request,pk):
        """
        获取动态表单流程的配置
        """
        if not pk:
            return DetailResponse(msg="参数错误",code="2001")
        _FlowInfo = FlowInfo.objects.filter(id=pk).first()
        return DetailResponse(data={
            "formItems":_FlowInfo.form_conf
        })




