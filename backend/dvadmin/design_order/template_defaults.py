"""
规格提报模板初始数据。

仅用于数据库迁移初始化，运行时模板配置统一从 ProductSpecTemplate 读取。
"""

JD_PLATFORM = "京东"

INITIAL_TEMPLATE_DATA = [
    {
        "template_code": "main_image",
        "template_name": "主图提报",
        "platform": JD_PLATFORM,
        "icon": "Picture",
        "remark": "用于京东商品主图素材与活动机制提报。",
        "rows_per_block": 14,
        "columns_per_block": 6,
        "sort": 1,
        "fields": [
            {"row": 1, "key": "brand", "label": "品牌与标志", "style": "contentCenter", "kind": "text", "maskKey": "brand"},
            {"row": 2, "key": "nickname", "label": "产品昵称", "style": "editableCenter", "kind": "mention", "maskKey": "nickname"},
            {"row": 3, "key": "fullName", "label": "官方全称", "style": "contentLeft", "kind": "text", "maskKey": "full_name"},
            {"row": 4, "key": "efficacy", "label": "主打功效", "style": "contentLeft", "kind": "longtext", "maskKey": "efficacy"},
            {"row": 5, "key": "gifts", "label": "标配赠品配置", "style": "editableCenter", "kind": "gifts", "maskKey": "gifts"},
            {"row": 6, "key": "thresholdA", "label": "满赠档位配置", "style": "editableCenter", "kind": "tier", "maskKey": "threshold_a"},
            {"row": 7, "key": "sellingPoint", "label": "商品卖点", "style": "contentLeftShaded", "kind": "longtext", "maskKey": "selling_point"},
            {"row": 8, "key": "price", "label": "提报价格说明", "style": "editableCenter", "kind": "price", "maskKey": "price"},
            {"row": 9, "key": "dateRange", "label": "活动时间范围", "style": "editableCenter", "kind": "dateRange", "maskKey": "start_date"},
            {"row": 10, "key": "icon", "label": "icon", "style": "editableCenter", "kind": "longtext", "maskKey": "icon"},
            {"row": 11, "key": "remark", "label": "标注", "style": "editableCenter", "kind": "longtext", "maskKey": "remark"},
            {"row": 12, "key": "remarks", "label": "运营备注说明", "style": "editableCenter", "kind": "longtext", "maskKey": "remarks"},
        ],
        "validation": {
            "requiredSubmissionFields": ["name", "shop"],
            "requiredProductFields": [],
            "priceFieldKey": "price",
            "dateRangeFieldKey": "dateRange",
        },
    },
]
