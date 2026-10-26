import secrets

from django.db import models

from dvadmin.utils.models import CoreModel


def generate_share_code() -> str:
    return secrets.token_urlsafe(18)


class ProductSpecShare(CoreModel):
    """
    规格提报分享链接。
    """
    submission = models.OneToOneField(
        "design_order.ProductSpecSubmission",
        on_delete=models.CASCADE,
        related_name="share_link",
        verbose_name="规格提报",
        db_comment="关联的规格提报历史记录",
    )
    share_code = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        default=generate_share_code,
        verbose_name="分享码",
        db_comment="规格提报分享链接唯一编码",
    )
    enabled = models.BooleanField(
        default=True,
        verbose_name="是否启用",
        db_comment="分享链接是否启用",
    )

    class Meta:
        db_table = "dvadmin_design_order_product_spec_share"
        db_table_comment = "设计工单规格提报分享链接表"
        verbose_name = "规格提报分享链接"
        verbose_name_plural = verbose_name
        ordering = ["-create_datetime"]

    def __str__(self):
        return f"{self.submission_id}:{self.share_code}"
