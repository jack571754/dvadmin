from django.contrib import admin
from .models import ProductArchive


@admin.register(ProductArchive)
class ProductArchiveAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_code', 'product_name', 'brand', 'specification',
        'unit', 'retail_price', 'product_type', 'product_status', 'need_maintenance',
    ]
    search_fields = ['product_code', 'product_name', 'short_name', 'nickname', 'brand']
    list_filter = ['product_type', 'product_status', 'sale_status', 'need_maintenance', 'brand']
