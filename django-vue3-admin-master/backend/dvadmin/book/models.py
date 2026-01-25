"""
图书管理系统 - 数据模型

本文件定义了图书管理系统的所有数据模型，包括：
- Book: 图书信息表
- BookCategory: 图书分类表
- BookAuthor: 图书作者表
- BookPublisher: 图书出版社表
- BookBorrow: 图书借阅记录表
- BookReservation: 图书预约记录表

所有模型都继承自 CoreModel，自动获得创建时间、更新时间、创建人、更新人等基础字段。
"""

from django.db import models
from dvadmin.utils.models import CoreModel, table_prefix


class BookCategory(CoreModel):
    """
    图书分类模型
    用于管理图书的分类信息，支持树形结构（父子分类）
    """
    name = models.CharField(max_length=64, verbose_name="分类名称", help_text="图书分类名称")
    code = models.CharField(max_length=64, unique=True, verbose_name="分类编码", help_text="唯一的分类编码")
    sort = models.IntegerField(default=1, verbose_name="排序", help_text="分类显示顺序")
    parent = models.ForeignKey(
        to="self",
        on_delete=models.CASCADE,
        verbose_name="父分类",
        null=True,
        blank=True,
        db_constraint=False,
        help_text="父分类ID，支持多级分类"
    )
    description = models.TextField(verbose_name="分类描述", null=True, blank=True, help_text="分类详细描述")
    status = models.BooleanField(default=True, verbose_name="状态", help_text="是否启用该分类")

    class Meta:
        db_table = table_prefix + "book_category"
        verbose_name = "图书分类表"
        verbose_name_plural = verbose_name
        ordering = ("sort",)

    def __str__(self):
        return self.name


class BookPublisher(CoreModel):
    """
    图书出版社模型
    用于管理图书的出版社信息
    """
    name = models.CharField(max_length=128, verbose_name="出版社名称", help_text="出版社名称")
    code = models.CharField(max_length=64, unique=True, verbose_name="出版社编码", help_text="唯一编码")
    address = models.CharField(max_length=255, verbose_name="出版社地址", null=True, blank=True, help_text="详细地址")
    contact = models.CharField(max_length=32, verbose_name="联系人", null=True, blank=True, help_text="主要联系人")
    phone = models.CharField(max_length=20, verbose_name="联系电话", null=True, blank=True, help_text="联系电话")
    email = models.EmailField(max_length=64, verbose_name="邮箱", null=True, blank=True, help_text="联系邮箱")
    website = models.URLField(max_length=128, verbose_name="官网地址", null=True, blank=True, help_text="官方网站")

    class Meta:
        db_table = table_prefix + "book_publisher"
        verbose_name = "图书出版社表"
        verbose_name_plural = verbose_name
        ordering = ("name",)

    def __str__(self):
        return self.name


class BookAuthor(CoreModel):
    """
    图书作者模型
    用于管理图书的作者信息
    """
    name = models.CharField(max_length=64, verbose_name="作者姓名", help_text="作者真实姓名")
    pen_name = models.CharField(max_length=64, verbose_name="笔名", null=True, blank=True, help_text="作者笔名")
    gender = models.IntegerField(
        choices=((0, "未知"), (1, "男"), (2, "女")),
        default=0,
        verbose_name="性别",
        help_text="作者性别"
    )
    country = models.CharField(max_length=64, verbose_name="国籍", null=True, blank=True, help_text="作者国籍")
    birth_date = models.DateField(verbose_name="出生日期", null=True, blank=True, help_text="出生日期")
    death_date = models.DateField(verbose_name="逝世日期", null=True, blank=True, help_text="逝世日期")
    biography = models.TextField(verbose_name="作者简介", null=True, blank=True, help_text="作者详细简介")

    class Meta:
        db_table = table_prefix + "book_author"
        verbose_name = "图书作者表"
        verbose_name_plural = verbose_name
        ordering = ("name",)

    def __str__(self):
        return f"{self.name} ({self.pen_name or '无笔名'})"


