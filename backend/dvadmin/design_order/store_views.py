from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter

from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.utils.filters import CustomDjangoFilterBackend
from dvadmin.utils.json_response import DetailResponse, ErrorResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.viewset import CustomModelViewSet

from .permissions_service import filter_stores_for_user
from .store_models import DesignOrderStore
from .store_serializers import DesignOrderStoreSerializer


class DesignOrderStoreViewSet(FieldPermissionMixin, CustomModelViewSet):
    queryset = DesignOrderStore.objects.all()
    serializer_class = DesignOrderStoreSerializer
    permission_classes = [CustomPermission]
    filter_fields = [
        "~store_code",
        "~store_name",
        "store_type",
        "brand",
        "platform",
        "department",
        "~owner_name",
        "status",
    ]
    search_fields = ["store_code", "store_name", "owner_name"]
    ordering_fields = ["id", "store_code", "store_name", "create_datetime"]
    extra_filter_class = []
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_queryset(self):
        queryset = super().get_queryset()
        return filter_stores_for_user(queryset, self.request.user)

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        status = request.data.get("status")
        if not isinstance(status, bool):
            return ErrorResponse(msg="状态必须为布尔值", status=400)

        store = self.get_object()
        store.status = status
        store.modifier = str(request.user.id)
        store.save(update_fields=["status", "modifier", "update_datetime"])
        serializer = self.get_serializer(store)
        return DetailResponse(data=serializer.data, msg="店铺状态更新成功")

    def destroy(self, request, *args, **kwargs):
        store = self.get_object()
        if store.status:
            return ErrorResponse(
                msg=f"店铺“{store.store_name}”当前处于启用状态，不能删除，请先禁用后再删除",
                status=400,
            )
        return super().destroy(request, *args, **kwargs)
