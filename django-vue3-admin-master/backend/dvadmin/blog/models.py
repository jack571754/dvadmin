"""
博客数据模型
"""
from django.db import models
from dvadmin.utils.models import CoreModel
from dvadmin.system.models import Users


class Category(CoreModel):
    """
    文章分类模型
    """
    name = models.CharField(
        max_length=50,
        verbose_name="分类名称",
        help_text="文章分类名称，如：技术、生活、随笔"
    )
    description = models.TextField(
        verbose_name="分类描述",
        help_text="分类的详细描述",
        blank=True,
        null=True
    )
    sort_order = models.IntegerField(
        default=0,
        verbose_name="排序",
        help_text="数字越小越靠前"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="是否启用",
        help_text="启用后该分类可在前台显示"
    )

    class Meta:
        db_table = "dvadmin_blog_category"
        verbose_name = "文章分类"
        verbose_name_plural = verbose_name
        ordering = ["sort_order", "-create_datetime"]

    def __str__(self):
        return self.name

    @property
    def article_count(self):
        """获取该分类下的文章数量"""
        return self.article_set.filter(status='published').count()


class Tag(CoreModel):
    """
    文章标签模型
    """
    name = models.CharField(
        max_length=30,
        unique=True,
        verbose_name="标签名称",
        help_text="文章标签，如：Python、Django、Vue"
    )
    color = models.CharField(
        max_length=7,
        default="#409EFF",
        verbose_name="标签颜色",
        help_text="十六进制颜色代码，如 #409EFF"
    )

    class Meta:
        db_table = "dvadmin_blog_tag"
        verbose_name = "文章标签"
        verbose_name_plural = verbose_name
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def article_count(self):
        """获取该标签下的文章数量"""
        return self.article_set.filter(status='published').count()


class Article(CoreModel):
    """
    文章模型
    """
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
    ]

    title = models.CharField(
        max_length=200,
        verbose_name="文章标题",
        help_text="文章标题，建议不超过50字"
    )
    content = models.TextField(
        verbose_name="文章内容",
        help_text="Markdown 格式的文章内容"
    )
    summary = models.CharField(
        max_length=500,
        verbose_name="文章摘要",
        help_text="文章摘要，显示在列表页，建议100-200字",
        blank=True,
        null=True
    )
    cover_image = models.CharField(
        max_length=500,
        verbose_name="封面图片",
        help_text="文章封面图 URL",
        blank=True,
        null=True
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="所属分类",
        help_text="文章所属的分类",
        related_name="article_set",
        db_constraint=False
    )
    tags = models.ManyToManyField(
        Tag,
        verbose_name="文章标签",
        help_text="文章关联的标签，可多选",
        blank=True,
        related_name="article_set"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="文章状态",
        help_text="草稿或已发布"
    )
    views_count = models.IntegerField(
        default=0,
        verbose_name="阅读量",
        help_text="文章被阅读的次数"
    )
    likes_count = models.IntegerField(
        default=0,
        verbose_name="点赞数",
        help_text="文章被点赞的次数"
    )
    is_top = models.BooleanField(
        default=False,
        verbose_name="是否置顶",
        help_text="置顶文章会优先显示"
    )

    class Meta:
        db_table = "dvadmin_blog_article"
        verbose_name = "文章"
        verbose_name_plural = verbose_name
        ordering = ["-is_top", "-create_datetime"]

    def __str__(self):
        return self.title

    def increase_views(self):
        """增加阅读量"""
        self.views_count += 1
        self.save(update_fields=['views_count'])

    def increase_likes(self):
        """增加点赞数"""
        self.likes_count += 1
        self.save(update_fields=['likes_count'])

    def get_tags_list(self):
        """获取标签列表"""
        return [{"id": tag.id, "name": tag.name, "color": tag.color} for tag in self.tags.all()]


class Comment(CoreModel):
    """
    评论模型（登录用户评论）
    """
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        verbose_name="关联文章",
        help_text="评论所属的文章",
        related_name="comment_set"
    )
    content = models.TextField(
        verbose_name="评论内容",
        help_text="评论的具体内容"
    )
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        verbose_name="评论用户",
        help_text="发表评论的用户",
        related_name="blog_comments",
        db_constraint=False
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="父评论",
        help_text="用于楼中楼回复",
        related_name="replies"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="是否显示",
        help_text="是否在前台显示该评论"
    )

    class Meta:
        db_table = "dvadmin_blog_comment"
        verbose_name = "评论"
        verbose_name_plural = verbose_name
        ordering = ["-create_datetime"]

    def __str__(self):
        return f"{self.user.username}：{self.content[:20]}"

    def get_replies_list(self):
        """获取回复列表"""
        return [
            {
                "id": reply.id,
                "content": reply.content,
                "user": {
                    "id": reply.user.id,
                    "username": reply.user.username,
                    "name": reply.user.name,
                },
                "created_time": reply.create_datetime
            }
            for reply in self.replies.filter(is_active=True)
        ]
