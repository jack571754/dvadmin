from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny,IsAuthenticated
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
        _FlowInfo = FlowInfo.objects.filter(status=1,model_type=1)
        serializer = AppFlowInfoSerializer(instance=_FlowInfo,many=True,request=request)
        return DetailResponse(data=serializer.data)

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def get_formConfig(self,request,pk):
        """
        获取动态表单流程的配置
        """
        if not pk:
            return DetailResponse(msg="参数错误",code="2001")
        _FlowInfo = FlowInfo.objects.filter(id=pk).first()
        # components = _FlowInfo.form_conf.get('components')
        # formItems = []
        # for item in components:
        #     type = item.get('type')
        #     props = item.get('props')
        #     if type in self.componentType:
        #         items = {
        #             "type": self.componentType[type]['type'],
        #             "label": item.get('name'),
        #             "name": item.get('key'),
        #             "required": props.get('required'),
        #         }
        #         if type in ["SinglePicker","MultiplePicker"]:
        #             items['options'] = [{'text': item, 'value': item} for item in props.get('options')]
        #         formItems.append(items)
        return DetailResponse(data={
            "formItems":_FlowInfo.form_conf
        })




