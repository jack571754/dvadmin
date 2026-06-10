from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin_portfolio.models import PortfolioConfig, ResumeTimeline, PortfolioItem

class PortfolioConfigSerializer(CustomModelSerializer):
    class Meta:
        model = PortfolioConfig
        fields = '__all__'

class ResumeTimelineSerializer(CustomModelSerializer):
    class Meta:
        model = ResumeTimeline
        fields = '__all__'

class PortfolioItemSerializer(CustomModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = '__all__'
