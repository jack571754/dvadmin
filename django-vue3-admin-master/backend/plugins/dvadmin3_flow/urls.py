from rest_framework import routers
from django.urls import re_path, path

from dvadmin3_flow.app_views.flow_data import AppFlowDataViewSet, flow_data_page, flow_data_detail_page
from dvadmin3_flow.views.flow_data import FlowDataViewSet
from dvadmin3_flow.views.flow_info import FlowInfoViewSet
from dvadmin3_flow.app_views.flow_info import AppFlowInfoViewSet, flow_form_page,flow_list_page

router_url = routers.SimpleRouter()
router_url.register('flow_info', FlowInfoViewSet)
router_url.register('flow_data', FlowDataViewSet)
router_url.register('app_flow_info', AppFlowInfoViewSet, basename='app_flow_info')
router_url.register('app_flow_data', AppFlowDataViewSet, basename='app_flow_data')
urlpatterns = [
    path('flow_form_page/',flow_form_page),
    path('flow_list_page/',flow_list_page),
    path('flow_data_page/',flow_data_page),
    path('flow_data_detail_page/',flow_data_detail_page),

]
urlpatterns += router_url.urls
