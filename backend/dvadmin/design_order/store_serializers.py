from rest_framework import serializers

from dvadmin.utils.serializers import CustomModelSerializer

from .store_models import DesignOrderStore


class DesignOrderStoreSerializer(CustomModelSerializer):
    def validate_store_code(self, value):
        queryset = DesignOrderStore.objects.filter(store_code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("店铺编码已存在")
        return value

    class Meta:
        model = DesignOrderStore
        fields = "__all__"
