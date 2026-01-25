import datetime
import importlib

from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.db import models, connection
from django.forms.models import model_to_dict
from rest_framework import serializers

from dvadmin3_flow.decorator import run_flow_work
from dvadmin3_flow.models import FlowInfo, FlowData, FlowNode, FlowRecord, FlowAuditUsers


class ModelDiffMixin(object):
    """
    A model mixin that tracks model fields' values and provide some useful api
    to know what fields have been changed.
    """

    def __init__(self, *args, **kwargs):
        super(ModelDiffMixin, self).__init__(*args, **kwargs)
        self.__initial = self._dict

    @property
    def diff(self):
        d1 = self.__initial
        if d1 is None:
            return dict(self._dict)
        d2 = self._dict
        diffs = [(k, (v, d2[k])) for k, v in d1.items() if v != d2[k]]
        return dict(diffs)

    @property
    def has_changed(self):
        return bool(self.diff)

    @property
    def changed_fields(self):
        return self.diff.keys()

    def get_field_diff(self, field_name):
        """
        Returns a diff for field if it's changed and None otherwise.
        """
        return self.diff.get(field_name, None)

    def save(self, *args, **kwargs):
        """
        Saves model and set initial state.
        """
        super(ModelDiffMixin, self).save(*args, **kwargs)
        self.__initial = self._dict

    @property
    def _dict(self):
        return model_to_dict(self, fields=[field.name for field in self._meta.fields])


