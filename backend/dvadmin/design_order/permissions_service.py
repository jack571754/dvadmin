"""设计工单平台数据权限服务。"""
from django.db.models import Q

from dvadmin.system.models import Dictionary, RoleMenuButtonPermission
from .models import ProductSpecSubmission, UserPlatformPermission

SUBMISSION_BUTTON_PREFIX = "design_order:product_spec_submission:"


def is_system_admin(user):
    """按钮能力维度：superadmin 或 admin 角色都视为系统管理员。

    注意：数据可见性与“谁能配平台权限”只认 is_superuser（见下方各函数），
    admin 角色对数据不再自动全放行，需由 superadmin 逐平台分配。
    """
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if user.is_superuser:
        return True
    return user.role.filter(key="admin", status=True).exists()


def is_data_superuser(user):
    """数据可见性维度：仅 superadmin 数据全放行，admin 角色亦受平台授权约束。"""
    return bool(getattr(user, "is_superuser", False))


def has_button_permission(user, action):
    if is_system_admin(user):
        return True
    value = action if ":" in action else f"{SUBMISSION_BUTTON_PREFIX}{action}"
    return RoleMenuButtonPermission.objects.filter(
        role__in=user.role.all(), menu_button__value=value
    ).exists()


def get_platform_choices():
    parent = Dictionary.objects.filter(value="design_order_store_platform", status=True).first()
    if not parent:
        return []
    return list(parent.sublist.filter(status=True, is_value=True).order_by("sort", "id").values("label", "value"))


def get_user_platform_permissions(user):
    if not user or not getattr(user, "is_authenticated", False):
        return {}
    return {
        item.platform: item.scope
        for item in UserPlatformPermission.objects.filter(user=user).only("platform", "scope")
    }


def get_valid_platforms(user):
    return set(get_user_platform_permissions(user))


def get_scope(user, platform):
    return get_user_platform_permissions(user).get(platform)


def filter_submissions_for_user(queryset, user):
    """按平台授权 scope 逐平台过滤，草稿全局私有。

    身份（设计/运营）不参与数据过滤：设计的“只读”由按钮权限保证，
    “看什么”仅由该平台授权的 scope 决定，所有非 superadmin 走同一套逻辑。
    """
    if is_data_superuser(user):
        return queryset
    permissions = get_user_platform_permissions(user)
    if not permissions:
        return queryset.none()

    own = Q(creator_id=user.id)
    clauses = Q()
    for platform, scope in permissions.items():
        platform_filter = Q(platform=platform)
        if scope == UserPlatformPermission.SCOPE_PLATFORM_ALL:
            # 本平台他人已提交 + 本人全部（含本人草稿）
            clauses |= platform_filter & (Q(status="submitted") | own)
        else:
            # 仅本人（本人草稿 + 本人已提交）
            clauses |= platform_filter & own
    return queryset.filter(clauses)


def filter_stores_for_user(queryset, user):
    """按用户授权平台过滤店铺列表。

    店铺是共享基础数据，无 scope/creator 概念：只要用户被授权了该平台，
    就能看到该平台的全部店铺；未授权平台的店铺一律不可见。仅 superadmin 看全部。
    """
    if is_data_superuser(user):
        return queryset
    platforms = get_valid_platforms(user)
    if not platforms:
        return queryset.none()
    return queryset.filter(platform__in=platforms)


def can_view_submission(user, submission):
    return filter_submissions_for_user(
        ProductSpecSubmission.objects.filter(pk=submission.pk), user
    ).exists()


def can_create_submission(user, platform):
    return (
        has_button_permission(user, "Create")
        and (is_data_superuser(user) or platform in get_valid_platforms(user))
    )


def can_edit_submission(user, submission):
    return (
        submission.status == "draft"
        and submission.creator_id == user.id
        and has_button_permission(user, "Update")
        and can_create_submission(user, submission.platform)
    )


def can_delete_submission(user, submission):
    return (
        submission.status == "draft"
        and submission.creator_id == user.id
        and has_button_permission(user, "Delete")
        and can_create_submission(user, submission.platform)
    )


def can_copy_submission(user, submission):
    return (
        has_button_permission(user, "Copy")
        and can_create_submission(user, submission.platform)
        and can_view_submission(user, submission)
    )


def can_share_submission(user, submission):
    return has_button_permission(user, "Share") and can_view_submission(user, submission)


def submission_permissions(user, submission):
    return {
        "canEdit": can_edit_submission(user, submission),
        "canDelete": can_delete_submission(user, submission),
        "canCopy": can_copy_submission(user, submission),
        "canShare": can_share_submission(user, submission),
    }
