from rest_framework.decorators import action

from dvadmin.utils.json_response import DetailResponse, ErrorResponse

from .icon_services import IconProductError, inspect_product_codes


class IconProductValidationMixin:
    @action(detail=False, methods=["post"], url_path="validate-product-codes")
    def validate_product_codes(self, request):
        try:
            report = inspect_product_codes(
                request.data.get("product_codes", []),
                request.data.get("brand", ""),
            )
            return DetailResponse(data=report, msg="商品编码校验完成")
        except IconProductError as exc:
            return ErrorResponse(data=exc.details, msg=str(exc), code=4000)
