import datetime
import decimal
import importlib
import logging
from operator import eq

from django.apps import apps
from django.db import models, connection
from django.forms.models import model_to_dict
from rest_framework import serializers

from dvadmin.utils.validator import CustomValidationError
from dvadmin3_flow.decorator import run_flow_work
from dvadmin3_flow.models import FlowInfo, FlowData, FlowNode, FlowRecord, FlowAuditUsers

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
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
        data = model_to_dict(self, fields=[field.name for field in self._meta.fields])
        for key, value in data.items():
            if isinstance(value, datetime.datetime):
                data[key] = value.strftime('%Y-%m-%d %H:%M:%S')  # 按需调整格式
            if isinstance(value, datetime.date):
                data[key] = value.strftime('%Y-%m-%d')  # 按需调整格式
            if isinstance(value, decimal.Decimal):
                data[key] = str(value)
            if key in ['creator','modifier','dept_belong_id']:
                data[key] = str(value)
        return data

    def set_sub_table(self,*args, **kwargs):
        """
        设置审批流pre_change_content子表参数
        @param tableCol: 表格列配置列表，每个元素为包含'label'和'prop'键的字典
                        label: 列显示名称
                        prop: 列对应的数据属性名
        @param tableData: 表格数据列表，每个元素为一行数据

        @return: 无返回值
        """
        if self.pk:
            # 重新获取当前实例的数据
            _flow_data = FlowData.objects.filter(pre_change_content__id=self.id).first()
            if _flow_data is None:
                return None
            _flow_data.pre_change_content['sub_table'] = kwargs
            _flow_data.save()
        return None