class FlowBaseModel(models.Model, ModelDiffMixin):
    IS_FLOW = True
    is_audit_pass = False

    FLOW_STATUS_CODE= (
        (0, "待审核"),
        (1, "审核通过"),
        (2, "审核驳回"),
    )
    flow_work_status = models.IntegerField(default=0,choices=FLOW_STATUS_CODE, verbose_name="流程状态", null=True, blank=True, help_text="流程状态")

    def save_base(self, raw=..., force_insert=..., force_update=..., using=..., update_fields=...):
        operation = 'create' if force_insert else 'update'
        if force_update:
            operation = 'update'
        if operation == 'create':
            super().save_base(raw, force_insert, force_update, using, update_fields)
            if self.execute_approval_process(operation):
                print("执行新增流程==>")

        else:
            if self.execute_approval_process(operation):
                super().save_base(raw, force_insert, force_update, using, update_fields)



    def delete(self, using=None, keep_parents=False):
        print("审批流状态",self.flow_work_status)
        raise serializers.ValidationError("我在删除这里拦截了,无法删除")
        if self.execute_approval_process('delete'):
            return super().delete(using, keep_parents)

    def execute_approval_process(self, operation, update_fields=None):
        """
        执行审批流
        """
        if self.is_audit_pass == True:
            return True
        from dvadmin.system.models import Users

        app_label = str(self._meta).split('.')[0]
        model = str(self._meta).split('.')[1]
        content_type_obj = ContentType.objects.filter(app_label=app_label, model=model).first()
        flow_info_obj = FlowInfo.objects.filter(content_type=content_type_obj, operation=operation, status=1).first()
        if not flow_info_obj:
            return True
        print(f"存在流程管理中==>{flow_info_obj.name}")
        # 1.创建一个流程任务，并保存要操作的数据，与当前数据 id
        flow_node_obj = FlowNode.objects.filter(flow_info=flow_info_obj, node_type='Start').first()
        update_fields = self.diff
        if operation == 'create':
            update_fields = self._dict
        data = {
            "flow_info": flow_info_obj,
            "name": flow_info_obj.name,
            "models_name": content_type_obj.name,
            "pre_change_content": {
                "type": operation,
                "id": self.id,
                "update_fields": update_fields,
                "formData":self._dict
            },
            "current_node": flow_node_obj.node_dict
        }
        users = None
        if hasattr(self, 'modifier'):
            users = Users.objects.filter(id=self.modifier).first()
            if users:
                data["start_user"] = users
                data["name"] = f"{users.name}发起的{flow_info_obj.name}的流程"
                data["creator"] = users
                data["handler"] = users
                data["modifier"] = users.id
                data["dept_belong_id"] = users.dept_id
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
        # 调用一次执行
        FlowBaseModel.process_engine(flow_data_obj.id)
        return

    @classmethod
    def conditional_check(self, props, flow_data_obj: FlowData):
        """
        条件确认，返回 true 或 false
        """

        def func_condition(data):
            # 1.发起人-本人/部门
            # 2.发起人-角色
            # 3.库表-字符串类型
            # 4.库表-数字类型
            if data.get("type").lower() == 'org':
                dept_id = flow_data_obj.start_user.dept_id
                user_id = flow_data_obj.start_user.id
                dept_ids = [ele.get('id') for ele in data["compareVal"] if ele.get('type') == 'dept']
                user_ids = [ele.get('id') for ele in data["compareVal"] if ele.get('type') == 'user']
                # 1.1.本人/部门属于 IN
                if data['compare'] == 'IN':
                    if dept_id in dept_ids or user_id in user_ids:
                        return True
                # 1.2.本人/部门不属于 NIN
                else:
                    if not (dept_id in dept_ids or user_id in user_ids):
                        return True
                return False
            elif data.get("type").lower() == 'role':
                roles = flow_data_obj.start_user.role.all().values_list('role_id', flat=True)
                role_ids = [ele.get('id') for ele in data["compareVal"]]
                # 2.1.拥有角色
                if data['compare'] == 'HAS':
                    return any([item in role_ids for item in roles])
                # 2.2.不拥有角色
                else:
                    return not any([item in role_ids for item in roles])

            elif data.get("group") == 'DATABASE':
                # 3.1. string
                update_fields = flow_data_obj.pre_change_content.get('update_fields', {})
                if not update_fields:
                    return False
                model_name = data.get("symbol").split('_')[0]
                if model_name not in update_fields:
                    return False
                if flow_data_obj.pre_change_content.get('type') == 'update':
                    model_data = update_fields[model_name][1]
                else:
                    model_data = update_fields[model_name]
                if data['type'] == 'TextInput':
                    #     {name: '含有字符串', symbol: 'HAS'},
                    #     {name: '包含在', symbol: 'IN'},
                    #     {name: '等于', symbol: 'EQ'},
                    #     {name: '不等于', symbol: 'NEQ'}
                    if data['compare'] == 'HAS':
                        if data["compareVal"][0] in model_data:
                            return True
                    elif data['compare'] == 'IN':
                        return any([item in model_data for item in data["compareVal"]])
                    elif data['compare'] == 'EQ':
                        if data["compareVal"][0] == 'null' and not model_data:
                            return True
                        if data["compareVal"][0] == model_data:
                            return True
                    else:
                        if data["compareVal"][0] != model_data:
                            return True
                    return False
                if data['type'] == 'NumberInput':
                    #     {name: '大于', symbol: 'GT'},
                    #     {name: '小于', symbol: 'LT'},
                    #     {name: '等于', symbol: 'EQ'},
                    #     {name: '大于等于', symbol: 'GT_EQ'},
                    #     {name: '小于等于', symbol: 'LT_EQ'},
                    #     {name: '不等于', symbol: 'NEQ'},
                    #     {name: '包含在', symbol: 'IN'},
                    #     {name: '介于两者间(含首尾)', symbol: 'BT'},
                    if data['compare'] == 'GT':
                        if int(model_data) > int(data["compareVal"][0]):
                            return True
                    elif data['compare'] == 'LT':
                        if int(model_data) < int(data["compareVal"][0]):
                            return True
                    elif data['compare'] == 'EQ':
                        if int(model_data) == int(data["compareVal"][0]):
                            return True
                    elif data['compare'] == 'GT_EQ':
                        if int(model_data) >= int(data["compareVal"][0]):
                            return True
                    elif data['compare'] == 'LT_EQ':
                        if int(model_data) <= int(data["compareVal"][0]):
                            return True
                    elif data['compare'] == 'IN':
                        if int(model_data) != int(data["compareVal"][0]):
                            return str(model_data) in data["compareVal"]
                    elif data['compare'] == 'BT':
                        if int(data["compareVal"][0]) <= int(model_data) <= int(
                                data["compareVal"][1]):
                            return True
                    return False
            return False

        groups = props.get('groups', [])
        # 1.如果没有数据则返回
        if len(groups) == 0:
            return True
        if len(groups) == 1:
            conditions = groups[0].get('conditions', [])
            if len(conditions) == 0:
                return True
        # 2.判定
        sum_result = []
        for group in groups:
            pass
            conditions = group.get('conditions', [])
            logic = group.get('logic')
            result = []
            for condition in conditions:
                # 把执行结果放到数组中
                result.append(func_condition(condition))
            # 判定结果
            result_str = f' {" and " if group.get("logic") else "or"}'.join([str(ele) for ele in result])
            sum_result.append(result_str)
        # 全局判定
        all_result_str = f' {" and " if props.get("logic") else "or"}'.join(sum_result)
        print("all_result_str", all_result_str)
        return eval(all_result_str)

    @classmethod
    def save_flow_node_obj(self, flow_data_obj, flow_node_obj, status):
        # 更新当前节点状态
        pre_user = []
        pre_dept = []
        pre_role = []
        flow_data_obj.current_node = flow_node_obj.node_dict
        flow_data_obj.handler = None
        flow_data_obj.save()
        # ruleType：ASSIGN_DEPT 指定部门；ASSIGN_USER 指定人员；ROOT_SELF 发起人自己；ASSIGN_ROLE指定角色
        if flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ASSIGN_USER':
            # 1.指定人员
            for user in flow_node_obj.node_dict.get('props', {}).get('assignUser', []):
                pre_user.append(user.get('id'))
        elif flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ROOT_SELF':
            # 2.发起人自己
            pre_user.append(flow_data_obj.start_user.id)
        elif flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ASSIGN_DEPT':
            # 3.指定部门
            for dept in flow_node_obj.node_dict.get('props', {}).get('assignDept', {}).get('dept'):
                pre_dept.append(dept.get('id'))
        elif flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ASSIGN_ROLE':
            # 4.指定角色
            print(flow_node_obj.node_dict)
            for role in flow_node_obj.node_dict.get('props', {}).get('assignRole', {}):
                pre_role.append(role.get('id'))
        #  TODO 根据规则判断是否要自动审核通过
        create_dict = {}
        same_root_type = flow_node_obj.props.get('sameRoot', {}).get('type')
        # 当审批人与提交人为同一人时,自动审批
        if flow_data_obj.start_user_id in pre_user and same_root_type == 'TO_SKIP':
            status = 1
        if flow_node_obj.node_type == 'Cc':
            status = 1
        # 获取当前要处理的信息
        flow_data_obj.pre_user.set(pre_user)
        flow_data_obj.pre_dept.set(pre_dept)
        flow_data_obj.pre_role.set(pre_role)
        # 直接创建一条记录数据，并更新
        flow_record_obj = FlowRecord.objects.create(**{
            "flow_data_id": flow_data_obj.id,
            "current_node_id": flow_node_obj.node_id,
            "type": flow_node_obj.node_type,
            "status": status,
            "parent_node_id": flow_node_obj.parent.node_id if flow_node_obj.parent else None,
        }, **create_dict)
        flow_record_obj.pre_user.set(pre_user)
        flow_record_obj.pre_dept.set(pre_dept)
        flow_record_obj.pre_role.set(pre_role)
        # 发通知
        flow_record_obj.create_message_push(flow_record_obj)
        if status == 1:
            FlowAuditUsers.objects.create(**{
                "flow_record": flow_record_obj,
                "audit_user": flow_data_obj.start_user,
                "status": 1,
                "description": "自动审核通过",
            })

    @classmethod
    def _approval_node(self, flow_data_obj, flow_node_obj):
        """
        审核人节点
        """
        self.save_flow_node_obj(flow_data_obj, flow_node_obj, status=0)

    @classmethod
    def _end_node(self, flow_data_obj, flow_node_obj):
        """
        结束节点
        """
        func = flow_node_obj.props.get('func', "")
        if not func:
            return
        params = {
            "data":flow_data_obj, "node":flow_node_obj
        }
        run_flow_work(name=func,**params)



    @classmethod
    def _gateway_node(self, flow_data_obj, flow_node_obj):
        """
        分支节点
        1.获取所有父级节点是本分支的子级条件节点
        2.根据条件判断走哪一个分支节点
        """
        exclusive_node_obj = FlowNode.objects.filter(parent__node_id=flow_node_obj.node_id,
                                                     flow_info=flow_data_obj.flow_info)
        for exclusive_node in exclusive_node_obj:
            # 根据条件判断是否走该节点
            if not self.conditional_check(exclusive_node.props, flow_data_obj):
                continue
            flow_node_obj = FlowNode.objects.filter(parent__node_id=exclusive_node.node_id,
                                                    flow_info=flow_data_obj.flow_info).first()
            # 如果flow_node_obj 为空，则直接跳过
            if not flow_node_obj:
                self.save_flow_node_obj(flow_data_obj, exclusive_node, status=1)
                break
            # 更新当前节点状态
            self.save_flow_node_obj(flow_data_obj, flow_node_obj, status=0)
            break

        return

    @classmethod
    def _cc_node(self, flow_data_obj, flow_node_obj):
        # 更新当前节点状态
        self.save_flow_node_obj(flow_data_obj, flow_node_obj, status=1)

    @classmethod
    def audit_reject(self,flow_data_obj: FlowData):
        """
        审核驳回
        """
        model_type = flow_data_obj.flow_info.model_type
        if model_type == 0:
            instance_id = flow_data_obj.pre_change_content.get('id')
            instance = apps.get_model(flow_data_obj.flow_info.content_type.app_label,
                                      model_name=flow_data_obj.flow_info.content_type.model)
            instance.objects.filter(id=instance_id).update(flow_work_status=2)

    @classmethod
    def audit_pass(self, flow_data_obj: FlowData):
        """
        审核通过执行
        """
        model_type = flow_data_obj.flow_info.model_type
        if model_type == 0:
            instance_id = flow_data_obj.pre_change_content.get('id')
            type = flow_data_obj.pre_change_content.get('type')
            update_fields_data = flow_data_obj.pre_change_content.get('update_fields')
            update_fields = {}
            for key, val in update_fields_data.items():
                if type == 'update':
                    update_fields[key] = val[1]
                elif type == 'create':
                    update_fields[key] = val
            instance = apps.get_model(flow_data_obj.flow_info.content_type.app_label,
                                      model_name=flow_data_obj.flow_info.content_type.model)
            if type == 'update':
                instance.objects.filter(id=instance_id).update(**update_fields)
            elif type == 'create':
                print("执行通过.....",instance.objects.filter(id=instance_id))
                instance.objects.filter(id=instance_id).update(flow_work_status=1)
                # class DynamicSerializer(serializers.ModelSerializer):
                #     class Meta:
                #         model = instance
                #         fields = '__all__'
                #
                # # 创建新数据，使用动态序列化器
                # instance.is_audit_pass = True
                # serializer = DynamicSerializer(data=update_fields)
                # serializer.is_valid(raise_exception=True)
                # serializer.save()
                # instance.is_audit_pass = False

            else:
                if 'is_delete' in instance._meta.get_fields():
                    instance.objects.filter(id=instance_id).update(is_delete=True)
                else:
                    instance.objects.filter(id=instance_id).delete()
            print(f"审核通过后执行更新成功[{instance_id}]")
        else:
            print("这里执行动态表单流程")


    @classmethod
    def _get_gateway(self, node_id):
        """
        获取 node 节点 id
        """
        flow_node_obj = FlowNode.objects.filter(node_id=node_id).first()
        if flow_node_obj.node_type == 'Exclusive':
            new_flow_node_obj = FlowNode.objects.filter(parent_id=flow_node_obj.parent_id).exclude(
                node_type='Exclusive').first()
            if new_flow_node_obj:
                return new_flow_node_obj
        if flow_node_obj.node_type == 'Start':
            return None
        return self._get_gateway(flow_node_obj.parent.node_id)

    @classmethod
    def process_engine(self, flow_data_id):
        """
        审批引擎,进行下一步流转
        """
        flow_data_obj = FlowData.objects.filter(id=flow_data_id).first()
        # 1.判断该流程是否是需要人工审核
        flow_record_obj = FlowRecord.objects.filter(flow_data_id=flow_data_id).first()
        if flow_record_obj is None:
            print("[流程错误] flow_record_obj", flow_record_obj)
            return False
        if flow_record_obj.status == 0:
            print("[需要人工审核通过后才可下一步] flow_record_obj", flow_record_obj)
            return False
        if flow_record_obj.status == 2:
            # 驳回
            flow_data_obj.status = 2
            flow_data_obj.save()
            self.audit_reject(flow_data_obj)
            return False
        if flow_record_obj.status == 3:
            # 撤销审核
            if not flow_data_obj.completed_time:
                flow_data_obj.completed_time = datetime.datetime.now()
            flow_data_obj.status = 3
            flow_data_obj.save()
            return True
        # 2.找该节点的子节点
        flow_node_obj = FlowNode.objects.filter(parent__node_id=flow_data_obj.current_node.get('id'),
                                                flow_info=flow_data_obj.flow_info).first()
        if not flow_node_obj:
            # 3.判断，如果是条件节点，判断父级的网关节点下一节点。
            node_obj = FlowNode.objects.filter(node_id=flow_data_obj.current_node.get('id'),
                                               flow_info=flow_data_obj.flow_info).first()
            flow_node_obj = FlowNode.objects.filter(parent_id=node_obj.parent_id,
                                                    flow_info=flow_data_obj.flow_info,
                                                    process_index__gt=node_obj.process_index).first()
            if not flow_node_obj:
                # 4.查询当前节点的上级网关节点
                flow_node_obj = self._get_gateway(flow_data_obj.current_node.get('id'))
            if not flow_node_obj:
                flow_data_obj.completed_time = datetime.datetime.now()
                flow_data_obj.status = 1
                flow_data_obj.save()
                # 审核通过
                self.audit_pass(flow_data_obj)
                return True

        node_func_dict = {
            "Start": self._approval_node,  # 开始节点
            "Approval": self._approval_node,  # 审核人节点
            "Gateway": self._gateway_node,  # 分支节点
            "Cc": self._cc_node,  # 抄送节点
            "End": self._end_node, # 结束节点
        }
        print(f"当前执行的节点是==>{flow_node_obj.node_type}")
        print(f"流程数据:{flow_data_obj}")
        node_func_dict[flow_node_obj.node_type](flow_data_obj, flow_node_obj)
        if flow_node_obj.node_type == 'End':
            flow_data_obj.completed_time = datetime.datetime.now()
            flow_data_obj.status = 1
            flow_data_obj.save()
            # 审核通过
            self.audit_pass(flow_data_obj)
            return True
        else:
            # 如果需要继续执行下一节点则继续
            self.process_engine(flow_data_obj.id)

    # 3.审批通过后保存数据
    class Meta:
        abstract = True
