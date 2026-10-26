from django.core.management.base import BaseCommand

from dvadmin.design_order.source_database import SourceDatabaseConfig
from dvadmin.design_order.store_sync import (
    DEFAULT_BATCH_SIZE,
    fetch_operating_stores,
    sync_design_order_stores,
)


class Command(BaseCommand):
    help = "同步 ds_all.jzsw_shop_number 中是否在营业为 1 的店铺"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="只计算新增、更新和未变化数量，不写入目标库",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=DEFAULT_BATCH_SIZE,
            help=f"批量写入大小，默认 {DEFAULT_BATCH_SIZE}",
        )

    def handle(self, *args, **options):
        config = SourceDatabaseConfig.from_environment()
        source_rows = fetch_operating_stores(config)
        result = sync_design_order_stores(
            source_rows,
            dry_run=options["dry_run"],
            batch_size=options["batch_size"],
        )
        mode = "预演" if options["dry_run"] else "同步"
        self.stdout.write(self.style.SUCCESS(
            f"{mode}完成: 运营中源店铺 {result.source_count} 条, "
            f"新增 {result.created_count} 条, "
            f"更新 {result.updated_count} 条, "
            f"未变化 {result.unchanged_count} 条"
        ))
