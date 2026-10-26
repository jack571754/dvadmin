from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from dvadmin.design_order.models import ProductSpecSubmission, UserPlatformPermission
from dvadmin.design_order.permissions_service import (
    can_delete_submission,
    can_edit_submission,
    can_share_submission,
    filter_stores_for_user,
    filter_submissions_for_user,
)
from dvadmin.design_order.store_models import DesignOrderStore
from dvadmin.system.models import (
    Dictionary,
    Menu,
    MenuButton,
    Role,
    RoleMenuButtonPermission,
)
from dvadmin.system.views.user import UserViewSet


User = get_user_model()


class DesignOrderPlatformPermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.operator = User.objects.create(username="operator", name="运营")
        self.other = User.objects.create(username="other_operator", name="其他运营")
        self.designer = User.objects.create(username="designer", name="设计")
        self.admin = User.objects.create(
            username="platform_admin",
            name="管理员",
            is_superuser=True,
            is_staff=True,
        )
        self.operator._buttons = {
            "Create": True,
            "Update": True,
            "Delete": True,
            "Copy": True,
            "Share": True,
        }
        self.other._buttons = dict(self.operator._buttons)
        self.designer._buttons = {
            "Create": False,
            "Update": False,
            "Delete": False,
            "Copy": False,
            "Share": True,
        }

        parent = Dictionary.objects.create(
            label="设计工单平台",
            value="design_order_store_platform",
            is_value=False,
            status=True,
        )
        for sort, platform in enumerate(("天猫", "京东", "抖音"), start=1):
            Dictionary.objects.create(
                label=platform,
                value=platform,
                parent=parent,
                is_value=True,
                status=True,
                sort=sort,
            )

        self.own_tmall_draft = self.make_submission(
            "本人天猫草稿", "天猫", "draft", self.operator
        )
        self.own_tmall_submitted = self.make_submission(
            "本人天猫已提交", "天猫", "submitted", self.operator
        )
        self.other_tmall_draft = self.make_submission(
            "他人天猫草稿", "天猫", "draft", self.other
        )
        self.other_tmall_submitted = self.make_submission(
            "他人天猫已提交", "天猫", "submitted", self.other
        )
        self.other_jd_submitted = self.make_submission(
            "他人京东已提交", "京东", "submitted", self.other
        )

    @staticmethod
    def make_submission(name, platform, status, creator):
        return ProductSpecSubmission.objects.create(
            name=name,
            platform=platform,
            status=status,
            creator=creator,
        )

    @staticmethod
    def button_permission(user, action):
        return getattr(user, "_buttons", {}).get(action, False)

    def visible_names(self, user):
        rows = filter_submissions_for_user(ProductSpecSubmission.objects.all(), user)
        return set(rows.values_list("name", flat=True))

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_user_without_platform_authorization_sees_nothing(self, _permission):
        self.assertEqual(self.visible_names(self.operator), set())

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_self_scope_only_exposes_own_platform_rows(self, _permission):
        UserPlatformPermission.objects.create(
            user=self.operator,
            platform="天猫",
            scope=UserPlatformPermission.SCOPE_SELF,
        )

        self.assertEqual(
            self.visible_names(self.operator),
            {"本人天猫草稿", "本人天猫已提交"},
        )

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_platform_all_exposes_submitted_rows_but_not_other_drafts(self, _permission):
        UserPlatformPermission.objects.create(
            user=self.operator,
            platform="天猫",
            scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
        )

        self.assertEqual(
            self.visible_names(self.operator),
            {"本人天猫草稿", "本人天猫已提交", "他人天猫已提交"},
        )

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_scope_is_independent_for_each_platform(self, _permission):
        UserPlatformPermission.objects.bulk_create(
            [
                UserPlatformPermission(
                    user=self.operator,
                    platform="天猫",
                    scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
                ),
                UserPlatformPermission(
                    user=self.operator,
                    platform="京东",
                    scope=UserPlatformPermission.SCOPE_SELF,
                ),
            ]
        )

        visible = self.visible_names(self.operator)

        self.assertIn("他人天猫已提交", visible)
        self.assertNotIn("他人京东已提交", visible)

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_designer_sees_all_submitted_rows_on_platform_all_scope(self, _permission):
        """设计不再有专用分支：platform_all 下走通用逻辑（他人已提交 + 本人全部）。

        设计通常不建单，自身无草稿，实际等价于“本平台所有人的已提交单”。
        身份不参与数据过滤，设计的只读由不配写按钮保证。
        """
        UserPlatformPermission.objects.bulk_create(
            [
                UserPlatformPermission(
                    user=self.designer,
                    platform="天猫",
                    scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
                ),
                UserPlatformPermission(
                    user=self.designer,
                    platform="京东",
                    scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
                ),
            ]
        )

        # platform_all 下 status=submitted 不限 creator：设计能看到两平台所有人的已提交单
        # （含 operator 建的“本人天猫已提交”），但看不到任何人的草稿
        self.assertEqual(
            self.visible_names(self.designer),
            {"本人天猫已提交", "他人天猫已提交", "他人京东已提交"},
        )

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_designer_own_draft_visible_but_others_draft_hidden(self, _permission):
        """草稿全局私有：即便走 platform_all，设计也能看到本人草稿、看不到他人草稿。"""
        designer_own_draft = self.make_submission(
            "设计本人天猫草稿", "天猫", "draft", self.designer
        )
        UserPlatformPermission.objects.create(
            user=self.designer,
            platform="天猫",
            scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
        )

        visible = self.visible_names(self.designer)
        self.assertIn("设计本人天猫草稿", visible)      # 本人草稿可见
        self.assertIn("他人天猫已提交", visible)         # 他人已提交可见
        self.assertNotIn("他人天猫草稿", visible)        # 他人草稿不可见

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_only_own_authorized_draft_can_be_edited_or_deleted(self, _permission):
        UserPlatformPermission.objects.create(
            user=self.operator,
            platform="天猫",
            scope=UserPlatformPermission.SCOPE_SELF,
        )

        self.assertTrue(can_edit_submission(self.operator, self.own_tmall_draft))
        self.assertTrue(can_delete_submission(self.operator, self.own_tmall_draft))
        self.assertFalse(can_edit_submission(self.operator, self.other_tmall_draft))
        self.assertFalse(can_delete_submission(self.operator, self.other_tmall_draft))
        self.assertFalse(can_edit_submission(self.operator, self.own_tmall_submitted))
        self.assertFalse(can_delete_submission(self.operator, self.own_tmall_submitted))

        UserPlatformPermission.objects.filter(user=self.operator).delete()
        self.assertFalse(can_delete_submission(self.operator, self.own_tmall_draft))

    @patch(
        "dvadmin.design_order.permissions_service.has_button_permission",
        side_effect=button_permission,
    )
    def test_share_requires_button_and_view_permission(self, _permission):
        UserPlatformPermission.objects.create(
            user=self.operator,
            platform="天猫",
            scope=UserPlatformPermission.SCOPE_SELF,
        )

        self.assertTrue(can_share_submission(self.operator, self.own_tmall_draft))
        self.assertFalse(can_share_submission(self.operator, self.other_tmall_submitted))
        self.operator._buttons["Share"] = False
        self.assertFalse(can_share_submission(self.operator, self.own_tmall_draft))

    def _grant_platform_permission_button(self, user):
        """给用户挂一个拥有 user:PlatformPermissionUpdate 按钮权限的角色。"""
        role = Role.objects.create(name="平台权限维护", key="platform_permission_maintainer")
        menu = Menu.objects.create(name="用户管理", component_name="user")
        button = MenuButton.objects.create(
            menu=menu,
            name="配置平台权限",
            value="user:PlatformPermissionUpdate",
            api="/api/system/user/{id}/update_platform_permissions/",
            method=2,
        )
        RoleMenuButtonPermission.objects.create(role=role, menu_button=button)
        user.role.add(role)
        return role

    def _put_platform_permissions(self, user, target, payload):
        view = UserViewSet.as_view({"put": "update_platform_permissions"})
        request = self.factory.put(
            f"/api/system/user/{target.pk}/update_platform_permissions/",
            payload,
            format="json",
        )
        force_authenticate(request, user=user)
        return view(request, pk=target.pk)

    def test_platform_permissions_require_button_authorization(self):
        payload = {
            "permissions": [
                {"platform": "天猫", "scope": "platform_all"},
                {"platform": "京东", "scope": "self"},
            ]
        }

        # 未被授权的普通用户：被 CustomPermission 拦截，不产生任何授权数据
        denied = self._put_platform_permissions(self.operator, self.designer, payload)
        self.assertEqual(denied.data["code"], 4000)
        self.assertFalse(
            UserPlatformPermission.objects.filter(user=self.designer).exists()
        )

        # 超级管理员：始终可用
        allowed = self._put_platform_permissions(self.admin, self.designer, payload)
        self.assertEqual(allowed.status_code, 200)
        self.assertEqual(allowed.data["code"], 2000)
        self.assertEqual(
            set(
                UserPlatformPermission.objects.filter(user=self.designer).values_list(
                    "platform", "scope"
                )
            ),
            {("天猫", "platform_all"), ("京东", "self")},
        )

    def test_role_with_platform_permission_button_can_update(self):
        self._grant_platform_permission_button(self.operator)

        granted = self._put_platform_permissions(
            self.operator,
            self.designer,
            {"permissions": [{"platform": "抖音", "scope": "self"}]},
        )

        self.assertEqual(granted.data["code"], 2000)
        self.assertEqual(
            set(
                UserPlatformPermission.objects.filter(user=self.designer).values_list(
                    "platform", "scope"
                )
            ),
            {("抖音", "self")},
        )


