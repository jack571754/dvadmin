import hashlib

from django.contrib.auth.hashers import make_password, check_password
from django.utils.translation import gettext_lazy as _
from django_restql.fields import DynamicSerializerMethodField
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from django.db.models import Q
from application import dispatch
from dvadmin.system.models import Users, Role, Dept
from dvadmin.system.views.role import RoleSerializer
from dvadmin.utils.json_response import ErrorResponse, DetailResponse, SuccessResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.validator import CustomUniqueValidator
from dvadmin.utils.viewset import CustomModelViewSet


def recursion(instance, parent, result):
    new_instance = getattr(instance, parent, None)
    res = []
    data = getattr(instance, result, None)
    if data:
        res.append(data)
    if new_instance:
        array = recursion(new_instance, parent, result)
        res += array
    return res


class UserSerializer(CustomModelSerializer):
    """
    用户管理-序列化器
    """
    dept_name = serializers.CharField(source='dept.name', read_only=True)
    role_info = DynamicSerializerMethodField()
    dept_name_all = serializers.SerializerMethodField()

    class Meta:
        model = Users
        read_only_fields = ["id"]
        exclude = ["password"]
        extra_kwargs = {
            "post": {"required": False},
            "mobile": {"required": False},
        }

    def get_dept_name_all(self, instance):
        dept_name_all = recursion(instance.dept, "parent", "name")
        dept_name_all.reverse()
        return "/".join(dept_name_all)

    def get_role_info(self, instance, parsed_query):
        roles = instance.role.all()
        # You can do what ever you want in here
        # `parsed_query` param is passed to BookSerializer to allow further querying
        serializer = RoleSerializer(
            roles,
            many=True,
            parsed_query=parsed_query
        )
        return serializer.data


class UserCreateSerializer(CustomModelSerializer):
    """
    用户新增-序列化器
    """

    username = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message=_("Username must be unique"))
        ],
    )
    password = serializers.CharField(
        required=False,
    )

    def validate_password(self, value):
        """
        对密码进行验证
        """
        md5 = hashlib.md5()
        md5.update(value.encode('utf-8'))
        md5_password = md5.hexdigest()
        return make_password(md5_password)

    def save(self, **kwargs):
        data = super().save(**kwargs)
        data.dept_belong_id = data.dept_id
        data.save()
        if not self.validated_data.get('manage_dept', None):
            data.manage_dept.add(data.dept_id)
        data.post.set(self.initial_data.get("post", []))
        return data

    class Meta:
        model = Users
        fields = "__all__"
        read_only_fields = ["id"]
        extra_kwargs = {
            "post": {"required": False},
            "mobile": {"required": False},
        }


class UserUpdateSerializer(CustomModelSerializer):
    """
    用户修改-序列化器
    """

    username = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message=_("Username must be unique"))
        ],
    )

    def validate_is_active(self, value):
        """
        更改激活状态
        """
        if value:
            self.initial_data["login_error_count"] = 0
        return value

    def save(self, **kwargs):
        data = super().save(**kwargs)
        data.dept_belong_id = data.dept_id
        data.save()
        if not self.validated_data.get('manage_dept', None):
            data.manage_dept.add(data.dept_id)
        data.post.set(self.initial_data.get("post", []))
        return data

    class Meta:
        model = Users
        read_only_fields = ["id", "password"]
        fields = "__all__"
        extra_kwargs = {
            "post": {"required": False, "read_only": True},
            "mobile": {"required": False},
        }


class UserInfoUpdateSerializer(CustomModelSerializer):
    """
    用户修改-序列化器
    """
    mobile = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message=_("Mobile number must be unique"))
        ],
        allow_blank=True
    )

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    class Meta:
        model = Users
        fields = ['email', 'mobile', 'avatar', 'name', 'gender']
        extra_kwargs = {
            "post": {"required": False, "read_only": True},
            "mobile": {"required": False},
        }


class ExportUserProfileSerializer(CustomModelSerializer):
    """
    用户导出 序列化器
    """

    last_login = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False, read_only=True
    )
    is_active = serializers.SerializerMethodField(read_only=True)
    dept_name = serializers.CharField(source="dept.name", default="")
    dept_owner = serializers.CharField(source="dept.owner", default="")
    gender = serializers.CharField(source="get_gender_display", read_only=True)

    def get_is_active(self, instance):
        return _("Enabled") if instance.is_active else _("Disabled")

    class Meta:
        model = Users
        fields = (
            "username",
            "name",
            "email",
            "mobile",
            "gender",
            "is_active",
            "last_login",
            "dept_name",
            "dept_owner",
        )


