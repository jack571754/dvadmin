# -*- coding: utf-8 -*-

"""
@author: 猿小天
@contact: QQ:1638245306
@Created on: 2021/6/3 003 0:30
@Remark: 菜单按钮管理
"""
from django.db.models import F
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import MenuButton, RoleMenuButtonPermission, Menu
from dvadmin.utils.json_response import DetailResponse, SuccessResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet




class MenuButtonSerializer(CustomModelSerializer):
    """
    菜单按钮-序列化器
    """

    class Meta:
        model = MenuButton
        fields = ['id', 'name', 'value', 'api', 'method','menu']
        read_only_fields = ["id"]




class MenuButtonCreateUpdateSerializer(CustomModelSerializer):
    """
    初始化菜单按钮-序列化器
    """

    class Meta:
        model = MenuButton
        fields = "__all__"
        read_only_fields = ["id"]


class MenuButtonViewSet(CustomModelViewSet):
    """
    菜单按钮接口
    list:查询
    create:新增
    update:修改
    retrieve:单例
    destroy:删除
    """
    queryset = MenuButton.objects.order_by('create_datetime')
    serializer_class = MenuButtonSerializer
    create_serializer_class = MenuButtonCreateUpdateSerializer
    update_serializer_class = MenuButtonCreateUpdateSerializer
    extra_filter_class = []

    def list(self, request, *args, **kwargs):
        """
        重写list方法
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        queryset = self.filter_queryset(self.get_queryset()).order_by('name')
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(serializer.data,msg="获取成功")

    @action(methods=['get'],detail=False,permission_classes=[IsAuthenticated])
    def menu_button_all_permission(self,request):
        """
        获取所有的按钮权限
        :param request:
        :return:
        """
        is_superuser = request.user.is_superuser
        if is_superuser:
            queryset = MenuButton.objects.values_list('value',flat=True)
        else:
            role_id = request.user.role.values_list('id', flat=True)
            queryset = RoleMenuButtonPermission.objects.filter(role__in=role_id).values_list('menu_button__value',flat=True).distinct()
        return DetailResponse(data=queryset)

    @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated])
    def batch_create(self, request, *args, **kwargs):
        """
        批量创建菜单"增删改查查"权限
        创建的数据来源于菜单，需要规范创建菜单参数
        value：菜单的component_name:method
        api:菜单的web_path增加'/api'前缀，并根据method增加{id}
        """
        menu_id = request.data.get('menu')
        if not menu_id:
            return DetailResponse(msg="请选择菜单", code=4000)

        menu_obj = Menu.objects.filter(id=menu_id).first()
        if not menu_obj:
            return DetailResponse(msg="菜单不存在", code=4000)

        # 检查 component_name 是否为空
        if not menu_obj.component_name:
            return DetailResponse(
                msg=f"菜单 [{menu_obj.name}] 的组件名称(component_name)为空,无法生成按钮权限。"
                    f"请先编辑菜单,填写组件名称(通常是对应的视图路径,如 'user'、'role' 等)",
                code=4000
            )

        # 使用 web_path 构建 API 路径，如果没有 web_path 则使用 component_name
        # 注意：web_path 可能是 '/blog/article' 格式，需要确保以 '/' 开头
        api_path = menu_obj.web_path or f'/{menu_obj.component_name.replace(":", "/")}'

        result_list = [
            {'name': '新增', 'value': f'{menu_obj.component_name}:Create', 'api': f'/api{api_path}/', 'method': 1},
            {'name': '删除', 'value': f'{menu_obj.component_name}:Delete', 'api': f'/api{api_path}/{{id}}/', 'method': 3},
            {'name': '编辑', 'value': f'{menu_obj.component_name}:Update', 'api': f'/api{api_path}/{{id}}/', 'method': 2},
            {'name': '查询', 'value': f'{menu_obj.component_name}:Query', 'api': f'/api{api_path}/', 'method': 0},
            {'name': '详情', 'value': f'{menu_obj.component_name}:Retrieve', 'api': f'/api{api_path}/{{id}}/', 'method': 0},
            {'name': '复制', 'value': f'{menu_obj.component_name}:Copy', 'api': f'/api{api_path}/', 'method': 1},
            {'name': '导入', 'value': f'{menu_obj.component_name}:Import', 'api': f'/api{api_path}/import_data/', 'method': 1},
            {'name': '导出', 'value': f'{menu_obj.component_name}:Export', 'api': f'/api{api_path}/export_data/', 'method': 1},
        ]

        # 创建结果统计
        created_list = []
        skipped_list = []
        created_count = 0
        skipped_count = 0

        for item in result_list:
            # 检查是否已存在该权限值
            existing_btn = MenuButton.objects.filter(value=item['value']).first()

            if existing_btn:
                # 如果已存在，检查是否属于当前菜单
                if existing_btn.menu_id == menu_obj.id:
                    skipped_list.append(item['name'])
                    skipped_count += 1
                    continue  # 跳过，不更新
                else:
                    # 属于其他菜单，更新到当前菜单
                    existing_btn.menu = menu_obj
                    existing_btn.name = item['name']
                    existing_btn.api = item['api']
                    existing_btn.method = item['method']
                    existing_btn.save()
                    created_list.append(existing_btn)
                    created_count += 1
            else:
                # 不存在，创建新的
                btn = MenuButton.objects.create(
                    menu=menu_obj,
                    name=item['name'],
                    value=item['value'],
                    api=item['api'],
                    method=item['method'],
                )
                created_list.append(btn)
                created_count += 1

        msg = f"批量创建完成：新增 {created_count} 个"
        if skipped_count > 0:
            msg += f"，跳过 {skipped_count} 个已存在（{', '.join(skipped_list)}）"

        return SuccessResponse(
            self.get_serializer(created_list, many=True).data,
            msg=msg
        )