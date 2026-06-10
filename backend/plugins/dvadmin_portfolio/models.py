from django.db import models
from dvadmin.utils.models import CoreModel

table_prefix = 'portfolio_'

class PortfolioConfig(CoreModel):
    name = models.CharField(max_length=50, verbose_name="姓名/标识", help_text="例如 'H.'")
    avatar = models.CharField(max_length=255, null=True, blank=True, verbose_name="头像链接", help_text="头像图片URL或上传路径")
    hero_title = models.CharField(max_length=200, verbose_name="首屏大标题", help_text="例如 'Crafting digital experiences.'")
    hero_role = models.CharField(max_length=100, verbose_name="职业头衔", help_text="例如 '产品设计专家 & 全栈开发者'")
    hero_bio = models.TextField(verbose_name="个人简介", help_text="展示在首屏的简短自我介绍")
    email = models.EmailField(verbose_name="联络邮箱", help_text="点击复制时获取的邮箱地址")
    social_proof = models.CharField(max_length=255, null=True, blank=True, verbose_name="量化证明/社会信誉", help_text="例如 '已交付 50+ 个项目 | 合作过金融、电商领域客户'")
    is_active = models.BooleanField(default=True, verbose_name="是否启用此配置", help_text="是否启用此配置")

    class Meta:
        db_table = table_prefix + 'config'
        verbose_name = '个人配置'
        verbose_name_plural = verbose_name
        ordering = ('-create_datetime',)

class ResumeTimeline(CoreModel):
    role = models.CharField(max_length=100, verbose_name="职位头衔", help_text="例如 '高级体验设计专家'")
    company = models.CharField(max_length=150, verbose_name="公司/机构名称", help_text="例如 'Global Tech Innovations Inc.'")
    start_date = models.CharField(max_length=30, verbose_name="开始时间", help_text="例如 '2021'")
    end_date = models.CharField(max_length=30, verbose_name="结束时间", help_text="例如 '至今'")
    summary = models.TextField(verbose_name="职责概述")
    achievements = models.JSONField(default=list, blank=True, verbose_name="关键成就", help_text="JSON数组形式存储Key Achievements，例如 ['带领5人团队...', '重构核心模块...']")
    sort = models.IntegerField(default=1, verbose_name="排序权重", help_text="数值越小越靠前")

    class Meta:
        db_table = table_prefix + 'resume_timeline'
        verbose_name = '履历时间线'
        verbose_name_plural = verbose_name
        ordering = ('sort', '-create_datetime')

class PortfolioItem(CoreModel):
    CATEGORY_CHOICES = (
        ('case-study', '精选案例'),
        ('essay', '深度思考 (Blog)'),
        ('experiment', '代码实验'),
    )
    title = models.CharField(max_length=150, verbose_name="作品/文章标题")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='case-study', verbose_name="类别")
    summary = models.TextField(verbose_name="摘要介绍")
    content = models.TextField(null=True, blank=True, verbose_name="作品详情/正文", help_text="支持Markdown/富文本格式")
    image = models.CharField(max_length=255, null=True, blank=True, verbose_name="预览图", help_text="项目图片URL或上传路径")
    demo_url = models.CharField(max_length=255, null=True, blank=True, verbose_name="演示链接")
    git_url = models.CharField(max_length=255, null=True, blank=True, verbose_name="源码链接")
    result_tag = models.CharField(max_length=100, null=True, blank=True, verbose_name="成果标签/量化指标", help_text="例如 '转化率提升 35%' 或 '交付周期缩短 40%'")
    sort = models.IntegerField(default=1, verbose_name="排序权重", help_text="数值越小越靠前")
    is_recommend = models.BooleanField(default=False, verbose_name="是否推荐展示")

    class Meta:
        db_table = table_prefix + 'item'
        verbose_name = '作品与项目'
        verbose_name_plural = verbose_name
        ordering = ('sort', '-create_datetime')
