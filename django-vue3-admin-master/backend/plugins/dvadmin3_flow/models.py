from django.contrib.contenttypes.models import ContentType
from django.db import models

from application import settings
from dvadmin.utils.models import CoreModel

table_prefix = 'workflow_'

AUDIT_STATUS = (
    (0, '进行中'),
    (1, '审核通过'),
    (2, '审核驳回'),
    (3, '审核撤销'),
)

FLOW_TYPE = (
    (0, '数据库表'),
    (1, '动态表单'),
)

class FlowInfo(CoreModel):
    model_type = models.IntegerField(default=0,blank=True,verbose_name="模块类型", help_text="模块类型")
    content_type = models.ForeignKey(ContentType, db_constraint=False, null=True, blank=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, verbose_name='名称')
    operation = models.CharField(null=True, blank=True,max_length=255, verbose_name='操作')
    icon = models.JSONField( blank=True,default=dict, verbose_name='图标')
    form_conf = models.JSONField( blank=True,default=dict, verbose_name='form配置')
    is_deleted = models.BooleanField(verbose_name="是否软删除", help_text='是否软删除', blank=True,default=False, db_index=True)
    STATUS_CHOICES = (
        (0, '待发布'),
        (1, '正常'),
        (2, '下架'),
    )
    status = models.IntegerField(default=0, choices=STATUS_CHOICES, verbose_name="状态", help_text="状态")

    class Meta:
        db_table = table_prefix + 'flow_info'
        verbose_name = '流程管理'
        verbose_name_plural = verbose_name
        ordering = ('-create_datetime',)


class FlowNode(CoreModel):
    flow_info = models.ForeignKey(FlowInfo, db_constraint=False, on_delete=models.CASCADE)
    node_id = models.CharField(max_length=64, verbose_name="节点ID", help_text="节点ID")
    process_index = models.IntegerField(default=0, verbose_name="索引", help_text="索引")
    name = models.CharField(max_length=64, verbose_name="节点名称", help_text="节点名称")
    # Start 开始节点
    # Approval 审批中
    # Cc 抄送
    # Gateway 节点
    node_type = models.CharField(default="Start", max_length=64, verbose_name='节点类型', help_text='节点类型')
    props = models.JSONField(null=True, blank=True, verbose_name="条件流程配置", help_text="条件流程配置")
    branch = models.JSONField(null=True, blank=True, verbose_name="分支流程配置", help_text="分支流程配置")
    is_first = models.BooleanField(default=False, verbose_name="是否首级", help_text="是否首级")
    # 子级节点
    parent = models.ForeignKey('self', null=True, blank=True, db_constraint=False, on_delete=models.CASCADE)

    class Meta:
        db_table = table_prefix + "flow_node"
        verbose_name = "流程节点表"
        verbose_name_plural = verbose_name
        ordering = ('process_index',)

    @classmethod
    def save_flow_node(self, data, flow_info_obj, parent_id=None):
        """
        保存节点数据
        """
        all_node_ids = []
        last_node_id = None
        for index, ele in enumerate(data):
            # 保存节点信息
            node_id = ele.pop('id')
            all_node_ids.append(node_id)
            flow_node_obj, _ = FlowNode.objects.update_or_create(flow_info=flow_info_obj, node_id=node_id, defaults={
                "name": ele.get('name'),
                "node_type": ele.get('type'),
                "props": ele.get('props'),
                "branch": ele.get('branch'),
                "process_index": index,
                "is_first": not parent_id,
                "parent_id": parent_id or last_node_id
            })
            last_node_id = flow_node_obj.id
            # 子级节点数据保存
            branch = ele.get('props', {}).get('branch')
            if branch:
                for inx, branch_ele in enumerate(branch):
                    # Gateway下的props-branch
                    branch_node_id = branch_ele.pop('id')
                    all_node_ids.append(branch_node_id)
                    branch_flow_node_obj, _ = FlowNode.objects.update_or_create(
                        flow_info=flow_info_obj, node_id=branch_node_id,
                        defaults={
                            "name": branch_ele.get('name'),
                            "node_type": branch_ele.get('type'),
                            "props": branch_ele.get('props'),
                            "branch": branch_ele.get('branch'),
                            "process_index": inx,
                            "parent_id": flow_node_obj.id
                        })
                    # 条件分支下的各个数据保存
                    all_node_ids += self.save_flow_node(ele.get('branch', [])[inx], flow_info_obj,
                                                        parent_id=branch_flow_node_obj.id)
        return all_node_ids

    @classmethod
    def get_flow_node(self, flow_info_obj):
        """
        获取节点数据
        """
        data = []
        flow_node_obj = FlowNode.objects.filter(flow_info=flow_info_obj, is_first=True)
        for ele in flow_node_obj:
            data.append({
                "id": ele.node_id,
                "name": ele.name,
                "props": ele.props,
                "type": ele.node_type,
                "branch": ele.branch
            })
        return data

    @property
    def node_dict(self):
        """
        根据node_id获取节点数据
        """
        return {
            "id": self.node_id,
            "name": self.name,
            "props": self.props,
            "type": self.node_type,
            "branch": self.branch
        }