class DesignOrderStoreFilterTests(TestCase):
    """店铺列表按用户授权平台过滤：只看得到被授权平台的店铺。"""

    def setUp(self):
        self.operator = User.objects.create(username="store_operator", name="运营")
        self.admin = User.objects.create(
            username="store_admin",
            name="管理员",
            is_superuser=True,
            is_staff=True,
        )
        specs = [
            ("TM001", "天猫旗舰店", "天猫"),
            ("TM002", "天猫专营店", "天猫"),
            ("JD001", "京东自营", "京东"),
            ("DY001", "抖音小店", "抖音"),
        ]
        for code, name, platform in specs:
            DesignOrderStore.objects.create(
                store_code=code,
                store_name=name,
                store_type="旗舰",
                brand="品牌",
                platform=platform,
                owner_name="负责人",
                status=True,
            )

    def visible_codes(self, user):
        rows = filter_stores_for_user(DesignOrderStore.objects.all(), user)
        return set(rows.values_list("store_code", flat=True))

    def test_admin_sees_all_stores(self):
        self.assertEqual(
            self.visible_codes(self.admin),
            {"TM001", "TM002", "JD001", "DY001"},
        )

    def test_user_without_authorization_sees_no_store(self):
        self.assertEqual(self.visible_codes(self.operator), set())

    def test_user_only_sees_authorized_platform_stores(self):
        UserPlatformPermission.objects.bulk_create(
            [
                UserPlatformPermission(
                    user=self.operator,
                    platform="天猫",
                    scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
                ),
                UserPlatformPermission(
                    user=self.operator,
                    platform="京东",
                    scope=UserPlatformPermission.SCOPE_SELF,
                ),
            ]
        )
        # 天猫两个 + 京东一个可见；抖音未授权不可见。scope 对店铺不起作用，
        # 只要平台被授权就能看到该平台全部店铺。
        self.assertEqual(
            self.visible_codes(self.operator),
            {"TM001", "TM002", "JD001"},
        )