class Book(CoreModel):
    """
    图书信息模型
    核心模型，用于管理图书馆的图书信息
    """
    # 基本信息
    isbn = models.CharField(max_length=20, unique=True, verbose_name="ISBN编号", help_text="国际标准书号")
    title = models.CharField(max_length=255, verbose_name="书名", help_text="图书名称")
    subtitle = models.CharField(max_length=255, verbose_name="副标题", null=True, blank=True, help_text="图书副标题")
    original_title = models.CharField(max_length=255, verbose_name="原名", null=True, blank=True, help_text="外文图书原名")

    # 关联信息
    category = models.ForeignKey(
        to=BookCategory,
        on_delete=models.PROTECT,
        verbose_name="图书分类",
        db_constraint=False,
        related_name="books",
        help_text="所属分类"
    )
    publisher = models.ForeignKey(
        to=BookPublisher,
        on_delete=models.PROTECT,
        verbose_name="出版社",
        db_constraint=False,
        related_name="books",
        help_text="出版该书的出版社"
    )
    authors = models.ManyToManyField(
        to=BookAuthor,
        verbose_name="作者",
        db_constraint=False,
        related_name="books",
        help_text="该书的所有作者"
    )

    # 出版信息
    publish_date = models.DateField(verbose_name="出版日期", null=True, blank=True, help_text="出版日期")
    edition = models.CharField(max_length=32, verbose_name="版次", null=True, blank=True, help_text="如：第1版")
    print_number = models.CharField(max_length=32, verbose_name="印次", null=True, blank=True, help_text="如：第1次印刷")
    pages = models.IntegerField(verbose_name="页数", null=True, blank=True, help_text="图书总页数")
    word_count = models.IntegerField(verbose_name="字数", null=True, blank=True, help_text="图书字数（千字）")

    # 物理信息
    format = models.CharField(max_length=32, verbose_name="开本", null=True, blank=True, help_text="如：16开、32开")
    paper = models.CharField(max_length=64, verbose_name="纸张", null=True, blank=True, help_text="纸张类型")
    packaging = models.CharField(max_length=32, verbose_name="装帧", null=True, blank=True, help_text="如：平装、精装")

    # 库存信息
    total_quantity = models.IntegerField(default=0, verbose_name="总册数", help_text="图书总数量")
    available_quantity = models.IntegerField(default=0, verbose_name="可借册数", help_text="当前可借数量")
    location = models.CharField(max_length=64, verbose_name="存放位置", null=True, blank=True, help_text="图书馆存放位置")

    # 价格信息
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="定价", null=True, blank=True, help_text="图书定价")

    # 其他信息
    language = models.CharField(max_length=32, verbose_name="语言", null=True, blank=True, help_text="图书语言")
    summary = models.TextField(verbose_name="内容简介", null=True, blank=True, help_text="图书内容摘要")
    cover = models.ImageField(upload_to="book/covers/", null=True, blank=True, verbose_name="封面图片", help_text="图书封面")
    tags = models.CharField(max_length=255, verbose_name="标签", null=True, blank=True, help_text="图书标签，多个用逗号分隔")

    # 状态
    STATUS_CHOICES = (
        (0, "上架"),
        (1, "下架"),
        (2, "遗失"),
        (3, "报废"),
    )
    status = models.IntegerField(default=0, choices=STATUS_CHOICES, verbose_name="状态", help_text="图书状态")

    class Meta:
        db_table = table_prefix + "book"
        verbose_name = "图书信息表"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        """判断图书是否可借阅"""
        return self.available_quantity > 0 and self.status == 0


class BookBorrow(CoreModel):
    """
    图书借阅记录模型
    记录图书的借阅和归还信息
    """
    book = models.ForeignKey(
        to=Book,
        on_delete=models.PROTECT,
        verbose_name="图书",
        db_constraint=False,
        related_name="borrow_records",
        help_text="借阅的图书"
    )

    STATUS_CHOICES = (
        (0, "借阅中"),
        (1, "已归还"),
        (2, "逾期未还"),
        (3, "已续借"),
    )
    status = models.IntegerField(default=0, choices=STATUS_CHOICES, verbose_name="借阅状态", help_text="借阅状态")

    borrow_date = models.DateTimeField(verbose_name="借阅时间", auto_now_add=True, help_text="借阅时间")
    due_date = models.DateTimeField(verbose_name="应还时间", help_text="应归还的时间")
    return_date = models.DateTimeField(verbose_name="实际归还时间", null=True, blank=True, help_text="实际归还时间")

    renew_count = models.IntegerField(default=0, verbose_name="续借次数", help_text="已续借次数")
    max_renew_count = models.IntegerField(default=3, verbose_name="最大续借次数", help_text="允许最大续借次数")

    fine = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="罚金", help_text="逾期罚金金额")
    is_paid = models.BooleanField(default=False, verbose_name="罚金已支付", help_text="罚金是否已支付")

    remarks = models.TextField(verbose_name="备注", null=True, blank=True, help_text="借阅备注信息")

    class Meta:
        db_table = table_prefix + "book_borrow"
        verbose_name = "图书借阅记录表"
        verbose_name_plural = verbose_name
        ordering = ("-borrow_date",)

    def __str__(self):
        return f"{self.book.title} - {self.get_status_display()}"


class BookReservation(CoreModel):
    """
    图书预约记录模型
    当图书不可借时，用户可以预约
    """
    book = models.ForeignKey(
        to=Book,
        on_delete=models.PROTECT,
        verbose_name="图书",
        db_constraint=False,
        related_name="reservations",
        help_text="预约的图书"
    )

    STATUS_CHOICES = (
        (0, "等待中"),
        (1, "已取消"),
        (2, "已完成"),
        (3, "已过期"),
    )
    status = models.IntegerField(default=0, choices=STATUS_CHOICES, verbose_name="预约状态", help_text="预约状态")

    reservation_date = models.DateTimeField(verbose_name="预约时间", auto_now_add=True, help_text="预约创建时间")
    expiry_date = models.DateTimeField(verbose_name="过期时间", help_text="预约过期时间")
    notified_date = models.DateTimeField(verbose_name="通知时间", null=True, blank=True, help_text="通知用户的时间")

    priority = models.IntegerField(default=1, verbose_name="优先级", help_text="预约优先级")

    remarks = models.TextField(verbose_name="备注", null=True, blank=True, help_text="预约备注信息")

    class Meta:
        db_table = table_prefix + "book_reservation"
        verbose_name = "图书预约记录表"
        verbose_name_plural = verbose_name
        ordering = ("priority", "-reservation_date")

    def __str__(self):
        return f"{self.book.title} - {self.get_status_display()}"
