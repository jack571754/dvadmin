# -*- coding: utf-8 -*-
from rest_framework import serializers

from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin3_flow.models import  FlowRecord,FlowNode

class FlowRecordSerializer(CustomModelSerializer):
    """
    流程记录 的列化器
    """
    current_node_info = serializers.SerializerMethodField()

    def get_current_node_info(self, instance):
        current_node_id = instance.current_node_id
        return FlowNode.objects.filter(node_id=current_node_id).values()



    class Meta:
        model = FlowRecord
        fields = '__all__'