class FlowData(CoreModel):
    flow_info = models.ForeignKey(FlowInfo, db_constraint=False, verbose_name='关联流程节点表',
                                  on_delete=models.CASCADE)
    no = models.CharField(max_length=200, verbose_name='流程编号')
    name = models.CharField(max_length=100, verbose_name='名称')
    models_name = models.CharField(max_length=100, null=True, blank=True, verbose_name='model名称')
    status = models.IntegerField(choices=AUDIT_STATUS, default=0, verbose_name='状态')
    start_user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='发起人', blank=True, null=True,
                                   related_name='start_user', db_constraint=False,
                                   on_delete=models.PROTECT)
    pre_user = models.ManyToManyField(settings.AUTH_USER_MODEL, db_constraint=False, verbose_name='预处理人',
                                      blank=True,
                                      related_name='flow_pre_user', )
    pre_dept = models.ManyToManyField("system.Dept", db_constraint=False, verbose_name='预处理部门', blank=True,
                                      related_name='flow_pre_dept', )
    pre_role = models.ManyToManyField("system.Role", verbose_name='预处理角色', db_constraint=False, blank=True)
    handler = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='处理人', blank=True, null=True,
                                related_name='flow_handler', db_constraint=False,
                                on_delete=models.PROTECT)
    pre_change_content = models.JSONField(verbose_name='预改变内容', null=True, blank=True)
    current_node = models.JSONField(verbose_name='当前节点')
    completed_time = models.DateTimeField(null=True, blank=True, verbose_name='完成时间')

    class Meta:
        db_table = table_prefix + 'flow_data'
        verbose_name = '流程数据'
        verbose_name_plural = verbose_name
        ordering = ('-create_datetime',)

    def generate_no(self):
        # 获取当前日期
        from django.utils import timezone
        current_date = timezone.now()

        date_str = current_date.strftime('%Y%m%d')  # 格式化日期为 YYYYMMDD
        prefix = "SH" + date_str

        # 查找当前最大编号
        max_no = FlowData.objects.filter(no__startswith=prefix).order_by('no').last()
        if max_no:
            # 解析当前最大编号的顺序部分
            last_sequence = int(max_no.no[len(prefix):])  # 获取顺序编号部分
        else:
            last_sequence = 0

        new_sequence = last_sequence + 1
        return f"{prefix}{new_sequence:06d}"  # 生成新的编号，格式为 SHYYYYMMDD000001

    def save(self, *args, **kwargs):
        if not self.no:
            # 如果没有提供 no 字段值，则自动生成
            self.no = self.generate_no()
        super().save(*args, **kwargs)


