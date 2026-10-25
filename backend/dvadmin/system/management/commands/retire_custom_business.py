"""Remove retired business navigation while retaining historical business data."""
import json
import sqlite3
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from dvadmin.system.models import Menu
from dvadmin3_flow.models import FlowInfo


BUSINESS_PREFIXES = (
    "design_order", "test_app", "portfolio", "plugins/dvadmin_portfolio",
)
TEST_FLOW_NAMES = ("请假审批流", "报销审批流", "请假单审批流")


def is_business_menu(menu):
    for key in ("web_path", "component"):
        value = (menu[key] or "").strip("/")
        if any(value == prefix or value.startswith(prefix + "/")
               or value.startswith(prefix + "_") for prefix in BUSINESS_PREFIXES):
            return True
    return False


class Command(BaseCommand):
    help = "Preview retired custom menus/flows; use --apply --backup-dir to remove menus and retire flows."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")
        parser.add_argument("--backup-dir", type=Path)

    def handle(self, *args, **options):
        menus = list(Menu.objects.values("id", "parent_id", "name", "web_path", "component"))
        ids = {menu["id"] for menu in menus if is_business_menu(menu)}
        while True:
            children = {menu["id"] for menu in menus if menu["parent_id"] in ids}
            if children <= ids:
                break
            ids.update(children)
        flows = [flow for flow in FlowInfo.objects.all()
                 if (flow.correlation_model_name or "").split(".")[0]
                 in ("design_order", "test_app", "dvadmin_portfolio")
                 or flow.name in TEST_FLOW_NAMES]
        flow_ids = [flow.pk for flow in flows]
        report = {
            "menus": [menu for menu in menus if menu["id"] in ids],
            "flows": [{"id": flow.pk, "name": flow.name, "status": flow.status,
                       "is_deleted": flow.is_deleted} for flow in flows],
        }
        self.stdout.write(json.dumps(report, ensure_ascii=False, indent=2))
        if not options["apply"]:
            self.stdout.write("Preview only. No database changes.")
            return
        backup_dir = options["backup_dir"]
        if backup_dir is None:
            raise CommandError("--backup-dir is required when applying changes.")
        if connection.vendor != "sqlite":
            raise CommandError("Automatic backup supports this project's SQLite database only.")
        backup_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        backup_file = backup_dir / ("before-retirement-" + stamp + ".sqlite3")
        connection.ensure_connection()
        with sqlite3.connect(backup_file) as target:
            connection.connection.backup(target)
        (backup_dir / ("retirement-" + stamp + ".json")).write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        with transaction.atomic():
            deleted, _ = Menu.objects.filter(pk__in=ids).delete()
            changed = FlowInfo.objects.filter(pk__in=flow_ids).update(status=2, is_deleted=True)
        self.stdout.write(self.style.SUCCESS(
            f"Removed {len(ids)} menus ({deleted} rows including related permissions); "
            f"retired {changed} flows. Business tables and workflow history retained. "
            f"Backup: {backup_file}"))
