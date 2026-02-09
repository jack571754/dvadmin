"""
定时任务管理 - 视图层

对接 django-celery-beat 的 PeriodicTask、IntervalSchedule、CrontabSchedule 模型
"""

from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django_celery_beat.models import PeriodicTask, IntervalSchedule, CrontabSchedule
from django_celery_results.models import TaskResult
from dvadmin.utils.json_response import SuccessResponse, DetailResponse


class IntervalScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntervalSchedule
        fields = '__all__'


class CrontabScheduleSerializer(serializers.ModelSerializer):
    timezone = serializers.CharField(required=False)

    class Meta:
        model = CrontabSchedule
        fields = '__all__'


class PeriodicTaskSerializer(serializers.ModelSerializer):
    interval_display = serializers.SerializerMethodField()
    crontab_display = serializers.SerializerMethodField()

    class Meta:
        model = PeriodicTask
        fields = [
            'id', 'name', 'task', 'interval', 'crontab',
            'args', 'kwargs', 'queue', 'enabled',
            'last_run_at', 'total_run_count', 'date_changed',
            'description', 'one_off', 'start_time', 'expires',
            'interval_display', 'crontab_display',
        ]

    def get_interval_display(self, obj):
        if obj.interval:
            return str(obj.interval)
        return None

    def get_crontab_display(self, obj):
        if obj.crontab:
            return str(obj.crontab)
        return None


class PeriodicTaskViewSet(ModelViewSet):
    """定时任务管理"""
    queryset = PeriodicTask.objects.all().order_by('-date_changed')
    serializer_class = PeriodicTaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    filterset_fields = ['enabled', 'task']
    search_fields = ['name', 'task', 'description']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return DetailResponse(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return DetailResponse(data=serializer.data, msg="新增成功")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return DetailResponse(data=serializer.data, msg="更新成功")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return DetailResponse(data=[], msg="删除成功")

    @action(methods=['post'], detail=True)
    def toggle(self, request, pk=None):
        """切换任务启用/禁用状态"""
        task = self.get_object()
        task.enabled = not task.enabled
        task.save()
        return DetailResponse(data={'enabled': task.enabled})


class IntervalScheduleViewSet(ModelViewSet):
    """间隔调度管理"""
    queryset = IntervalSchedule.objects.all()
    serializer_class = IntervalScheduleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return DetailResponse(data=serializer.data, msg="新增成功")


class CrontabScheduleViewSet(ModelViewSet):
    """Crontab 调度管理"""
    queryset = CrontabSchedule.objects.all()
    serializer_class = CrontabScheduleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return DetailResponse(data=serializer.data, msg="新增成功")


class TaskResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskResult
        fields = [
            'id', 'task_id', 'periodic_task_name', 'task_name',
            'task_args', 'task_kwargs', 'status', 'worker',
            'result', 'date_created', 'date_done', 'traceback',
        ]


class TaskResultViewSet(ModelViewSet):
    """任务执行记录"""
    queryset = TaskResult.objects.all().order_by('-date_done')
    serializer_class = TaskResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['task_name', 'task_id', 'periodic_task_name', 'status', 'worker']
    http_method_names = ['get', 'delete', 'head', 'options']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return DetailResponse(data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return DetailResponse(data=[], msg="删除成功")
