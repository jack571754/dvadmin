# -*- coding: utf-8 -*-

"""
@author: 猿小天
@contact: QQ:1638245306
@Created on: 2021/6/3 003 0:30
@Remark: 登录日志管理与趋势分析
"""
from rest_framework.decorators import action
from dvadmin.system.models import LoginLog
from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse


class LoginLogSerializer(CustomModelSerializer):
    """
    登录日志权限-序列化器
    """

    class Meta:
        model = LoginLog
        fields = "__all__"
        read_only_fields = ["id"]


class LoginLogViewSet(CustomModelViewSet, FieldPermissionMixin):
    """
    登录日志接口
    list:查询
    create:新增
    update:修改
    retrieve:单例
    destroy:删除
    """
    queryset = LoginLog.objects.all()
    serializer_class = LoginLogSerializer

    @action(methods=['GET'], detail=False)
    def trend(self, request):
        """
        获取最近 N 天的系统登录趋势与统计概览
        """
        try:
            days = int(request.query_params.get('days', 30))
        except (ValueError, TypeError):
            days = 30
        days = max(7, min(days, 90))

        from datetime import timedelta
        from django.utils import timezone
        from django.db.models import Count
        from django.db.models.functions import TruncDate

        now = timezone.now()
        start_date = (now - timedelta(days=days - 1)).date()

        logs = (
            LoginLog.objects.filter(create_datetime__date__gte=start_date)
            .annotate(date=TruncDate('create_datetime'))
            .values('date')
            .annotate(
                total_logins=Count('id'),
                unique_users=Count('username', distinct=True),
            )
            .order_by('date')
        )

        log_dict = {item['date'].strftime('%Y-%m-%d'): item for item in logs}

        dates = []
        total_counts = []
        unique_counts = []

        for i in range(days):
            current_day = start_date + timedelta(days=i)
            day_str = current_day.strftime('%Y-%m-%d')
            dates.append(day_str)
            item = log_dict.get(day_str)
            if item:
                total_counts.append(item['total_logins'])
                unique_counts.append(item['unique_users'])
            else:
                total_counts.append(0)
                unique_counts.append(0)

        # 汇总基础 KPI
        from dvadmin.system.models import Users, OperationLog
        total_users = Users.objects.filter(is_active=True).count()
        today_date = now.date()
        today_logins = LoginLog.objects.filter(create_datetime__date=today_date).count()
        total_operations = OperationLog.objects.count()

        return DetailResponse(data={
            'dates': dates,
            'total_counts': total_counts,
            'unique_counts': unique_counts,
            'summary': {
                'total_users': total_users,
                'active_today': today_logins,
                'total_operations': total_operations,
            }
        })