class AdminRoleDataScopeTests(TestCase):
    """admin 角色（非 superuser）不再自动全放行：数据受平台授权约束，
    配置平台权限也需要显式的按钮权限。仅 superadmin 例外。"""

    def setUp(self):
        self.factory = APIRequestFactory()
        self.admin_role = Role.objects.create(name="管理员", key="admin", sort=1, status=True)
        # 带 admin 角色但 is_superuser=False
        self.role_admin = User.objects.create(username="role_admin", name="角色管理员")
        self.role_admin.role.add(self.admin_role)
        # 真·超级管理员
        self.superadmin = User.objects.create(
            username="super", name="超管", is_superuser=True, is_staff=True
        )
        self.other = User.objects.create(username="other", name="其他人")

        parent = Dictionary.objects.create(
            label="设计工单平台", value="design_order_store_platform",
            is_value=False, status=True,
        )
        for sort, platform in enumerate(("天猫", "京东"), start=1):
            Dictionary.objects.create(
                label=platform, value=platform, parent=parent,
                is_value=True, status=True, sort=sort,
            )
        self.tmall_submitted = ProductSpecSubmission.objects.create(
            name="他人天猫已提交", platform="天猫", status="submitted", creator=self.other
        )

    def visible_names(self, user):
        rows = filter_submissions_for_user(ProductSpecSubmission.objects.all(), user)
        return set(rows.values_list("name", flat=True))

    def test_admin_role_without_authorization_sees_nothing(self):
        """admin 角色无平台授权时看不到任何数据（不再自动全放行）。"""
        self.assertEqual(self.visible_names(self.role_admin), set())

    def test_admin_role_sees_only_authorized_platform(self):
        """给 admin 角色配了天猫 platform_all 后，才看得到天猫他人已提交。"""
        UserPlatformPermission.objects.create(
            user=self.role_admin, platform="天猫",
            scope=UserPlatformPermission.SCOPE_PLATFORM_ALL,
        )
        self.assertEqual(self.visible_names(self.role_admin), {"他人天猫已提交"})

    def test_superadmin_still_sees_all(self):
        """superadmin 不受平台授权约束，仍看全部。"""
        self.assertEqual(self.visible_names(self.superadmin), {"他人天猫已提交"})

    def test_admin_role_without_button_permission_cannot_update(self):
        """admin 角色本身不带 user:PlatformPermissionUpdate 按钮权限时不能配平台权限。"""
        payload = {"permissions": [{"platform": "天猫", "scope": "platform_all"}]}
        view = UserViewSet.as_view({"put": "update_platform_permissions"})

        denied = self.factory.put("/users/1/platform_permissions/", payload, format="json")
        force_authenticate(denied, user=self.role_admin)
        view(denied, pk=self.other.pk)
        self.assertFalse(
            UserPlatformPermission.objects.filter(user=self.other).exists()
        )

        allowed = self.factory.put("/users/1/platform_permissions/", payload, format="json")
        force_authenticate(allowed, user=self.superadmin)
        resp = view(allowed, pk=self.other.pk)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(
            UserPlatformPermission.objects.filter(user=self.other).exists()
        )