class FlowRecord(CoreModel):
    flow_data = models.ForeignKey(FlowData, db_constraint=False, on_delete=models.CASCADE)
    pre_user = models.ManyToManyField(settings.AUTH_USER_MODEL, verbose_name='预处理人', blank=True,
                                      related_name='pre_user', db_constraint=False, )
    pre_dept = models.ManyToManyField("system.Dept", verbose_name='预处理部门', blank=True,
                                      related_name='pre_dept', db_constraint=False, )
    pre_role = models.ManyToManyField("system.Role", verbose_name='预处理角色', db_constraint=False, blank=True)
    handler = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='处理人', blank=True, null=True,
                                related_name='handler', db_constraint=False,
                                on_delete=models.PROTECT)
    current_node_id = models.CharField(max_length=50, verbose_name='当前节点', null=True, blank=True, )
    parent_node_id = models.CharField(max_length=50, verbose_name='父节点', null=True, blank=True, )
    FLOW_RECORD_TYPE = (
        ("Start", '发起节点'),
        ("Approval", '审核节点'),
        ("Gateway", '条件节点'),
        ("Cc", '抄送节点'),
    )
    type = models.CharField(choices=FLOW_RECORD_TYPE, default="",max_length=255, null=True, blank=True, verbose_name='类型')
    status = models.IntegerField(choices=AUDIT_STATUS, default=0, verbose_name='状态')
    completed_time = models.DateTimeField(null=True, blank=True, verbose_name='完成时间')

    class Meta:
        db_table = table_prefix + 'flow_record'
        verbose_name = '流转记录'
        verbose_name_plural = verbose_name
        ordering = ('-create_datetime',)

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super().save(force_insert, force_update, using, update_fields)
        # 如果审核通过，就走下一步
        if not force_insert and self.status in [1, 2, 3]:
            from dvadmin3_flow.base_model import FlowBaseModel
            FlowBaseModel.process_engine(self.flow_data_id)

    @classmethod
    def create_message_push(cls, obj, request=None):
        from application.websocketConfig import create_message_push
        #  通知审核
        user_id = obj.pre_user.all().values_list('id', flat=True)
        print("user_id", user_id)
        role_id = obj.pre_role.all().values_list('id', flat=True)
        dept_id = obj.pre_dept.all().values_list('id', flat=True)
        message = {
            "contentType": "Content",
            "content": "您有一个新审批，请前往查看！",
            "notificationTitle": "新审核",
            "notificationButton": "点击前往审核",
            "path": "/flowTodo"
        }
        if user_id:
            create_message_push(title=obj.flow_data.name, content=message.get("content"),
                                target_user=list(user_id),
                                message=message, request=request)
        if role_id:
            create_message_push(title=obj.flow_data.name, content=message.get("content"),
                                target_role=list(role_id),
                                target_type=1,
                                message=message, request=request)
        if dept_id:
            create_message_push(title=obj.flow_data.name, content=message.get("content"),
                                target_role=list(dept_id),
                                target_type=2,
                                message=message, request=request)


class FlowAuditUsers(models.Model):
    flow_record = models.ForeignKey(FlowRecord, db_constraint=False, on_delete=models.CASCADE)
    audit_user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name='审核人', blank=True, null=True,
                                   db_constraint=False,
                                   related_name='audit_user', on_delete=models.PROTECT)
    status = models.IntegerField(choices=AUDIT_STATUS, default=0, verbose_name='状态')
    description = models.CharField(max_length=255, verbose_name="描述", null=True, blank=True, help_text="描述")
    update_datetime = models.DateTimeField(auto_now=True, null=True, blank=True, help_text="修改时间",
                                           verbose_name="修改时间")
    create_datetime = models.DateTimeField(auto_now_add=True, null=True, blank=True, help_text="创建时间",
                                           verbose_name="创建时间")

    class Meta:
        db_table = table_prefix + 'flow_audit_users'
        verbose_name = '流程审核人员'
        verbose_name_plural = verbose_name
        ordering = ('-create_datetime',)