class UserProfileImportSerializer(CustomModelSerializer):
    password = serializers.CharField(read_only=True, required=False)

    def save(self, **kwargs):
        data = super().save(**kwargs)
        password = hashlib.new(
            "md5", str(self.initial_data.get("password", "admin123456")).encode(encoding="UTF-8")
        ).hexdigest()
        data.set_password(password)
        data.save()
        return data

    class Meta:
        model = Users
        exclude = (
            "post",
            "user_permissions",
            "groups",
            "is_superuser",
            "date_joined",
        )


class UserViewSet(CustomModelViewSet):
    """
    用户接口
    list:查询
    create:新增
    update:修改
    retrieve:单例
    destroy:删除
    """

    queryset = Users.objects.exclude(is_superuser=1).all()
    serializer_class = UserSerializer
    create_serializer_class = UserCreateSerializer
    update_serializer_class = UserUpdateSerializer
    filter_fields = ["name", "username", "gender", "is_active", "dept", "user_type"]
    search_fields = ["username", "name", "dept__name", "role__name"]
    # 导出
    export_field_label = {
        "username": _("Username"),
        "name": _("Full name"),
        "email": _("Email"),
        "mobile": _("Mobile"),
        "gender": _("Gender"),
        "is_active": _("Account status"),
        "last_login": _("Last login time"),
        "dept_name": _("Department name"),
        "dept_owner": _("Department head"),
    }
    export_serializer_class = ExportUserProfileSerializer
    # 导入
    import_serializer_class = UserProfileImportSerializer
    import_field_dict = {
        "username": _("Login username"),
        "name": _("Full name"),
        "email": _("Email"),
        "mobile": _("Mobile"),
        "gender": {
            "title": _("Gender"),
            "choices": {
                "data": {"未知": 2, "男": 1, "女": 0},
            }
        },
        "is_active": {
            "title": _("Account status"),
            "choices": {
                "data": {"启用": True, "禁用": False},
            }
        },
        "dept": {"title": _("Department"), "choices": {"queryset": Dept.objects.filter(status=True), "values_name": "name"}},
        "role": {"title": _("Role"), "choices": {"queryset": Role.objects.filter(status=True), "values_name": "name"}},
    }

    @action(methods=["GET"], detail=False, permission_classes=[IsAuthenticated])
    def user_info(self, request):
        """获取当前用户信息"""
        user = request.user
        result = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "mobile": user.mobile,
            "user_type": user.user_type,
            "gender": user.gender,
            "email": user.email,
            "avatar": user.avatar,
            "dept": user.dept_id,
            "is_superuser": user.is_superuser,
            "role": user.role.values_list('id', flat=True),
            "pwd_change_count":user.pwd_change_count,
            "language": getattr(user, 'language', 'zh-cn') or 'zh-cn',
        }
        if hasattr(connection, 'tenant'):
            result['tenant_id'] = connection.tenant and connection.tenant.id
            result['tenant_name'] = connection.tenant and connection.tenant.name
        dept = getattr(user, 'dept', None)
        if dept:
            result['dept_info'] = {
                'dept_id': dept.id,
                'dept_name': dept.name
            }
        else:
            result['dept_info'] = {
                'dept_id': None,
                'dept_name': _("No department")
            }
        role = getattr(user, 'role', None)
        if role:
            result['role_info'] = role.values('id', 'name', 'key')
        return DetailResponse(data=result, msg=_("Query successful"))

    @action(methods=["PUT"], detail=False, permission_classes=[IsAuthenticated])
    def update_user_info(self, request):
        """修改当前用户信息"""
        serializer = UserInfoUpdateSerializer(request.user, data=request.data, request=request)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return DetailResponse(data=None, msg=_("Update successful"))

    @action(methods=["PUT"], detail=False, permission_classes=[IsAuthenticated])
    def change_password(self, request, *args, **kwargs):
        """密码修改"""
        data = request.data
        old_pwd = data.get("oldPassword")
        new_pwd = data.get("newPassword")
        new_pwd2 = data.get("newPassword2")
        if old_pwd is None or new_pwd is None or new_pwd2 is None:
            return ErrorResponse(msg=_("Parameters cannot be empty"))
        if new_pwd != new_pwd2:
            return ErrorResponse(msg=_("Passwords do not match"))
        verify_password = check_password(old_pwd, request.user.password)
        if not verify_password:
            old_pwd_md5 = hashlib.md5(old_pwd.encode(encoding='UTF-8')).hexdigest()
            verify_password = check_password(str(old_pwd_md5), request.user.password)
            # 创建用户时、自定义密码无法修改问题
            if not verify_password:
                old_pwd_md5 = hashlib.md5(old_pwd_md5.encode(encoding='UTF-8')).hexdigest()
                verify_password = check_password(str(old_pwd_md5), request.user.password)
        if verify_password:
            # request.user.password = make_password(hashlib.md5(new_pwd.encode(encoding='UTF-8')).hexdigest())
            request.user.password = make_password(hashlib.md5(new_pwd.encode(encoding='UTF-8')).hexdigest())
            request.user.pwd_change_count += 1
            request.user.save()
            return DetailResponse(data=None, msg=_("Update successful"))
        else:
            return ErrorResponse(msg=_("Old password is incorrect"))

    @action(methods=["post"], detail=False, permission_classes=[IsAuthenticated])
    def login_change_password(self, request, *args, **kwargs):
        """初次登录进行密码修改"""
        data = request.data
        new_pwd = data.get("password")
        new_pwd2 = data.get("password_regain")
        if new_pwd != new_pwd2:
            return ErrorResponse(msg=_("Passwords do not match"))
        else:
            request.user.password = make_password(new_pwd)
            request.user.pwd_change_count += 1
            request.user.save()
            return DetailResponse(data=None, msg=_("Update successful"))

    @action(methods=["PUT"], detail=False, permission_classes=[IsAuthenticated])
    def update_language(self, request, *args, **kwargs):
        """更新当前用户语言偏好 (FNT-05, INT-01)"""
        lang = request.data.get("language", "zh-cn")
        valid_locales = ["zh-cn", "en", "zh-tw"]
        if lang not in valid_locales:
            return ErrorResponse(msg=_("Invalid language code"))
        user = request.user
        user.language = lang
        user.save(update_fields=["language", "modifier", "modifier_time"])
        return DetailResponse(data={"language": lang}, msg=_("Language updated successfully"))

    @action(methods=["PUT"], detail=True, permission_classes=[IsAuthenticated])
    def reset_to_default_password(self, request,pk):
        """恢复默认密码"""
        if not self.request.user.is_superuser:
            return ErrorResponse(msg=_("Only super administrators can reset passwords"))
        instance = Users.objects.filter(id=pk).first()
        if instance:
            default_password = dispatch.get_system_config_values("base.default_password")
            md5_pwd = hashlib.md5(default_password.encode(encoding='UTF-8')).hexdigest()
            instance.password = make_password(md5_pwd)
            instance.save()
            return DetailResponse(data=None, msg=_("Password reset successful"))
        else:
            return ErrorResponse(msg=_("User not found"))

    @action(methods=["PUT"], detail=True)
    def reset_password(self, request, pk):
        """
        密码重置
        """
        if not self.request.user.is_superuser:
            return ErrorResponse(msg=_("Only super administrators can reset passwords"))
        instance = Users.objects.filter(id=pk).first()
        data = request.data
        new_pwd = data.get("newPassword")
        new_pwd2 = data.get("newPassword2")
        if instance:
            if new_pwd != new_pwd2:
                return ErrorResponse(msg=_("Passwords do not match"))
            else:
                instance.password = make_password(new_pwd)
                instance.save()
                return DetailResponse(data=None, msg=_("Update successful"))
        else:
            return ErrorResponse(msg=_("User not found"))

    def list(self, request, *args, **kwargs):
        dept_id = request.query_params.get('dept')
        show_all = request.query_params.get('show_all')
        if not dept_id:
            dept_id = ''
        if not show_all:
            show_all = 0
        if int(show_all):
            all_did = [dept_id]
            def inner(did):
                sub = Dept.objects.filter(parent_id=did)
                if not sub.exists():
                    return
                for i in sub:
                    all_did.append(i.pk)
                    inner(i)
            if dept_id != '':
                inner(dept_id)
                searchs = [
                    Q(**{f+'__icontains':i})
                    for f in self.search_fields
                ] if (i:=request.query_params.get('search')) else []
                q_obj = []
                if searchs:
                    q = searchs[0]
                    for i in searchs[1:]:
                        q |= i
                    q_obj.append(Q(q))
                queryset = Users.objects.filter(*q_obj, dept_id__in=all_did)
            else:
                queryset = self.filter_queryset(self.get_queryset())
        else:
            queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(data=serializer.data, msg=_("Query successful"))
