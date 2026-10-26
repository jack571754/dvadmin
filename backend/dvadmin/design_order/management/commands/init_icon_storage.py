from django.core.management.base import BaseCommand

from dvadmin.design_order.icon_storage import ensure_bucket


class Command(BaseCommand):
    help = "检查并创建设计工单 Icon 专用 MinIO Bucket"

    def handle(self, *args, **options):
        bucket_name = ensure_bucket()
        self.stdout.write(
            self.style.SUCCESS(f"Icon MinIO Bucket 已就绪: {bucket_name}")
        )
