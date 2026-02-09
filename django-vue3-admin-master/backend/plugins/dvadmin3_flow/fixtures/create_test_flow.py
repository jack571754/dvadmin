"""
创建测试审批流程和测试数据
使用方法: python manage.py shell < create_test_flow.py
"""
from dvadmin.system.models import Dept, Users, Role
from dvadmin3_flow.models import FlowInfo, FlowNode, FlowLine
from django.utils import timezone
import json


def create_test_flow():
    print("开始创建测试审批流程...")

    # 获取测试数据
    admin_role = Role.objects.filter(name='管理员').first()
    test_role = Role.objects.filter(name='测试员').first()
    main_dept = Dept.objects.filter(name__contains='DVAdmin').first()
    sub_dept = Dept.objects.filter(name__contains='研发').first() or Dept.objects.first()

    # 获取用户
    superadmin = Users.objects.filter(username='superadmin').first()
    admin_user = Users.objects.filter(username='admin').first()
    test_user = Users.objects.filter(username='test').first()

    print(f"使用数据:")
    print(f"  部门: {main_dept.name if main_dept else 'None'}, {sub_dept.name if sub_dept else 'None'}")
    print(f"  用户: {superadmin.name if superadmin else 'None'}, {admin_user.name if admin_user else 'None'}, {test_user.name if test_user else 'None'}")

    # 创建一个简单的请假审批流程
    flow_info = FlowInfo.objects.create(
        name='请假申请',
        operation='leave',
        icon={},
        form_conf={
            "fields": [
                {
                    "name": "请假类型",
                    "key": "leave_type",
                    "type": "TextInput",
                    "required": True,
                    "props": {"placeholder": "请输入请假类型（如：事假、病假、年假）"}
                },
                {
                    "name": "请假天数",
                    "key": "leave_days",
                    "type": "NumberInput",
                    "required": True,
                    "props": {"min": 0.5, "max": 365, "precision": 0.5}
                },
                {
                    "name": "开始时间",
                    "key": "start_time",
                    "type": "DateTimePicker",
                    "required": True
                },
                {
                    "name": "结束时间",
                    "key": "end_time",
                    "type": "DateTimePicker",
                    "required": True
                },
                {
                    "name": "请假事由",
                    "key": "reason",
                    "type": "TextareaInput",
                    "required": True,
                    "props": {"placeholder": "请详细说明请假事由", "rows": 4}
                }
            ]
        },
        flow={
            "nodes": [],
            "lines": []
        },
        status=1,  # 已发布
        sort=1
    )

    # 创建开始节点
    start_node = FlowNode.objects.create(
        flow_info=flow_info,
        name='开始',
        node_type='Start',
        node_pos=[100, 100],
        config={}
    )

    # 创建审批节点（管理员审批）
    approval_node = FlowNode.objects.create(
        flow_info=flow_info,
        name='部门审批',
        node_type='Approval',
        node_pos=[300, 100],
        config={
            "mode": "ASSIGN_USER",  # 指定人员
            "target_type": "user",
            "examine_mode": "SEQUENTIAL",  # 依次审批
            "users": [str(superadmin.id)] if superadmin else [],
            "examine_mode": "SEQUENTIAL"
        }
    )

    # 创建抄送节点
    cc_node = FlowNode.objects.create(
        flow_info=flow_info,
        name='抄送人事',
        node_type='Cc',
        node_pos=[500, 100],
        config={
            "mode": "ASSIGN_USER",
            "target_type": "user",
            "users": [str(admin_user.id)] if admin_user else []
        }
    )

    # 创建结束节点
    end_node = FlowNode.objects.create(
        flow_info=flow_info,
        name='结束',
        node_type='End',
        node_pos=[700, 100],
        config={}
    )

    # 创建连线
    FlowLine.objects.create(
        flow_info=flow_info,
        source_node=start_node,
        target_node=approval_node
    )

    FlowLine.objects.create(
        flow_info=flow_info,
        source_node=approval_node,
        target_node=cc_node
    )

    FlowLine.objects.create(
        flow_info=flow_info,
        source_node=cc_node,
        target_node=end_node
    )

    print(f"\n创建审批流程: {flow_info.name}")
    print(f"  流程ID: {flow_info.id}")
    print(f"  节点数: {FlowNode.objects.filter(flow_info=flow_info).count()}")
    print(f"  连线数: {FlowLine.objects.filter(flow_info=flow_info).count()}")

    # 再创建一个报销审批流程
    flow_info2 = FlowInfo.objects.create(
        name='报销申请',
        operation='expense',
        icon={},
        form_conf={
            "fields": [
                {
                    "name": "报销类型",
                    "key": "expense_type",
                    "type": "TextInput",
                    "required": True,
                    "props": {"placeholder": "如：交通费、餐费、办公用品等"}
                },
                {
                    "name": "报销金额",
                    "key": "amount",
                    "type": "NumberInput",
                    "required": True,
                    "props": {"min": 0, "precision": 2}
                },
                {
                    "name": "报销说明",
                    "key": "description",
                    "type": "TextareaInput",
                    "required": True,
                    "props": {"placeholder": "请说明报销事由和金额明细", "rows": 4}
                },
                {
                    "name": "附件",
                    "key": "files",
                    "type": "FileUpload",
                    "required": False
                }
            ]
        },
        flow={
            "nodes": [],
            "lines": []
        },
        status=1,
        sort=2
    )

    # 创建报销流程节点
    start_node2 = FlowNode.objects.create(
        flow_info=flow_info2,
        name='开始',
        node_type='Start',
        node_pos=[100, 100],
        config={}
    )

    # 多人并行审批
    approval_node2 = FlowNode.objects.create(
        flow_info=flow_info2,
        name='财务审批',
        node_type='Approval',
        node_pos=[300, 100],
        config={
            "mode": "ASSIGN_USER",
            "target_type": "user",
            "examine_mode": "AND",  # 会签（所有审批人都通过）
            "users": [str(admin_user.id), str(superadmin.id)] if admin_user and superadmin else []
        }
    )

    end_node2 = FlowNode.objects.create(
        flow_info=flow_info2,
        name='结束',
        node_type='End',
        node_pos=[500, 100],
        config={}
    )

    FlowLine.objects.create(
        flow_info=flow_info2,
        source_node=start_node2,
        target_node=approval_node2
    )

    FlowLine.objects.create(
        flow_info=flow_info2,
        source_node=approval_node2,
        target_node=end_node2
    )

    print(f"\n创建审批流程: {flow_info2.name}")
    print(f"  流程ID: {flow_info2.id}")

    print("\n=== 测试数据创建完成 ===")
    print(f"\n共创建 {FlowInfo.objects.count()} 个审批流程:")
    for flow in FlowInfo.objects.all():
        node_count = FlowNode.objects.filter(flow_info=flow).count()
        print(f"  - {flow.name} (ID: {flow.id}, 节点: {node_count}个, 状态: {'已发布' if flow.status else '草稿'})")

    return flow_info, flow_info2


if __name__ == '__main__':
    create_test_flow()
