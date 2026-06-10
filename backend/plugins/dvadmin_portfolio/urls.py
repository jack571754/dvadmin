from rest_framework import routers
from django.urls import path
from dvadmin_portfolio.views import (
    PortfolioConfigViewSet,
    ResumeTimelineViewSet,
    PortfolioItemViewSet,
    PortfolioPublicView
)

router_url = routers.SimpleRouter()
router_url.register('config', PortfolioConfigViewSet, basename='portfolio_config')
router_url.register('resume', ResumeTimelineViewSet, basename='portfolio_resume')
router_url.register('item', PortfolioItemViewSet, basename='portfolio_item')

urlpatterns = [
    path('public/', PortfolioPublicView.as_view(), name='portfolio_public'),
]

urlpatterns += router_url.urls
