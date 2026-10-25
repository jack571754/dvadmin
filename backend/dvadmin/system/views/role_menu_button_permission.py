# -*- coding: utf-8 -*-

"""
@author: 猿小天
@contact: QQ:1638245306
@Created on: 2021/6/3 003 0:30
@Remark: 菜单按钮管理
"""
from django.db import transaction
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission

from dvadmin.system.models import RoleMenuButtonPermission, Menu, Dept, MenuButton, RoleMenuPermission, \
    MenuField, FieldPermission, Role
from dvadmin.utils.json_response import DetailResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet


class RoleAuthorizationPermission(BasePermission):
    """Authorize action values, including legacy fixtures whose API path has a typo."""
    actions = {
        'get_role_menu': {'role:AllCanMenu', 'role:SetMenu'},
        'get_role_menu_btn_field': {'role:AllMenuButton', 'role:SetMenu', 'role:SetMenuButton', 'role:SetDataRange'},
        'role_to_dept_all': {'role:AllDataRangeDept', 'role:SetMenuButton', 'role:SetDataRange'},
        'set_role_menu': {'role:SetMenu'},
        'set_role_menu_field': {'role:SetMenu'},
        'set_role_menu_btn': {'role:SetMenuButton'},
        'batch_set_role_menu_btn': {'role:SetMenuButton'},
        'set_role_menu_btn_data_range': {'role:SetDataRange'},
    }

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return RoleMenuButtonPermission.objects.filter(
            role__users=user, role__status=True, menu_button__value__in=self.actions.get(view.action, set())
        ).exists()


class RoleMenuButtonPermissionSerializer(CustomModelSerializer):
    """
    角色-菜单-按钮-权限 查询序列化
    """

    class Meta:
        model = RoleMenuButtonPermission
        fields = "__all__"
        read_only_fields = ["id"]


class RoleMenuButtonPermissionCreateUpdateSerializer(CustomModelSerializer):
    """
    角色-菜单-按钮-权限 创建/修改序列化
    """
    menu_button__name = serializers.CharField(source='menu_button.name', read_only=True)
    menu_button__value = serializers.CharField(source='menu_button.value', read_only=True)

    class Meta:
        model = RoleMenuButtonPermission
        fields = "__all__"
        read_only_fields = ["id"]


class RoleMenuSerializer(CustomModelSerializer):
    """
    角色-菜单 序列化
    """
    isCheck = serializers.SerializerMethodField()

    def get_isCheck(self, instance):
        params = self.request.query_params
        data = self.request.data
        return RoleMenuPermission.objects.filter(
            menu_id=instance.id,
            role_id=params.get('roleId', data.get('roleId')),
        ).exists()

    class Meta:
        model = Menu
        fields = ["id", "name", "parent", "is_catalog", "isCheck"]


class RoleMenuButtonSerializer(CustomModelSerializer):
    """
    角色-菜单-按钮 序列化
    """
    isCheck = serializers.SerializerMethodField()
    data_range = serializers.SerializerMethodField()
    role_menu_btn_perm_id = serializers.SerializerMethodField()
    dept = serializers.SerializerMethodField()

    def get_isCheck(self, instance):
        params = self.request.query_params
        data = self.request.data
        return RoleMenuButtonPermission.objects.filter(
            menu_button_id=instance.id,
            role_id=params.get('roleId', data.get('roleId')),
        ).exists()

    def get_data_range(self, instance):
        obj = self.get_role_menu_btn_prem(instance)
        if obj is None:
            return None
        return obj.data_range

    def get_role_menu_btn_perm_id(self, instance):
        obj = self.get_role_menu_btn_prem(instance)
        if obj is None:
            return None
        return obj.id

    def get_dept(self, instance):
        obj = self.get_role_menu_btn_prem(instance)
        if obj is None:
            return None
        return obj.dept.all().values_list('id', flat=True)

    def get_role_menu_btn_prem(self, instance):
        params = self.request.query_params
        data = self.request.data
        obj = RoleMenuButtonPermission.objects.filter(
            menu_button_id=instance.id,
            role_id=params.get('roleId', data.get('roleId')),
        ).first()
        return obj

    class Meta:
        model = MenuButton
        fields = ['id', 'menu', 'name', 'name_en', 'name_zh_tw', 'value', 'isCheck', 'data_range', 'role_menu_btn_perm_id', 'dept']


