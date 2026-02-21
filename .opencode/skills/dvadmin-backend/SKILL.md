# DVAdmin 后端开发技能

> Django 5.2.0 LTS + Django REST Framework 3.16.0
> 专注后端 API 开发、数据模型、权限控制

---

## 核心基类

| 基类 | 位置 | 说明 |
|------|------|------|
| `CoreModel` | `dvadmin/utils/models.py` | 所有业务模型基类 |
| `CustomModelViewSet` | `dvadmin/utils/viewset.py` | 视图集基类 |
| `CoreSerializer` | `dvadmin/utils/serializers.py` | 序列化器基类 |

---

## 数据模型

```python
from django.db import models
from dvadmin.utils.models import CoreModel, table_prefix


class Article(CoreModel):
    title = models.CharField(max_length=200, verbose_name="标题", help_text="文章标题")
    content = models.TextField(verbose_name="内容", help_text="文章内容")
    status = models.BooleanField(default=True, verbose_name="状态")
    
    class Meta:
        db_table = table_prefix + "blog_article"
        verbose_name = "文章"
        ordering = ["-create_datetime"]
```

---

## 视图集

```python
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.filters import DataLevelPermissionMargeFilter


class ArticleViewSet(CustomModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [CustomPermission]
    filter_backends = [DataLevelPermissionMargeFilter]
    search_fields = ['title', 'content']
    filterset_fields = ['status']
```

---

## 序列化器

```python
from dvadmin.utils.serializers import CoreModelSerializer


class ArticleSerializer(CoreModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"
        read_only_fields = ['creator', 'modifier']
```

---

## 开发命令

```bash
# 创建应用
python manage.py startapp myapp dvadmin/myapp

# 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 初始化
python manage.py init

# 启动（支持 WebSocket）
uvicorn application.asgi:application --port 9000 --reload
```

---

## API 响应格式

```python
# 成功
return Response({'code': 2000, 'msg': '成功', 'data': {...}})

# 分页
return Response({
    'code': 2000,
    'data': {'page': 1, 'size': 10, 'total': 100, 'data': [...]}
})
```

---

## 注意事项

- 模型必须继承 `CoreModel`
- 视图集继承 `CustomModelViewSet`
- 使用 `table_prefix` 确保表名前缀
- 端口使用 9000
- WebSocket 需要 uvicorn
