"""
博客视图集
"""
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse, ErrorResponse, SuccessResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.filters import CustomDjangoFilterBackend
from .models import Category, Tag, Article, Comment
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    RegisterSerializer
)


class CategoryViewSet(CustomModelViewSet):
    """
    文章分类视图集
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [CustomPermission]
    filter_fields = ['name', 'is_active']
    search_fields = ['name', 'description']
    # 不使用数据权限过滤（访客访问时不需要）
    extra_filter_class = []
    # 显式指定过滤器后端，不使用数据权限过滤器
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_permissions(self):
        """列表和详情公开，创建/更新/删除需要管理员权限"""
        if self.action in ['list', 'retrieve', 'dict', 'articles']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def dict(self, request):
        """获取分类字典数据（用于前端下拉选择）"""
        categories = self.queryset.filter(is_active=True).order_by('sort_order')
        data = [{'label': cat.name, 'value': cat.id} for cat in categories]
        return DetailResponse(data=data, msg="获取分类字典成功")

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def articles(self, request, pk=None):
        """获取指定分类下的文章列表"""
        category = self.get_object()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        # 获取该分类下已发布的文章
        queryset = Article.objects.filter(
            category=category,
            status='published'
        ).select_related('category', 'creator').prefetch_related('tags')

        # 计算分页
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        articles = queryset[start:end]

        serializer = ArticleListSerializer(articles, many=True)
        return DetailResponse(
            data=serializer.data,
            msg="获取分类文章成功",
            page=page,
            limit=page_size,
            total=total,
            is_next=end < total,
            is_previous=page > 1
        )


class TagViewSet(CustomModelViewSet):
    """
    文章标签视图集
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [CustomPermission]
    filter_fields = ['name']
    search_fields = ['name']
    # 不使用数据权限过滤（访客访问时不需要）
    extra_filter_class = []
    # 显式指定过滤器后端，不使用数据权限过滤器
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_permissions(self):
        """列表和详情公开，创建/更新/删除需要管理员权限"""
        if self.action in ['list', 'retrieve', 'dict']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def dict(self, request):
        """获取标签字典数据（用于前端下拉选择）"""
        tags = self.queryset.all().order_by('name')
        data = [{'label': tag.name, 'value': tag.id} for tag in tags]
        return DetailResponse(data=data, msg="获取标签字典成功")


class ArticleViewSet(CustomModelViewSet):
    """
    文章管理视图集
    """
    queryset = Article.objects.select_related('category', 'creator').prefetch_related('tags').all()
    serializer_class = ArticleListSerializer
    permission_classes = [CustomPermission]
    filter_fields = ['category', 'status', 'is_top']
    search_fields = ['title', 'summary', 'content']
    # 不使用数据权限过滤（访客访问时不需要）
    extra_filter_class = []
    # 显式指定过滤器后端，不使用数据权限过滤器
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_serializer_class(self):
        """根据操作返回不同的序列化器"""
        if self.action == 'list':
            return ArticleListSerializer
        elif self.action == 'retrieve':
            return ArticleDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateSerializer
        return ArticleListSerializer

    def get_permissions(self):
        """列表和详情公开，增删改需要管理员权限"""
        if self.action in ['list', 'retrieve', 'like', 'hot']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        """获取文章详情时自动增加阅读量"""
        instance = self.get_object()
        # 仅访客访问已发布文章时增加阅读量
        if instance.status == 'published':
            instance.increase_views()
        serializer = self.get_serializer(instance)
        return DetailResponse(data=serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def hot(self, request):
        """热门文章（按阅读量和点赞数排序）"""
        queryset = self.filter_queryset(self.get_queryset()).filter(status='published')
        queryset = queryset.order_by('-views_count', '-likes_count')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return DetailResponse(data=serializer.data, msg="获取热门文章成功")

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def like(self, request, pk=None):
        """点赞文章"""
        article = self.get_object()
        if article.status != 'published':
            return ErrorResponse(msg="只能点赞已发布的文章")
        article.increase_likes()
        return DetailResponse(data={'likes_count': article.likes_count}, msg="点赞成功")

    @action(detail=True, methods=['post'], permission_classes=[CustomPermission])
    def publish(self, request, pk=None):
        """发布草稿"""
        article = self.get_object()
        if article.status == 'published':
            return ErrorResponse(msg="文章已发布")
        article.status = 'published'
        article.save()
        return DetailResponse(data={'status': article.status}, msg="发布成功")


class CommentViewSet(CustomModelViewSet):
    """
    评论管理视图集
    """
    queryset = Comment.objects.select_related('article', 'user', 'parent').all()
    serializer_class = CommentSerializer
    permission_classes = [CustomPermission]
    filter_fields = ['article', 'is_active']
    # 不使用数据权限过滤（访客访问时不需要）
    extra_filter_class = []
    # 显式指定过滤器后端，不使用数据权限过滤器
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_serializer_class(self):
        """创建评论时使用专用序列化器"""
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer

    def get_permissions(self):
        """列表公开，创建需登录，删除需管理员"""
        if self.action == 'list':
            return [permissions.AllowAny()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """创建评论时自动设置当前用户"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def by_article(self, request):
        """获取指定文章的评论列表"""
        article_id = request.query_params.get('article_id')
        if not article_id:
            return ErrorResponse(msg="请提供文章ID")

        comments = self.queryset.filter(article_id=article_id, parent=None, is_active=True)
        serializer = self.get_serializer(comments, many=True)
        return DetailResponse(data=serializer.data)


class RegisterView(APIView):
    """
    用户注册视图（公开接口）
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        """
        用户注册接口
        请求体: {username, password, confirm_password, email, name, mobile}
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return DetailResponse(
                data={
                    'id': user.id,
                    'username': user.username,
                    'name': user.name,
                    'email': user.email
                },
                msg="注册成功"
            )
        return ErrorResponse(msg=serializer.errors)
