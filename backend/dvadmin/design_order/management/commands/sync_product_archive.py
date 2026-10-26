from django.core.management.base import BaseCommand

from dvadmin.design_order.product_archive_sync import (
    DEFAULT_BATCH_SIZE,
    SourceDatabaseConfig,
    fetch_source_products,
    sync_product_archive,
)


class Command(BaseCommand):
    help = "从 ds_all.jzsw_product_cmr 幂等同步产品档案"

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
        source_rows = fetch_source_products(config)
        result = sync_product_archive(
            source_rows,
            dry_run=options["dry_run"],
            batch_size=options["batch_size"],
        )
        mode = "预演" if options["dry_run"] else "同步"
        self.stdout.write(self.style.SUCCESS(
            f"{mode}完成: 源数据 {result.source_count} 条, "
            f"新增 {result.created_count} 条, "
            f"更新 {result.updated_count} 条, "
            f"未变化 {result.unchanged_count} 条"
        ))