class FlowBaseModel(models.Model, ModelDiffMixin):
    IS_FLOW = True
    # 是否软删除
    is_soft_delete = False
    is_audit_pass = False

    FLOW_STATUS_CODE= (
        (0, "待审核"),
        (1, "审核通过"),
        (2, "新增驳回"),
        (3, "修改驳回"),
    )
    flow_work_status = models.IntegerField(default=1, choices=FLOW_STATUS_CODE, verbose_name="流程状态", null=True, blank=True, help_text="流程状态")
    is_deleted = models.BooleanField(verbose_name="是否软删除", help_text='是否软删除', default=False, db_index=True)

    def save(self, *args, **kwargs):
        operation = 'update' if self.pk else 'create'
        self_class_name = self.__class__.__name__
        _FlowInfo = FlowInfo.objects.filter(content_type__model__iexact=self_class_name,status=1,is_deleted=False,operation=operation).first()
        # print("操作：", operation)
        # print("字段变化：", self.diff)
        # print("新增时的字段：", self._ModelDiffMixin__initial)
        # 如果没有流程，则直接保存
        if not _FlowInfo:
            return super().save(*args, **kwargs)

        flow_info_list = FlowInfo.objects.filter(content_type__model__iexact=self_class_name,status=1,is_deleted=False).values_list('id',flat=True)
        # 流程执行前执行
        self.before_execute(flow_info_list, self._dict)
        if kwargs.pop('is_deleted', False):
            return super().save(*args, **kwargs)  # 调用父类保存逻辑
        # 1.是否配置流程进入规则
        enter_fields = _FlowInfo.enter_fields or []
        exempt_fields = _FlowInfo.exclude_fields or []
        # 定义规则状态常量
        RULE_STATUS_DEFAULT = 1
        RULE_STATUS_ENTER = 2
        RULE_STATUS_SKIP = 3

        # 重构后的逻辑
        if operation == 'create':
            if _FlowInfo.rule_status == RULE_STATUS_DEFAULT:
                self.flow_work_status = 0
                super().save(*args, **kwargs)  # 调用父类保存逻辑
                logger.info("执行新增流程==>")
                if self.execute_approval_process(operation):
                    self.set_sub_table()
            elif _FlowInfo.rule_status == RULE_STATUS_ENTER:
                if enter_fields and len(enter_fields) > 0 and self.exempt_fields_execute(self._ModelDiffMixin__initial, enter_fields, True,_FlowInfo.rule_status):
                    self.flow_work_status = 0
                    super().save(*args, **kwargs)  # 调用父类保存逻辑
                    if self.execute_approval_process(operation):
                        self.set_sub_table()
                        logger.info("【新增】执行【流程进入规则】==>")
                else:
                    logger.info("【新增】执行【流程进入规则不匹配】==>")
                    return super().save(*args, **kwargs)  # 调用父类保存逻辑
            elif _FlowInfo.rule_status == RULE_STATUS_SKIP:
                if exempt_fields and len(exempt_fields) > 0 and self.exempt_fields_execute(self._ModelDiffMixin__initial, exempt_fields, True,_FlowInfo.rule_status):
                    logger.info("【新增】执行【流程跳过规则】==>")
                    return super().save(*args, **kwargs)  # 调用父类保存逻辑
                else:
                    logger.info("【新增】执行【流程跳过规则不匹配】==>")
                    self.flow_work_status = 0
                    super().save(*args, **kwargs)  # 调用父类保存逻辑
                    if self.execute_approval_process(operation):
                        self.set_sub_table()

        # 流程管理中的操作
        flow_info_operation = _FlowInfo.operation
        # 2.检查是否有字段变化，如果没有变化则直接保存
        if operation == 'update' and not self.has_changed:
            return super().save(*args, **kwargs)
        # 更新一次修改人,后续发起人就是当前修改人
        super().save(update_fields=['modifier'])
        if operation == 'update' and _FlowInfo.rule_status == RULE_STATUS_DEFAULT:
            logger.info("执行编辑流程==>")
            return self.execute_approval_process(operation)
        elif operation == 'update' and _FlowInfo.rule_status == RULE_STATUS_ENTER:
            if enter_fields and len(enter_fields) > 0 and self.exempt_fields_execute(self.diff, enter_fields,False,_FlowInfo.rule_status):
                logger.info("【编辑】执行【流程进入规则】==>")
                return self.execute_approval_process(operation)
            else:
                logger.info("【编辑】执行【流程进入规则不匹配】==>")
                return super().save(*args, **kwargs)
        elif operation == 'update' and _FlowInfo.rule_status == RULE_STATUS_SKIP:
            if exempt_fields and len(exempt_fields) > 0 and self.exempt_fields_execute(self.diff, exempt_fields,False,_FlowInfo.rule_status):
                logger.info("【编辑】执行【流程跳出规则】==>")
                return super().save(*args, **kwargs)
            else:
                logger.info("【编辑】执行【流程跳出规则不匹配】==>")
                return self.execute_approval_process(operation)




        # if operation == 'create' and flow_info_operation == 'create':
        #     self.flow_work_status = 0
        #     super().save(*args, **kwargs)  # 调用父类保存逻辑
        #
        #     if self.execute_approval_process(operation):
        #         self.set_sub_table()
        #         logger.info("执行新增流程==>")
        # elif (
        #     operation == 'create'
        #     and flow_info_operation != 'create'
        #     or operation != 'create'
        #     and self.execute_approval_process(operation)
        # ):
        #     logger.info("执行编辑流程==>")
        #     super().save(*args, **kwargs)  # 调用父类保存逻辑


    def before_execute(self,flow_info_list,initial_data):
        """执行前处理"""
        _FlowData = FlowData.objects.filter(flow_info_id__in=flow_info_list,pre_change_content__id=self.id,status=0).first()
        if _FlowData:
            raise CustomValidationError(detail="该条数据已在流程审核中")
        else:
            return True

    def exempt_fields_execute(self,field_list, rule_list,insert=False,rule_status=1):
        """
        判断字段列表是否符合规则列表中的任意一条规则（按 if-elif 顺序，第一条满足即返回 True）。

        :param field_list: dict{str}, 实际存在的字段名列表，例如 {"phone":(None,"13800000000")}
        :param rule_list: List[dict], 规则列表，每条规则包含 type, operate, context
        :param insert,是否为新增，为True时field_list:dict{str},例如{"phone":"13800000000"}
        :return: bool, 是否满足至少一条规则
        """

        def is_null(current_value, value):
            return current_value is None or current_value == ""

        def is_not_null(current_value, value):
            return current_value is not None and current_value != ""

        if not rule_list:
            return False  # 无规则视为不匹配
        condition_map = {
            "equal_to": eq,
            "is_null": is_null,
            "is_not_null": is_not_null,
        }
        for rule in rule_list:
            context = rule.get("context", [])
            if not context:
                continue  # 没有上下文条件，跳过
            # 获取该规则的逻辑操作符：and（全部存在）或 or（至少一个存在）
            operate = rule.get("operate", "and")  # 默认 and
            results = []
            for ctx in context:
                change = ctx['change']
                field = ctx["field"]
                op = ctx["condition"]
                value = ctx.get('field_value', None)
                if field not in field_list:
                    logger.info(f"字段 {field} 不存在规则中")
                    if rule_status==2:
                        results.append(False)
                    if rule_status==3:
                        results.append(True)
                    continue
                if op not in condition_map:
                    raise ValueError(f"不支持的比较条件: {op}")
                operator_func = condition_map[op]
                variables = field_list[field]
                if insert:
                    variables = [None, variables]
                before_value = variables[0]
                after_value = variables[1]
                current_value = before_value if change == "change_before" else after_value
                # 这里判断 当前值的类型，如果是字符串则进行字符串比较，如果是数字则转为字符串，如果是bool类型，也需要转为字符串
                current_value = str(current_value) if isinstance(current_value, (int, float, bool)) else current_value
                if value is not None:
                    if isinstance(value, str) and value.lower() in ["true", "false"]:
                        value = value.lower().capitalize()  # 将 true/false 转为首字母大写
                    else:
                        value = str(value)
                result = operator_func(current_value, value)
                results.append(result)

            # 根据 operate 计算 context 是否满足
            if operate == "or":
                # 只要有一个字段存在于 field_list 中
                match = any(results)
            else:  # 默认 "and"
                # 所有字段都必须存在
                match = all(results)
            # if-elif 语义：一旦某条规则匹配，立即返回 True
            if match:
                return True
        return False  # 所有规则都不匹配

    def delete(self, using=None, keep_parents=False):
        if self.execute_approval_process('delete'):
            if self.is_soft_delete:
                self.is_deleted = True
                self.save()
                # 级联软删除关联对象
                for related_object in self._meta.related_objects:
                    try:
                        related_model = getattr(self, related_object.get_accessor_name())
                    except AttributeError:
                        continue
                    # 处理一对多和多对多的关联对象
                    if related_object.one_to_many or related_object.many_to_many:
                        related_objects = related_model.all()
                    elif related_object.one_to_one:
                        related_objects = [related_model]
                    else:
                        continue

                    for obj in related_objects:
                        obj.delete()
            else:
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
        from  django.contrib.contenttypes.models import ContentType
        content_type_obj = ContentType.objects.filter(app_label=app_label, model=model).first()
        flow_info_obj = FlowInfo.objects.filter(correlation_model_name=str(self._meta), operation=operation, status=1).first()
        if not flow_info_obj:
            return True
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
            "current_node": flow_node_obj.node_dict,
            "correlation_model":content_type_obj,
            "correlation_model_name":str(self._meta),
            "object_id": self.id
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
        logger.info(f"数据==>{data}")
        flow_data_obj = FlowData.objects.create(**data)
        # 直接创建一条记录数据，并更新
        flow_record_data = {
            "flow_data_id": flow_data_obj.id,
            "current_node_id": flow_node_obj.node_id,
            "type": flow_node_obj.node_type,
            "status": 1,
            "parent_node_id": flow_node_obj.parent.node_id if flow_node_obj.parent else None,
        }
        if users:
            flow_record_data["creator"] = users
            flow_record_data["modifier"] = users.id
            flow_record_data["dept_belong_id"] = users.dept_id
        flow_record_obj = FlowRecord.objects.create(**flow_record_data)
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
            logger.info(f"条件确认==>{data}")
            # 1.发起人-本人/部门
            # 2.发起人-角色
            # 3.库表-字符串类型
            # 4.库表-数字类型
            if data.get("type").lower() == 'org':
                dept_id = flow_data_obj.start_user.dept_id
                user_id = flow_data_obj.start_user.id
                dept_ids = [ele.get('dept_id') for ele in data["compareVal"] if ele.get('type') == 'dept']
                user_ids = [ele.get('id') for ele in data["compareVal"] if ele.get('type') == 'user']
                # 1.1.本人/部门属于 IN
                if data['compare'] == 'IN' and (
                    dept_id in dept_ids or user_id in user_ids
                ):
                    return True
                # 1.2.本人/部门不属于 NIN
                if (
                    data['compare'] == 'NIN'
                    and dept_id not in dept_ids
                    and user_id not in user_ids
                ):
                    return True
                # 1.3.本人/部门及下级部门属于 DeptAndSubDeptIN
                if data['compare'] == 'DeptAndSubDeptIN':
                    from dvadmin.system.models import Dept
                    dept_id_list = []
                    for dept in dept_ids:
                        dept_id_list+=Dept.recursion_all_dept(dept)
                    if set(dept_ids) & set(dept_id_list):
                        return True
                return False
            elif data.get("type").lower() == 'role':
                roles = flow_data_obj.start_user.role.all().values_list('id', flat=True)
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
                # 分割所有部分，然后排除最后一部分
                parts = data.get("symbol").split('_')
                model_name = '_'.join(parts[:-1])  # 使用切片排除最后一部分
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
                        data_type = data['type'] # Role | Org
                        data_list = [str(item.get('id')) for item in data["compareVal"]]
                        if data_type == 'Org':
                            data_list = [str(item.get('dept_id')) for item in data["compareVal"]]
                        logger.info("执行这里了~")
                        if str(model_data) != str(data_list[0]):
                            logger.info("这里也执行了~")
                            return str(model_data) in data_list
                    elif data['compare'] == 'BT':
                        if int(data["compareVal"][0]) <= int(model_data) <= int(
                                data["compareVal"][1]):
                            return True
                    return False
                if data['type'] == 'BoolSelect':
                    # {name: '等于', symbol: 'EQ'},
                    # {name: '不等于', symbol: 'NEQ'}
                    if data['compare'] == 'EQ':
                        if data["compareVal"][0] == 'true' and model_data:
                            return True
                    else:
                        if data["compareVal"][0] == 'false' and not model_data:
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
        if flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ROOT_SELF':
            # 2.发起人自己
            pre_user.append(flow_data_obj.start_user.id)
        if flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ASSIGN_DEPT':
            # 3.指定部门
            for dept in flow_node_obj.node_dict.get('props', {}).get('assignDept', {}).get('dept'):
                pre_dept.append(dept.get('id'))
        if flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'ASSIGN_ROLE':
            # 4.指定角色
            print(flow_node_obj.node_dict)
            for role in flow_node_obj.node_dict.get('props', {}).get('assignRole', {}):
                pre_role.append(role.get('id'))
        if flow_node_obj.node_dict.get('props', {}).get('ruleType') == 'CUSTOM_FUNCTION':
            # 5.自定义函数
            function_name = flow_node_obj.node_dict.get('props', {}).get('customFunction', None)
            logger.info(f"执行自定义函数: {function_name}")
            try:
                params = {
                    "data": flow_data_obj,
                    "node": flow_node_obj
                }
                logger.info(f"[审核流程执行] 准备执行workflow函数: {function_name}")
                user_ids = run_flow_work(name=function_name, **params)
                for user in user_ids:
                    pre_user.append(user)
                logger.info(f"[审核流程执行] workflow函数执行完成: {function_name}")
            except Exception as e:
                logger.info(f"[流程错误] 执行workflow函数失败: {function_name}, 错误: {str(e)}")
                import traceback
                traceback.print_exc()

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
        create_dict = {
            "creator": flow_data_obj.creator,
            "modifier": flow_data_obj.modifier,
            "dept_belong_id": flow_data_obj.dept_belong_id,
        }
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
        # 发通知 todo
        #flow_record_obj.create_message_push(flow_record_obj)
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
        # 先检查参数是否有效
        if not flow_node_obj:
            logger.info("[流程错误] 结束节点对象为空")
            return

        if not hasattr(flow_node_obj, 'props') or not flow_node_obj.props:
            logger.info("[流程错误] 结束节点没有props属性")
            return

        # 检查节点props中是否配置了func字段
        func = flow_node_obj.props.get('func', "")
        if not func:
            logger.info("[流程警告] 结束节点未配置func属性，无法执行workflow函数")
            return

        # 组装参数并执行workflow函数
        try:
            params = {
                "data": flow_data_obj,
                "node": flow_node_obj
            }
            logger.info(f"[流程执行] 准备执行workflow函数: {func}")
            run_flow_work(name=func, **params)
            logger.info(f"[流程执行] workflow函数执行完成: {func}")
        except Exception as e:
            logger.info(f"[流程错误] 执行workflow函数失败: {func}, 错误: {str(e)}")
            import traceback
            traceback.print_exc()



    @classmethod
    def _gateway_node(self, flow_data_obj, flow_node_obj):
        """
        分支节点
        1.获取所有父级节点是本分支的子级条件节点
        2.根据条件判断走哪一个分支节点
        """
        exclusive_node_obj = FlowNode.objects.filter(parent__node_id=flow_node_obj.node_id,
                                                     flow_info=flow_data_obj.flow_info, node_type="Exclusive").order_by("process_index")
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
    def audit_reject(self,flow_data_obj: FlowData, *args):
        """
        审核驳回
        """
        model_type = flow_data_obj.flow_info.model_type
        if model_type == 0:
            instance_id = flow_data_obj.pre_change_content.get('id')
            instance = apps.get_model(flow_data_obj.flow_info.content_type.app_label,
                                      model_name=flow_data_obj.flow_info.content_type.model)
            op_type = flow_data_obj.pre_change_content.get('type')
            if op_type == 'create':
                instance.all_objects.filter(id=instance_id).update(flow_work_status=2)
            else:
                instance.all_objects.filter(id=instance_id).update(flow_work_status=3)

            # 对于数据库表模式，驳回也执行flowwork函数
            if args and len(args) > 0:
                flow_node_obj = args[0]
                self._end_node(flow_data_obj, flow_node_obj)
        else:
            # 动态表单模式下的驳回处理
            if args and len(args) > 0:
                flow_node_obj = args[0]
                logger.info(f"[动态表单-驳回] 执行指定的flowwork函数")
                self._end_node(flow_data_obj, flow_node_obj)

    @classmethod
    def audit_pass(self, flow_data_obj: FlowData,*args):
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
                instance.all_objects.filter(id=instance_id).update(**update_fields)
            elif type == 'create':
                instance.all_objects.filter(id=instance_id).update(flow_work_status=1)
            else:
                if instance.is_soft_delete:
                    instance.all_objects.filter(id=instance_id).update(is_deleted=True)
                    # 级联软删除关联对象
                    for related_object in instance._meta.related_objects:
                        try:
                            related_model = getattr(self, related_object.get_accessor_name())
                        except AttributeError:
                            continue
                        # 处理一对多和多对多的关联对象
                        if related_object.one_to_many or related_object.many_to_many:
                            related_objects = related_model.all()
                        elif related_object.one_to_one:
                            related_objects = [related_model]
                        else:
                            continue

                        for obj in related_objects:
                            obj.delete(soft_delete=True)
                else:
                    instance.all_objects.filter(id=instance_id).delete()
            logger.info(f"审核通过后执行更新成功[{instance_id}]")

            # 对于数据库表模式，执行flowwork函数
            if args and len(args) > 0:
                flow_node_obj = args[0]
                self._end_node(flow_data_obj, flow_node_obj)
        else:
            logger.info("这里执行动态表单流程")
            self._end_node(flow_data_obj, *args)


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
            logger.info(f"[流程错误] flow_record_obj={flow_record_obj}")
            return False
        if flow_record_obj.status == 0:
            logger.info(f"[需要人工审核通过后才可下一步] flow_record_obj={flow_record_obj}", )
            return False
        if flow_record_obj.status == 2:
            # 驳回
            flow_data_obj.status = 2
            flow_data_obj.save()

            # 查找流程的结束节点
            end_node_obj = FlowNode.objects.filter(flow_info=flow_data_obj.flow_info, node_type='End').first()
            if not end_node_obj:
                # 如果没有找到结束节点，则使用当前节点
                end_node_obj = FlowNode.objects.filter(node_id=flow_data_obj.current_node.get('id'),
                                                   flow_info=flow_data_obj.flow_info).first()

            # 传递结束节点给audit_reject方法
            self.audit_reject(flow_data_obj, end_node_obj)
            return False
        if flow_record_obj.status == 3:
            # 撤销审核
            if not flow_data_obj.completed_time:
                flow_data_obj.completed_time = datetime.datetime.now()
            flow_data_obj.status = 3
            flow_data_obj.save()

            # 查找流程的结束节点
            end_node_obj = FlowNode.objects.filter(flow_info=flow_data_obj.flow_info, node_type='End').first()
            if not end_node_obj:
                # 如果没有找到结束节点，则使用当前节点
                end_node_obj = FlowNode.objects.filter(node_id=flow_data_obj.current_node.get('id'),
                                                   flow_info=flow_data_obj.flow_info).first()

            # 传递结束节点给_handle_revoke方法
            self._handle_revoke(flow_data_obj, end_node_obj)
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
            "End": self._end_node,  # 结束节点
        }
        # 如果是结束节点则结束流程
        if flow_node_obj.node_type == 'End':
            flow_data_obj.completed_time = datetime.datetime.now()
            flow_data_obj.status = 1
            flow_data_obj.save()
            # 审核通过，将节点对象一并传递
            self.audit_pass(flow_data_obj, flow_node_obj)
            return True
        logger.info(f"当前执行的节点是==>{flow_node_obj.node_type}")
        logger.info(f"流程数据ID==>:{flow_data_obj.id}")
        node_func_dict[flow_node_obj.node_type](flow_data_obj, flow_node_obj)
        # 如果需要继续执行下一节点则继续
        self.process_engine(flow_data_obj.id)

    # 3.审批通过后保存数据
    class Meta:
        abstract = True

    @classmethod
    def _handle_revoke(self, flow_data_obj, flow_node_obj):
        """
        处理审核撤销状态
        """
        # 获取流程类型
        model_type = flow_data_obj.flow_info.model_type

        if model_type == 0:
            # 数据库表模式下的撤销处理
            instance_id = flow_data_obj.pre_change_content.get('id')
            instance = apps.get_model(flow_data_obj.flow_info.content_type.app_label,
                                      model_name=flow_data_obj.flow_info.content_type.model)
            # 这里可以根据需要进行其他处理

        # 无论数据库表模式还是动态表单模式，都执行flowwork函数
        if flow_node_obj and flow_node_obj.props:
            logger.info(f"[流程撤销] 执行指定的flowwork函数，流程类型: {'数据库表模式' if model_type == 0 else '动态表单模式'}")
            self._end_node(flow_data_obj, flow_node_obj)
