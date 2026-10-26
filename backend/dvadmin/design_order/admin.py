from django.contrib import admin
from .models import DesignOrderStore, ProductArchive


@admin.register(ProductArchive)
class ProductArchiveAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_code', 'product_name', 'brand', 'regulatory_category',
        'specification', 'unit', 'retail_price', 'product_type',
        'product_status', 'need_maintenance',
    ]
    search_fields = ['product_code', 'product_name', 'short_name', 'nickname', 'brand']
    list_filter = [
        'regulatory_category', 'product_type', 'product_status',
        'sale_status', 'need_maintenance', 'brand',
    ]


@admin.register(DesignOrderStore)
class DesignOrderStoreAdmin(admin.ModelAdmin):
    list_display = [
        "store_code",
        "store_name",
        "store_type",
        "brand",
        "platform",
        "department",
        "owner_name",
        "status",
    ]
    search_fields = ["store_code", "store_name", "owner_name"]
    list_filter = ["store_type", "brand", "platform", "department", "status"]
