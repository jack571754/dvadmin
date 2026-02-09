from django.core.management.base import BaseCommand
from dvadmin.system.models import Dept, Users, Role
from dvadmin3_flow.models import FlowInfo, FlowNode


class Command(BaseCommand):
    help = '创建测试审批流程和数据'

    def handle(self, *args, **options):
        self.stdout.write('开始创建测试审批流程...')

        # 获取测试数据
        superadmin = Users.objects.filter(username='superadmin').first()
        admin_user = Users.objects.filter(username='admin').first()

        if not superadmin:
            self.stdout.write(self.style.ERROR('未找到 superadmin 用户'))
            return

        # 创建请假申请流程
        self.stdout.write('\n创建请假申请流程...')
        flow_info = FlowInfo.objects.create(
            name='请假申请',
            operation='leave',
            icon={},
            form_conf={
                "fields": [
                    {"name": "请假类型", "key": "leave_type", "type": "TextInput", "required": True},
                    {"name": "请假天数", "key": "leave_days", "type": "NumberInput", "required": True, "props": {"min": 0.5, "max": 365}},
                    {"name": "开始时间", "key": "start_time", "type": "DateTimePicker", "required": True},
                    {"name": "结束时间", "key": "end_time", "type": "DateTimePicker", "required": True},
                    {"name": "请假事由", "key": "reason", "type": "TextareaInput", "required": True},
                ]
            },
            status=1
        )

        # 创建节点 - 使用 parent 关系表示连线
        # 开始节点
        start_node = FlowNode.objects.create(
            flow_info=flow_info,
            node_id='start_001',
            process_index=0,
            name='开始',
            node_type='Start',
            is_first=True,
            props={}
        )

        # 审批节点（父节点是开始节点）
        approval_node = FlowNode.objects.create(
            flow_info=flow_info,
            node_id='approval_001',
            process_index=1,
            name='部门审批',
            node_type='Approval',
            parent=start_node,
            props={
                "mode": "ASSIGN_USER",
                "target_type": "user",
                "examine_mode": "SEQUENTIAL",
                "users": [str(superadmin.id)]
            }
        )

        # 结束节点（父节点是审批节点）
        end_node = FlowNode.objects.create(
            flow_info=flow_info,
            node_id='end_001',
            process_index=2,
            name='结束',
            node_type='End',
            parent=approval_node,
            props={}
        )

        self.stdout.write(self.style.SUCCESS(f'  创建流程: {flow_info.name} (ID: {flow_info.id})'))

        # 创建报销申请流程
        self.stdout.write('\n创建报销申请流程...')
        flow_info2 = FlowInfo.objects.create(
            name='报销申请',
            operation='expense',
            icon={},
            form_conf={
                "fields": [
                    {"name": "报销类型", "key": "expense_type", "type": "TextInput", "required": True},
                    {"name": "报销金额", "key": "amount", "type": "NumberInput", "required": True, "props": {"min": 0}},
                    {"name": "报销说明", "key": "description", "type": "TextareaInput", "required": True},
                ]
            },
            status=1
        )

        start_node2 = FlowNode.objects.create(
            flow_info=flow_info2,
            node_id='start_002',
            process_index=0,
            name='开始',
            node_type='Start',
            is_first=True,
            props={}
        )

        approval_node2 = FlowNode.objects.create(
            flow_info=flow_info2,
            node_id='approval_002',
            process_index=1,
            name='财务审批',
            node_type='Approval',
            parent=start_node2,
            props={
                "mode": "ASSIGN_USER",
                "target_type": "user",
                "examine_mode": "SEQUENTIAL",
                "users": [str(superadmin.id)]
            }
        )

        end_node2 = FlowNode.objects.create(
            flow_info=flow_info2,
            node_id='end_002',
            process_index=2,
            name='结束',
            node_type='End',
            parent=approval_node2,
            props={}
        )

        self.stdout.write(self.style.SUCCESS(f'  创建流程: {flow_info2.name} (ID: {flow_info2.id})'))

        # 显示结果
        self.stdout.write('\n=== 测试数据创建完成 ===')
        for flow in FlowInfo.objects.all():
            node_count = FlowNode.objects.filter(flow_info=flow).count()
            status = '已发布' if flow.status == 1 else '草稿'
            self.stdout.write(f'  - {flow.name} (ID: {flow.id}, 节点: {node_count}个, 状态: {status})')
