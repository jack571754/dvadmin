"""
博客序列化器
"""
from rest_framework import serializers
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.system.models import Users
from .models import Category, Tag, Article, Comment


class CategorySerializer(CustomModelSerializer):
    """
    分类序列化器
    """
    article_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = "__all__"

    def get_article_count(self, obj):
        """获取该分类下的文章数量"""
        return obj.article_set.filter(status='published').count()


class TagSerializer(CustomModelSerializer):
    """
    标签序列化器
    """
    article_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Tag
        fields = "__all__"

    def get_article_count(self, obj):
        """获取该标签下的文章数量"""
        return obj.article_set.filter(status='published').count()


class ArticleListSerializer(CustomModelSerializer):
    """
    文章列表序列化器（用于列表展示和表单编辑）
    """
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    tags_list = serializers.SerializerMethodField(read_only=True)
    author_name = serializers.CharField(source='creator.name', read_only=True, allow_null=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'summary', 'cover_image', 'category', 'category_name',
            'tags', 'tags_list', 'status', 'views_count', 'likes_count', 'is_top',
            'author_name', 'create_datetime'
        ]

    def get_tags_list(self, obj):
        """获取标签列表"""
        return obj.get_tags_list()


class ArticleDetailSerializer(CustomModelSerializer):
    """
    文章详情序列化器（用于详情展示）
    """
    category_detail = serializers.SerializerMethodField(read_only=True)
    tags_detail = serializers.SerializerMethodField(read_only=True)
    author_info = serializers.SerializerMethodField(read_only=True)
    # 重写 modifier_name 以修复查询问题
    modifier_name = serializers.CharField(source='modifier', read_only=True)

    class Meta:
        model = Article
        fields = "__all__"

    def get_category_detail(self, obj):
        """获取分类详细信息"""
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'description': obj.category.description
            }
        return None

    def get_tags_detail(self, obj):
        """获取标签详细信息"""
        return obj.get_tags_list()

    def get_author_info(self, obj):
        """获取作者信息"""
        if obj.creator:
            return {
                'id': obj.creator.id,
                'username': obj.creator.username,
                'name': obj.creator.name,
                'avatar': obj.creator.avatar
            }
        return None


class ArticleCreateSerializer(CustomModelSerializer):
    """
    文章创建/更新序列化器
    """
    class Meta:
        model = Article
        fields = "__all__"

    def create(self, validated_data):
        """创建文章时处理标签"""
        tags = validated_data.pop('tags', [])
        # 调用父类 create 方法以自动设置 creator 等审计字段
        article = super().create(validated_data)
        if tags:
            article.tags.set(tags)
        return article

    def update(self, instance, validated_data):
        """更新文章时处理标签"""
        tags = validated_data.pop('tags', None)
        # 调用父类 update 方法以自动更新 modifier 等审计字段
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(tags)
        return instance


class CommentSerializer(CustomModelSerializer):
    """
    评论序列化器
    """
    user_info = serializers.SerializerMethodField(read_only=True)
    replies_list = serializers.SerializerMethodField(read_only=True)
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'article', 'article_title', 'content', 'user', 'user_info',
            'parent', 'replies_list', 'is_active', 'create_datetime'
        ]

    def get_user_info(self, obj):
        """获取用户信息"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': obj.user.name,
            'avatar': obj.user.avatar
        }

    def get_replies_list(self, obj):
        """获取回复列表"""
        return obj.get_replies_list()


class CommentCreateSerializer(CustomModelSerializer):
    """
    评论创建序列化器
    """
    class Meta:
        model = Comment
        fields = ['article', 'content', 'parent']

    def validate_article(self, value):
        """验证文章是否存在且已发布"""
        if value.status != 'published':
            raise serializers.ValidationError("只能评论已发布的文章")
        return value

    def validate_parent(self, value):
        """验证父评论是否存在且属于同一文章"""
        if value and value.article != self.initial_data.get('article'):
            raise serializers.ValidationError("父评论不属于该文章")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    """
    用户注册序列化器（公开注册接口）
    """
    confirm_password = serializers.CharField(write_only=True, help_text="确认密码")

    class Meta:
        model = Users
        fields = ['username', 'password', 'email', 'name', 'mobile', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True, 'help_text': '密码'},
            'username': {'help_text': '用户名'},
            'email': {'required': False, 'allow_blank': True, 'help_text': '邮箱'},
            'name': {'required': False, 'allow_blank': True, 'help_text': '昵称'},
            'mobile': {'required': False, 'allow_blank': True, 'help_text': '手机号'},
        }

    def validate_username(self, value):
        """验证用户名唯一性"""
        if Users.objects.filter(username=value).exists():
            raise serializers.ValidationError("用户名已存在")
        return value

    def validate_email(self, value):
        """验证邮箱唯一性"""
        if value and Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("邮箱已被注册")
        return value

    def validate_mobile(self, value):
        """验证手机号唯一性"""
        if value and Users.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("手机号已被注册")
        return value

    def validate(self, attrs):
        """验证两次密码是否一致"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("两次密码不一致")
        attrs.pop('confirm_password')
        return attrs

    def create(self, validated_data):
        """创建用户"""
        from django.contrib.auth.hashers import make_password
        import hashlib

        # 密码加密（MD5 + Django make_password）
        password = validated_data['password']
        md5_pwd = hashlib.md5(password.encode('utf-8')).hexdigest()
        validated_data['password'] = make_password(md5_pwd)

        # 设置默认值
        validated_data.setdefault('name', validated_data.get('username'))
        validated_data.setdefault('is_active', True)
        validated_data.setdefault('user_type', '1')  # 普通用户

        user = Users.objects.create(**validated_data)
        return user
