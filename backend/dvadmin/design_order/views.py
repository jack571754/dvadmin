"""
设计工单管理视图集
"""
import json
import math
from copy import deepcopy
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse, ErrorResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.filters import CustomDjangoFilterBackend, CoreModelFilterBankend
from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.system.models import FieldPermission, MenuField
from .models import ProductArchive, ProductSpec, ProductSpecSubmission
from .serializers import (
    ProductArchiveSerializer,
    ProductSpecSerializer,
    ProductSpecSubmissionListSerializer,
    ProductSpecSubmissionSerializer,
)
from .template_service import ensure_template_platform, get_schema, get_maskkey_to_row, get_rows_per_block, to_schema
from .icon_refs import normalize_icon_refs
from .field_security import (mask_snapshot_for_user, restricted_fields, product_value, protect_products, protect_snapshot)
from .permissions_service import (
    can_create_submission, can_edit_submission, can_delete_submission,
    can_copy_submission, can_view_submission, submission_permissions,
    filter_submissions_for_user, get_platform_choices, get_valid_platforms,
    is_data_superuser,
)


class ProductArchiveViewSet(FieldPermissionMixin, CustomModelViewSet):
    """
    产品档案视图集
    """
    queryset = ProductArchive.objects.all()
    serializer_class = ProductArchiveSerializer
    permission_classes = [CustomPermission]
    filter_fields = [
        '~product_code', '~product_name', '~brand', 'regulatory_category', 'product_type',
        'product_status', 'sale_status', 'need_maintenance', '~nickname',
        '~short_name',
    ]
    search_fields = ['product_code', 'product_name', 'short_name', 'nickname', 'brand']
    ordering_fields = ['id', 'product_code', 'retail_price', 'create_datetime']
    extra_filter_class = []
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    @action(detail=False, methods=['get'])
    def dict(self, request):
        """获取产品档案字典数据（用于前端下拉选择）"""
        products = self.queryset.values(
            'id', 'product_code', 'product_name', 'nickname', 'short_name', 'brand',
            'regulatory_category', 'specification', 'unit', 'retail_price',
            'keywords', 'efficacy_scope',
        )

        user = request.user
        if not user.is_superuser:
            roles = user.role.values_list('id', flat=True)
            menu_fields = MenuField.objects.filter(model='ProductArchive').values_list('field_name', flat=True)
            queryable_fields = set(FieldPermission.objects.filter(
                field__model='ProductArchive', role__in=roles, is_query=True
            ).values_list('field__field_name', flat=True))
            restricted_fields = set(menu_fields) - queryable_fields

            if restricted_fields:
                products_list = list(products)
                for prod in products_list:
                    for field in restricted_fields:
                        if field in prod:
                            prod[field] = '***'
                return DetailResponse(data=products_list, msg="获取产品字典成功")

        return DetailResponse(data=list(products), msg="获取产品字典成功")


class ProductSpecViewSet(FieldPermissionMixin, CustomModelViewSet):
    """
    产品规格提报明细视图集
    """
    queryset = ProductSpec.objects.all()
    serializer_class = ProductSpecSerializer
    permission_classes = [CustomPermission]


