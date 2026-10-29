"""Migrate and seed an E2E database without copying user data."""
import os
import sys
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend))
os.environ["DJANGO_SETTINGS_MODULE"] = "application.e2e_settings"
import django
django.setup()

from django.core.management import call_command
from django.db import connection, transaction
from dvadmin.system.models import (
    Dept, Menu, MenuButton, Role, RoleMenuPermission,
    RoleMenuButtonPermission, SystemConfig, Users,
)

assert Path(connection.settings_dict["NAME"]).resolve() == (backend / ".e2e/db.sqlite3").resolve()
call_command("migrate", interactive=False, run_syncdb=True, verbosity=0, skip_checks=True)
call_command("init", verbosity=0)

with transaction.atomic():
    # The installed Celery fixture and local wrappers share routes; retain one
    # local component per route so the isolated seed matches this checkout.
    for path, component in (("/taskManage", "celery/task/index"), ("/taskLog", "celery/taskLog/index")):
        rows = Menu.objects.filter(web_path=path)
        local = rows.filter(component=component).first() or rows.first()
        if local:
            rows.exclude(pk=local.pk).delete()
            Menu.objects.filter(pk=local.pk).update(component=component)
    root, _ = Dept.objects.update_or_create(key="e2e-root", defaults={"name": "E2E 总部", "status": True})
    other, _ = Dept.objects.update_or_create(key="e2e-other", defaults={"name": "E2E 其他部门", "status": True})
    menu = Menu.objects.get(component="system/user/index")
    Menu.objects.filter(pk=menu.pk).update(visible=True)
    password = os.environ.get("TEST_ADMIN_PASSWORD", "E2eOnly-ChangeMe123!")
    for username, superuser, dept in (
        ("e2e_admin", True, root), ("e2e_reader", False, root),
        ("e2e_scoped", False, root), ("e2e_outside", False, other),
    ):
        user, _ = Users.objects.update_or_create(username=username, defaults={
            "name": username, "is_superuser": superuser, "is_staff": superuser,
            "is_active": True, "dept": dept, "dept_belong_id": str(dept.pk),
            "pwd_change_count": 1, "login_error_count": 0,
        })
        user.set_password(password)
        user.save()
        role, _ = Role.objects.update_or_create(key=username, defaults={"name": username, "status": True})
        user.role.set([role])
        RoleMenuPermission.objects.get_or_create(role=role, menu=menu)
        if menu.parent_id:
            RoleMenuPermission.objects.get_or_create(role=role, menu=menu.parent)
        query, _ = MenuButton.objects.get_or_create(value="user:Search", defaults={
            "menu": menu, "name": "查询", "api": "/api/system/user/", "method": 0,
        })
        RoleMenuButtonPermission.objects.update_or_create(role=role, menu_button=query,
            defaults={"data_range": 2 if username == "e2e_scoped" else 3})
    SystemConfig.objects.filter(key="captcha_state", parent__key="base").update(value=False)

print("E2E seed ready: separate backend/.e2e/db.sqlite3; admin, reader and scoped roles.")
