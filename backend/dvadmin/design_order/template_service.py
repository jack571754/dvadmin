"""规格提报模板查询与 Schema 转换服务。"""
from typing import Optional

from .template_models import ProductSpecTemplate

DEFAULT_TEMPLATE_CODE = "main_image"


def get_template(template_code: Optional[str] = None) -> ProductSpecTemplate:
    code = template_code or DEFAULT_TEMPLATE_CODE
    template = ProductSpecTemplate.objects.filter(template_code=code).first()
    if not template:
        raise ValueError(f"未找到规格提报模板：{code}")
    return template


def get_active_templates(platform: str):
    return ProductSpecTemplate.objects.filter(platform=platform, status=True).order_by("sort", "id")


def get_active_template_for_platform(platform: str) -> ProductSpecTemplate:
    templates = list(get_active_templates(platform)[:2])
    if not templates:
        raise ValueError(f"平台“{platform}”未配置启用的规格提报模板")
    if len(templates) > 1:
        raise ValueError(f"平台“{platform}”配置了多个启用的规格提报模板")
    return templates[0]


def ensure_template_platform(template_code: str, platform: str) -> ProductSpecTemplate:
    template = get_template(template_code)
    if template.platform != platform:
        raise ValueError(
            f"模板“{template.template_name}”适用平台为“{template.platform}”，不能用于“{platform}”"
        )
    return template


def to_schema(template: ProductSpecTemplate) -> dict:
    return {
        "templateType": template.template_code,
        "label": template.template_name,
        "platforms": [template.platform],
        "icon": template.icon,
        "remark": template.remark,
        "rowsPerBlock": template.rows_per_block,
        "columnsPerBlock": template.columns_per_block,
        "fields": template.fields,
        "validation": template.validation,
    }


def get_schema(template_code: Optional[str] = None) -> dict:
    return to_schema(get_template(template_code))


def get_rows_per_block(template_code: Optional[str] = None) -> int:
    return get_schema(template_code)["rowsPerBlock"]


def get_fields(template_code: Optional[str] = None) -> list[dict]:
    return get_schema(template_code)["fields"]


def get_field_by_row(template_code: str, row_in_block: int) -> Optional[dict]:
    return next((field for field in get_fields(template_code) if field["row"] == row_in_block), None)


def get_maskkey_to_row(template_code: str) -> dict[str, int]:
    return {
        field["maskKey"]: field["row"]
        for field in get_fields(template_code)
        if field.get("maskKey")
    }