class ProductSpecSubmissionViewSet(FieldPermissionMixin, CustomModelViewSet):
    """产品规格提报历史维度表视图集，可见性仅由平台权限方案控制。"""
    queryset = ProductSpecSubmission.objects.all()
    serializer_class = ProductSpecSubmissionSerializer
    list_serializer_class = ProductSpecSubmissionListSerializer
    permission_classes = [CustomPermission]
    filter_fields = ['name', 'shop', 'platform', 'status', 'template_type']
    search_fields = ['name', 'shop']
    # 可见性由 filter_submissions_for_user（平台×scope）统一裁决，
    # 不叠加 DVAdmin 部门数据权限，避免跨部门数据被误过滤。
    extra_filter_class = [CoreModelFilterBankend]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            queryset = queryset.defer('snapshot_data').select_related('creator')
        return filter_submissions_for_user(queryset, self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_platforms(self, request):
        """返回当前用户可新建工单的平台列表（superadmin 为全部，其余按授权）。

        前端提报表单的平台下拉据此渲染，未授权平台不展示。
        """
        all_platforms = get_platform_choices()
        if is_data_superuser(request.user):
            return DetailResponse(data=all_platforms, msg='查询成功')
        valid = get_valid_platforms(request.user)
        allowed = [item for item in all_platforms if item['value'] in valid]
        return DetailResponse(data=allowed, msg='查询成功')

    def create(self, request, *args, **kwargs):
        platform = request.data.get('platform') or '京东'
        if not can_create_submission(request.user, platform):
            return ErrorResponse(msg='您没有该平台的权限', status=403)
        serializer = self.get_serializer(data=request.data, request=request)
        serializer.is_valid(raise_exception=True)
        serializer.save(creator=request.user)
        return DetailResponse(data=serializer.data, msg='提报历史创建成功')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return DetailResponse(data=self.get_serializer(instance, request=request).data, msg='查询成功')

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = get_object_or_404(self.get_queryset().select_for_update(), pk=kwargs["pk"])
        if not can_edit_submission(request.user, instance):
            return ErrorResponse(msg='仅本人草稿可以修改，已提交工单不可修改', status=403)
        platform = request.data.get('platform') or instance.platform
        if not can_create_submission(request.user, platform):
            return ErrorResponse(msg='您没有该平台的权限', status=403)
        serializer = self.get_serializer(instance, data=request.data, request=request, partial=kwargs.pop('partial', False))
        serializer.is_valid(raise_exception=True)
        serializer.save(modifier=request.user.id)
        return DetailResponse(data=serializer.data, msg=_("Update successful"))

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = get_object_or_404(self.get_queryset().select_for_update(), pk=kwargs["pk"])
        if not can_delete_submission(request.user, instance):
            return ErrorResponse(msg='仅本人草稿可以删除，已提交工单不可删除', status=403)
        instance.delete()
        return DetailResponse(data=[], msg=_("Delete successful"))

    @action(methods=['delete'], detail=False)
    @transaction.atomic
    def multiple_delete(self, request, *args, **kwargs):
        keys = request.data.get('keys') or []
        if not keys:
            return ErrorResponse(msg=_("keys field not provided"))
        try:
            requested_ids = {int(key) for key in keys}
        except (TypeError, ValueError):
            return ErrorResponse(msg='keys 包含无效工单编号', status=400)
        rows = list(ProductSpecSubmission.objects.select_for_update().filter(id__in=requested_ids).order_by("pk"))
        if (
            len(rows) != len(requested_ids)
            or any(not can_view_submission(request.user, row) for row in rows)
            or any(not can_delete_submission(request.user, row) for row in rows)
        ):
            return ErrorResponse(msg='包含无权删除、已正式提交或不存在的工单', status=403)
        ProductSpecSubmission.objects.filter(id__in=requested_ids).delete()
        return DetailResponse(data=[], msg=_("Delete successful"))

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        original = self.get_object()
        if not can_copy_submission(request.user, original):
            return ErrorResponse(msg='当前用户没有复用该工单的权限', status=403)
        new_name = request.data.get('name', f"{original.name}_复用")
        new_shop = request.data.get('shop', original.shop)
        clone = ProductSpecSubmission.objects.create(
            name=new_name,
            shop=new_shop,
            platform=original.platform,
            status='draft',
            product_count=original.product_count,
            snapshot_data=original.snapshot_data,
            template_type=original.template_type,
            creator=request.user,
        )
        specs_to_create = []
        for spec in ProductSpec.objects.filter(submission=original):
            spec.pk = None
            spec.submission = clone
            specs_to_create.append(spec)
        ProductSpec.objects.bulk_create(specs_to_create)
        return DetailResponse(data={'id': clone.id}, msg='活动提报复用成功！')

def merge_snapshots(old_snapshot, new_snapshot):
    if not old_snapshot or not new_snapshot:
        return new_snapshot

    try:
        old_sheets = old_snapshot.get('sheets', {})
        new_sheets = new_snapshot.get('sheets', {})
        for sheet_id, new_sheet in new_sheets.items():
            old_sheet = old_sheets.get(sheet_id, {})
            new_cell_data = new_sheet.get('cellData', {})
            old_cell_data = old_sheet.get('cellData', {})
            if not new_cell_data or not old_cell_data:
                continue
            for row_str, cols in new_cell_data.items():
                old_cols = old_cell_data.get(row_str, {})
                for col_str, new_cell in cols.items():
                    if isinstance(new_cell, dict) and new_cell.get('v') == '***':
                        # Restore value and style from old cell!
                        old_cell = old_cols.get(col_str)
                        if old_cell:
                            new_cell_data[row_str][col_str] = old_cell
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Merge snapshots error: {e}")
    return new_snapshot


class SaveProductSpecView(APIView):
    """
    保存产品规格书数据（来自Univer表格的批量数据）
    """
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def _clean_validation_value(value):
        return '' if value is None else str(value).strip()

    def validate_submission(self, data):
        """按模板 Schema 驱动校验提交数据的完整性"""
        errors = []
        template_type = data.get('templateType') or 'main_image'
        schema = get_schema(template_type)
        validation = schema['validation']

        # 1. 提报级必填校验
        for fkey in validation.get('requiredSubmissionFields', []):
            val = self._clean_validation_value(data.get(fkey))
            if not val:
                labels = {'name': '提报名称', 'shop': '提报店铺'}
                errors.append({
                    'productIndex': -1, 'productLabel': '提报信息',
                    'field': fkey, 'fieldLabel': labels.get(fkey, fkey),
                    'rule': 'required', 'message': f'{labels.get(fkey, fkey)}不能为空'
                })

        # 2. 产品级校验
        products = [product for product in data.get('products', []) if self.valid_product(product)]
        if not products:
            errors.append({
                'productIndex': -1, 'productLabel': '提报信息',
                'field': 'products', 'fieldLabel': '产品数据',
                'rule': 'required', 'message': '至少需要1个有效产品'
            })

        price_key = validation.get('priceFieldKey')
        date_key = validation.get('dateRangeFieldKey')

        for idx, prod in enumerate(products):
            label = f"商品提报 {idx + 1}"
            nickname = self._clean_validation_value(product_value(prod, 'nickname'))
            if not nickname:
                continue  # 空 nickname 的产品跳过

            # 必填字段校验：从模板 Schema 的 validation.requiredProductFields 读取
            required_product_fields = validation.get('requiredProductFields', [])
            field_defs = {f['key']: f for f in schema['fields']}
            for field_key in required_product_fields:
                fdef = field_defs.get(field_key)
                field_label = fdef['label'] if fdef else field_key
                val = self._clean_validation_value(product_value(prod, field_key))
                if not val or val == '***':
                    errors.append({
                        'productIndex': idx, 'productLabel': label,
                        'field': field_key, 'fieldLabel': field_label,
                        'rule': 'required',
                        'message': f'{label} 的「{field_label}」不能为空'
                    })

            # 价格校验：非必填，填写后校验为大于0的数值
            if price_key:
                price = self._clean_validation_value(product_value(prod, price_key))
                if price and price != '***':
                    try:
                        price_num = float(str(price).replace(',', ''))
                        if not math.isfinite(price_num) or price_num <= 0:
                            raise ValueError()
                    except (ValueError, TypeError):
                        errors.append({
                            'productIndex': idx, 'productLabel': label,
                            'field': price_key, 'fieldLabel': '提报价格',
                            'rule': 'format',
                            'message': f'{label} 的「提报价格」必须为大于0的数值'
                        })

            # 活动时间非必填，不再阻断提交

        return errors

    @staticmethod
    def valid_product(product):
        return isinstance(product, dict) and bool(str(product_value(product, 'nickname') or '').strip())

    def post(self, request):
        data = deepcopy(request.data)
        products = data.get('products', [])
        if not isinstance(products, list) or any(not isinstance(product, dict) or not isinstance(product.get('specData') or {}, dict) or not isinstance(product.get('cardIndex', 0), int) for product in products):
            return ErrorResponse(msg='products 必须是产品对象数组', status=400)
        status = data.get('status', 'draft')
        if status not in {'draft', 'submitted'}:
            return ErrorResponse(msg='无效的工单状态', status=400)
        submission_id = data.get('id')
        template_type = data.get('templateType') or 'main_image'
        platform = data.get('platform') or '京东'
        try:
            ensure_template_platform(template_type, platform)
        except ValueError as error:
            return ErrorResponse(msg=str(error), status=400)
        with transaction.atomic():
            # Row locks serialize the draft-state check with every mutation on databases
            # supporting SELECT FOR UPDATE. SQLite has no row locks (see review tests).
            existing = ProductSpecSubmission.objects.select_for_update().filter(pk=submission_id).first() if submission_id else None
            if submission_id and (not existing or not can_edit_submission(request.user, existing)):
                return ErrorResponse(msg='仅本人草稿可以修改，已提交工单不可修改', status=403)
            old_specs = {spec.card_index: spec for spec in existing.specs.all()} if existing else {}
            schema = get_schema(template_type)
            products = protect_products(products, schema, request.user, old_specs)
            snapshot = protect_snapshot(data.get('snapshot'), existing.snapshot_data if existing else None, schema, request.user, old_specs)
            data.update(products=products, snapshot=snapshot)
            if status == 'submitted':
                if not snapshot:
                    return ErrorResponse(msg='表格无内容，无法提交', status=400)
                errors = self.validate_submission(data)
                if errors:
                    return ErrorResponse(data={'errors': errors}, msg='提交校验未通过，请修正以下问题后重新提交', status=400)
                products = [product for product in products if self.valid_product(product)]
            return self._do_save(request, request.user, products, snapshot, submission_id,
                                 data.get('name', ''), data.get('shop', ''), platform, status, template_type)

    def _do_save(self, request, user, products, snapshot,
                 submission_id, name, shop, platform, status, template_type):
        """事务内执行实际保存逻辑"""
        submission = None
        schema_fields = get_schema(template_type)['fields']
        schema_keys = {field['key'] for field in schema_fields}

        # 1. 查找或创建提报历史维度记录
        if submission_id:
            submission = ProductSpecSubmission.objects.select_for_update().filter(id=submission_id).first()
            if not submission:
                return ErrorResponse(msg="未找到对应的提报历史记录", status=400)

            if not can_edit_submission(user, submission):
                return ErrorResponse(msg="仅本人草稿可以修改，已提交工单不可修改", status=403)
            target_platform = platform or submission.platform
            if not can_create_submission(user, target_platform):
                return ErrorResponse(msg="您没有该平台的权限", status=403)
            if not user.is_superuser and snapshot and submission.snapshot_data:
                snapshot = merge_snapshots(submission.snapshot_data, snapshot)

            submission.name = name or submission.name
            submission.shop = shop or submission.shop
            submission.platform = platform or submission.platform
            if status:
                submission.status = status
            submission.product_count = len(products)
            if snapshot:
                submission.snapshot_data = snapshot
            if template_type:
                submission.template_type = template_type
            submission.modifier = str(user.id)
            submission.save()
        else:
            if not can_create_submission(user, platform):
                return ErrorResponse(msg="您没有该平台的权限", status=403)
            import datetime
            time_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            submission = ProductSpecSubmission.objects.create(
                name=name or f"活动提报_{time_str}",
                shop=shop,
                platform=platform or '京东',
                status=status or 'draft',
                product_count=len(products),
                snapshot_data=snapshot,
                template_type=template_type,
                creator=user
            )

        # 获取当前提报关联的明细作为融合参考（如果有的话），用于保留无权操作字段
        existing_specs = {}
        if submission_id:
            existing_specs = {spec.card_index: spec for spec in ProductSpec.objects.filter(submission=submission)}
            ProductSpec.objects.filter(submission=submission).delete()

        created_count = 0
        updated_count = 0

        for prod in products:
            card_index = prod.get('cardIndex', 0)
            existing = existing_specs.get(card_index)
            if prod.get('__preserved_card__') and existing:
                existing.pk = None
                existing.save()
                continue
            dynamic_values = prod.get('specData') or {}

            # —— 兼容旧固定列：保持原有 *** 恢复逻辑（仅 main_image 的标准字段键存在）——
            def _restore(field_key, existing_attr):
                is_legacy_date = field_key in {'startDate', 'endDate'} and any(
                    field['kind'] == 'dateRange' for field in schema_fields
                )
                if field_key not in schema_keys and not is_legacy_date:
                    return ''
                val = product_value(prod, field_key)
                if val == '***' and existing:
                    return getattr(existing, existing_attr, '')
                return val

            nickname = _restore('nickname', 'nickname')
            brand = _restore('brand', 'brand')
            full_name = _restore('fullName', 'full_name')
            spec = _restore('spec', 'specification')
            efficacy_masked = (
                prod.get('efficacy') == '***'
                or dynamic_values.get('efficacy') == '***'
            )
            efficacy = _restore('efficacy', 'efficacy')

            gifts_list = prod.get('gifts', [])
            structured_gifts = dynamic_values.get('gifts')
            has_masked_gift = any(g.get('name') == '***' for g in gifts_list if isinstance(g, dict))
            if has_masked_gift and existing:
                gifts_str = existing.gifts
            else:
                gifts_str = " | ".join([f"🎁 {g.get('name')} x {g.get('qty')}" for g in gifts_list if g.get('name')])

            threshold_a = _restore('thresholdA', 'threshold_a')
            value_a = prod.get('valueA', '')
            threshold_b = prod.get('thresholdB', '')
            value_b = prod.get('valueB', '')
            member_gift = _restore('memberGift', 'member_gift')
            member_value = _restore('memberValue', 'member_value')
            selling_point = _restore('sellingPoint', 'selling_point')
            price = _restore('price', 'price')
            start_date = _restore('startDate', 'start_date')
            end_date = _restore('endDate', 'end_date')
            remarks = _restore('remarks', 'remarks')
            main_products = dynamic_values.get('mainProducts') or []
            first_main_product = main_products[0] if main_products else {}
            match_spec = (
                first_main_product.get('spec', '')
                if isinstance(first_main_product, dict)
                else ''
            )

            # —— 新增：动态字段统一收集到 spec_data（按当前模板 Schema 字段 kind 派发）——
            spec_data = {}
            for fdef in schema_fields:
                fk = fdef['key']
                kind = fdef['kind']
                if kind == 'gifts':
                    # 兼容旧平铺赠品，同时保留新版“策略 -> 赠品”完整结构。
                    if has_masked_gift and existing and existing.spec_data and 'gifts' in existing.spec_data:
                        spec_data['gifts'] = existing.spec_data['gifts']
                    else:
                        spec_data['gifts'] = (
                            structured_gifts
                            if isinstance(structured_gifts, list)
                            else gifts_list
                        )
                elif kind == 'dateRange':
                    # 日期字段：按字段键存结构化对象（兼容自定义 dateRange 键名）
                    dates = product_value(prod, fk, None)
                    if isinstance(dates, dict):
                        spec_data[fk] = {key: dates.get(key, '') for key in ('startDate', 'endDate')}
                    elif fk == 'dateRange':
                        spec_data[fk] = {'startDate': start_date, 'endDate': end_date}
                    else:
                        spec_data[fk] = {'startDate': '', 'endDate': ''}
                    if fk == 'dateRange':
                        start_date, end_date = spec_data[fk]['startDate'], spec_data[fk]['endDate']
                else:
                    # 优先取前端传的 camelCase 键；*** 时从旧 spec_data 恢复
                    val = product_value(prod, fk)
                    if val == '***' and existing and existing.spec_data:
                        val = existing.spec_data.get(fk, '')
                    spec_data[fk] = val

            efficacy_items = dynamic_values.get('efficacyItems')
            if efficacy_masked and existing and existing.spec_data:
                if 'efficacyItems' in existing.spec_data:
                    spec_data['efficacyItems'] = existing.spec_data['efficacyItems']
            elif isinstance(efficacy_items, list):
                spec_data['efficacyItems'] = efficacy_items

            # Icon 选择结果（[{id, shortName}]）与功效同构：*** 遮罩时沿用旧值，避免无权限用户清空。
            icon_masked = (
                prod.get('icon') == '***'
                or dynamic_values.get('icon') == '***'
            )
            icon_refs = dynamic_values.get('iconRefs')
            if icon_masked and existing and existing.spec_data:
                if 'iconRefs' in existing.spec_data:
                    spec_data['iconRefs'] = existing.spec_data['iconRefs']
            elif isinstance(icon_refs, list):
                spec_data['iconRefs'] = normalize_icon_refs(icon_refs)

            # 关联或更新已存在产品档案
            matched_product = None
            if full_name and match_spec:
                matched_product = ProductArchive.objects.filter(
                    product_name=full_name,
                    specification=match_spec
                ).first()
            if not matched_product and nickname and match_spec:
                matched_product = ProductArchive.objects.filter(
                    nickname=nickname,
                    specification=match_spec
                ).first()
            if not matched_product and full_name:
                matched_product = ProductArchive.objects.filter(
                    product_name=full_name
                ).first()
            if not matched_product and nickname:
                matched_product = ProductArchive.objects.filter(
                    nickname=nickname
                ).first()

            # 创建 ProductSpec 明细
            record = ProductSpec(
                submission=submission,
                card_index=card_index,
                product=matched_product,
                nickname=nickname,
                brand=brand,
                full_name=full_name,
                specification=spec,
                efficacy=efficacy,
                gifts=gifts_str,
                threshold_a=threshold_a,
                value_a=value_a,
                threshold_b=threshold_b,
                value_b=value_b,
                member_gift=member_gift,
                member_value=member_value,
                selling_point=selling_point,
                price=price,
                start_date=start_date,
                end_date=end_date,
                remarks=remarks,
                spec_data=spec_data
            )
            denied = restricted_fields(user, 'update' if existing else 'create')
            for field in schema_fields:
                attribute = field.get('maskKey')
                if attribute not in denied:
                    continue
                if attribute in {item.name for item in ProductSpec._meta.fields}:
                    setattr(record, attribute, getattr(existing, attribute) if existing else '')
                if field['key'] == 'dateRange':
                    record.start_date = existing.start_date if existing else ''
                    record.end_date = existing.end_date if existing else ''
            record.save()

        return DetailResponse(
            data={
                'id': submission.id,
                'total': len(products),
                'status': submission.status,
                **submission_permissions(user, submission),
            },
            msg=f"规格书“{submission.name}”保存成功！"
        )


class LoadProductSpecView(APIView):
    """
    加载产品规格书表格快照数据
    """
    permission_classes = [permissions.IsAuthenticated]

    @staticmethod
    def get_product_gift_strategies(submission, gifts_restricted):
        if gifts_restricted:
            return []
        return [
            {
                'cardIndex': spec.card_index,
                'giftStrategies': (spec.spec_data or {}).get('gifts', []),
            }
            for spec in submission.specs.order_by('card_index')
        ]

    @staticmethod
    def get_product_efficacy_items(submission, efficacy_restricted):
        if efficacy_restricted:
            return []
        return [
            {
                'cardIndex': spec.card_index,
                'efficacyItems': (spec.spec_data or {}).get('efficacyItems', []),
            }
            for spec in submission.specs.order_by('card_index')
        ]

    @staticmethod
    def get_product_icon_refs(submission, icon_restricted):
        if icon_restricted:
            return []
        return [
                {
                    'cardIndex': spec.card_index,
                    'iconRefs': normalize_icon_refs(
                        (spec.spec_data or {}).get('iconRefs', [])
                    ),
                }
            for spec in submission.specs.order_by('card_index')
        ]

    def get(self, request):
        """
        获取指定提报历史记录的Univer规格书快照，并针对没有查询权限的字段进行遮罩（显示***）
        """
        submission_id = request.query_params.get('id', None)
        if submission_id:
            snapshot_obj = ProductSpecSubmission.objects.filter(id=submission_id).first()
        else:
            snapshot_obj = None

        if snapshot_obj:
            if not can_view_submission(request.user, snapshot_obj):
                return ErrorResponse(msg="当前用户没有该工单的查看权限", status=403)
            restricted = restricted_fields(request.user)
            snapshot = mask_snapshot_for_user(snapshot_obj.snapshot_data, snapshot_obj.template_type, request.user)
            restricted_fields_for_response = restricted

            return DetailResponse(
                data={
                    'id': snapshot_obj.id,
                    'name': snapshot_obj.name,
                    'shop': snapshot_obj.shop,
                    'platform': snapshot_obj.platform,
                    'status': snapshot_obj.status,
                    'snapshot': snapshot,
                    'formCount': snapshot_obj.product_count or 1,
                    'templateType': snapshot_obj.template_type,
                    'templateSchema': to_schema(
                        ensure_template_platform(
                            snapshot_obj.template_type or 'main_image',
                            snapshot_obj.platform,
                        )
                    ),
                    **submission_permissions(request.user, snapshot_obj),
                    'productGiftStrategies': self.get_product_gift_strategies(
                        snapshot_obj,
                        'gifts' in restricted_fields_for_response,
                    ),
                    'productEfficacyItems': self.get_product_efficacy_items(
                        snapshot_obj,
                        'efficacy' in restricted_fields_for_response,
                    ),
                    'productIconRefs': self.get_product_icon_refs(
                        snapshot_obj,
                        'icon' in restricted_fields_for_response,
                    ),
                },
                msg="获取规格书快照成功"
            )
        else:
            return DetailResponse(
                data=None,
                msg="没有找到已保存的规格数据，请初始化新表"
            )