class RoleMenuFieldSerializer(CustomModelSerializer):
    """
    角色-菜单-字段 序列化
    """
    is_query = serializers.SerializerMethodField()
    is_create = serializers.SerializerMethodField()
    is_update = serializers.SerializerMethodField()

    def get_is_query(self, instance):
        params = self.request.query_params
        queryset = instance.menu_field.filter(role=params.get('roleId')).first()
        if queryset:
            return queryset.is_query
        return False

    def get_is_create(self, instance):
        params = self.request.query_params
        queryset = instance.menu_field.filter(role=params.get('roleId')).first()
        if queryset:
            return queryset.is_create
        return False

    def get_is_update(self, instance):
        params = self.request.query_params
        queryset = instance.menu_field.filter(role=params.get('roleId')).first()
        if queryset:
            return queryset.is_update
        return False

    class Meta:
        model = MenuField
        fields = ['id', 'field_name', 'title', 'is_query', 'is_create', 'is_update']


class RoleMenuButtonPermissionViewSet(CustomModelViewSet):
    """
    菜单按钮接口
    list:查询
    create:新增
    update:修改
    retrieve:单例
    destroy:删除
    """
    queryset = RoleMenuButtonPermission.objects.all()
    serializer_class = RoleMenuButtonPermissionSerializer
    create_serializer_class = RoleMenuButtonPermissionCreateUpdateSerializer
    update_serializer_class = RoleMenuButtonPermissionCreateUpdateSerializer
    extra_filter_class = []

    @action(methods=['GET'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def get_role_menu(self, request):
        """
        获取 角色-菜单
        :param request:
        :return:
        """
        menu_queryset = Menu.objects.all()
        serializer = RoleMenuSerializer(menu_queryset, many=True, request=request)
        return DetailResponse(data=serializer.data)

    @action(methods=['PUT'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def set_role_menu(self, request):
        """
        设置 角色-菜单
        :param request:
        :return:
        """
        data = request.data
        roleId = data.get('roleId')
        menuId = data.get('menuId')
        isCheck = data.get('isCheck')
        if isCheck:
            # 添加权限：创建关联记录
            instance, _ = RoleMenuPermission.objects.get_or_create(role_id=roleId, menu_id=menuId)
        else:
            # 删除权限：移除关联记录
            RoleMenuPermission.objects.filter(role_id=roleId, menu_id=menuId).delete()
        menu_instance = Menu.objects.get(id=menuId)
        serializer = RoleMenuSerializer(menu_instance, request=request)
        return DetailResponse(data=serializer.data, msg="更新成功")

    @action(methods=['GET'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def get_role_menu_btn_field(self, request):
        """
        获取 角色-菜单-按钮-列字段
        :param request:
        :return:
        """
        params = request.query_params
        menuId = params.get('menuId', None)
        menu_btn_queryset = MenuButton.objects.filter(menu_id=menuId)
        menu_btn_serializer = RoleMenuButtonSerializer(menu_btn_queryset, many=True, request=request)
        menu_field_queryset = MenuField.objects.filter(menu_id=menuId)
        menu_field_serializer = RoleMenuFieldSerializer(menu_field_queryset, many=True, request=request)
        return DetailResponse(data={'menu_btn': menu_btn_serializer.data, 'menu_field': menu_field_serializer.data})

    @action(methods=['PUT'], detail=True, permission_classes=[RoleAuthorizationPermission])
    def set_role_menu_field(self, request, pk):
        """
        设置 角色-菜单-列字段
        """
        class FieldInput(serializers.Serializer):
            id = serializers.PrimaryKeyRelatedField(queryset=MenuField.objects.all())
            is_create = serializers.BooleanField()
            is_update = serializers.BooleanField()
            is_query = serializers.BooleanField()

        if not Role.objects.filter(pk=pk).exists():
            raise serializers.ValidationError('Unknown role.')
        payload = FieldInput(data=request.data, many=True)
        payload.is_valid(raise_exception=True)
        with transaction.atomic():
            for col in payload.validated_data:
                FieldPermission.objects.update_or_create(
                    role_id=pk, field=col['id'],
                    defaults={key: col[key] for key in ('is_create', 'is_update', 'is_query')})

        return DetailResponse(data=[], msg="更新成功")

    @action(methods=['PUT'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def batch_set_role_menu_btn(self, request):
        """
        批量设置 角色-菜单-按钮
        请求体: {"buttons": [{"btnId": 1, "isCheck": true, "data_range": 0, "dept": []}, ...]}
        """
        class ButtonInput(serializers.Serializer):
            btnId = serializers.IntegerField(min_value=1)
            isCheck = serializers.BooleanField()
            data_range = serializers.IntegerField(min_value=0, max_value=4, default=0)
            dept = serializers.ListField(child=serializers.IntegerField(min_value=1), default=list)

        class BatchInput(serializers.Serializer):
            roleId = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
            menuId = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.all())
            buttons = ButtonInput(many=True, allow_empty=False)

        payload = BatchInput(data=request.data)
        payload.is_valid(raise_exception=True)
        role = payload.validated_data['roleId']
        menu = payload.validated_data['menuId']
        buttons = payload.validated_data['buttons']
        ids = [row['btnId'] for row in buttons]
        if len(set(ids)) != len(ids) or MenuButton.objects.filter(menu=menu, pk__in=ids).count() != len(ids):
            raise serializers.ValidationError('Buttons must belong to the selected menu and must not repeat.')
        dept_ids = {pk for row in buttons for pk in row['dept']}
        if Dept.objects.filter(pk__in=dept_ids).count() != len(dept_ids):
            raise serializers.ValidationError('Unknown department.')
        with transaction.atomic():
            for row in buttons:
                if not row['isCheck']:
                    RoleMenuButtonPermission.objects.filter(role=role, menu_button_id=row['btnId']).delete()
                    continue
                instance, created = RoleMenuButtonPermission.objects.get_or_create(
                    role=role, menu_button_id=row['btnId'], defaults={'data_range': row['data_range']})
                # Checking an existing grant does not replace its separately configured scope.
                if created:
                    instance.dept.set(row['dept'] if row['data_range'] == 4 else [])
        return DetailResponse(data={'updated': len(buttons)}, msg=f"更新成功 {len(buttons)} 项")

    @action(methods=['PUT'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def set_role_menu_btn(self, request):
        """
        设置 角色-菜单-按钮
        """
        data = request.data
        isCheck = data.get('isCheck', None)
        roleId = data.get('roleId', None)
        btnId = data.get('btnId', None)
        data_range = data.get('data_range', None) or 0  # 默认仅本人权限
        dept = data.get('dept', None) or []  # 默认空部门

        if isCheck:
            # 添加权限：创建关联记录
            instance = RoleMenuButtonPermission.objects.create(role_id=roleId,
                                                               menu_button_id=btnId,
                                                               data_range=data_range)
            # 自定义部门权限
            if data_range == 4 and dept:
                instance.dept.set(dept)
        else:
            # 删除权限：移除关联记录
            RoleMenuButtonPermission.objects.filter(role_id=roleId, menu_button_id=btnId).delete()
        menu_btn_instance = MenuButton.objects.get(id=btnId)
        serializer = RoleMenuButtonSerializer(menu_btn_instance, request=request)
        return DetailResponse(data=serializer.data, msg="更新成功")

    @action(methods=['PUT'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def set_role_menu_btn_data_range(self, request):
        """
        设置 角色-菜单-按钮-权限
        """
        class RangeInput(serializers.Serializer):
            role_menu_btn_perm_id = serializers.PrimaryKeyRelatedField(queryset=RoleMenuButtonPermission.objects.all())
            data_range = serializers.IntegerField(min_value=0, max_value=4)
            dept = serializers.ListField(child=serializers.IntegerField(min_value=1), default=list)

        payload = RangeInput(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        instance = data['role_menu_btn_perm_id']
        departments = data['dept'] if data['data_range'] == 4 else []
        if Dept.objects.filter(pk__in=set(departments)).count() != len(set(departments)):
            raise serializers.ValidationError('Unknown department.')
        with transaction.atomic():
            instance.data_range = data['data_range']
            instance.save(update_fields=['data_range'])
            instance.dept.set(departments)
        serializer = RoleMenuButtonPermissionSerializer(instance, request=request)
        return DetailResponse(data=serializer.data, msg="更新成功")

    @action(methods=['get'], detail=False, permission_classes=[RoleAuthorizationPermission])
    def role_to_dept_all(self, request):
        """
        当前用户角色下所能授权的部门:角色授权页面使用
        :param request:
        :return:
        """
        is_superuser = request.user.is_superuser
        params = request.query_params
        # 当前登录用户的角色
        role_list = request.user.role.values_list('id', flat=True)

        menu_button_id = params.get('menu_button')
        # 当前登录用户角色可以分配的自定义部门权限
        dept_checked_disabled = RoleMenuButtonPermission.objects.filter(
            role_id__in=role_list, menu_button_id=menu_button_id
        ).values_list('dept', flat=True)
        dept_list = Dept.objects.values('id', 'name', 'parent')

        data = []
        for dept in dept_list:
            dept["disabled"] = False if is_superuser else dept["id"] not in dept_checked_disabled
            data.append(dept)
        return DetailResponse(data=data)
