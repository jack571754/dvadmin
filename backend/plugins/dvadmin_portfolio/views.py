from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import SuccessResponse
from dvadmin_portfolio.models import PortfolioConfig, ResumeTimeline, PortfolioItem
from dvadmin_portfolio.serializers import (
    PortfolioConfigSerializer,
    ResumeTimelineSerializer,
    PortfolioItemSerializer
)

class PortfolioConfigViewSet(CustomModelViewSet):
    """
    个人配置管理接口
    """
    queryset = PortfolioConfig.objects.all()
    serializer_class = PortfolioConfigSerializer

class ResumeTimelineViewSet(CustomModelViewSet):
    """
    履历时间线管理接口
    """
    queryset = ResumeTimeline.objects.all()
    serializer_class = ResumeTimelineSerializer

class PortfolioItemViewSet(CustomModelViewSet):
    """
    作品与项目管理接口
    """
    queryset = PortfolioItem.objects.all()
    serializer_class = PortfolioItemSerializer

class PortfolioPublicView(APIView):
    """
    公开的作品集与履历展示接口 (免登录)
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        # 获取当前启用的个人配置
        config_obj = PortfolioConfig.objects.filter(is_active=True).first()
        if not config_obj:
            config_obj = PortfolioConfig.objects.order_by('-create_datetime').first()
        
        config_data = PortfolioConfigSerializer(config_obj).data if config_obj else None

        # 获取所有时间线
        timeline_qs = ResumeTimeline.objects.order_by('sort', '-create_datetime')
        timeline_data = ResumeTimelineSerializer(timeline_qs, many=True).data

        # 获取所有作品项目
        items_qs = PortfolioItem.objects.order_by('sort', '-create_datetime')
        items_data = PortfolioItemSerializer(items_qs, many=True).data

        data = {
            "config": config_data,
            "timeline": timeline_data,
            "items": items_data
        }
        return SuccessResponse(data=data, msg="获取成功")
