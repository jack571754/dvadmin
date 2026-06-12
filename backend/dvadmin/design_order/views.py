"""
设计工单管理视图集
"""
import json
from django.db import transaction
from rest_framework import permissions
from rest_framework.decorators import action, api_view
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from dvadmin.utils.viewset import CustomModelViewSet
from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse
from dvadmin.utils.permission import CustomPermission
from dvadmin.utils.filters import CustomDjangoFilterBackend
from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.system.models import FieldPermission, MenuField
from .models import ProductArchive, ProductSpec, ProductSpecSnapshot, ProductSpecSubmission
from .serializers import ProductArchiveSerializer, ProductSpecSerializer, ProductSpecSubmissionSerializer


class ProductArchiveViewSet(FieldPermissionMixin, CustomModelViewSet):
    """
    产品档案视图集
    """
    queryset = ProductArchive.objects.all()
    serializer_class = ProductArchiveSerializer
    permission_classes = [CustomPermission]
    filter_fields = [
        'product_code', 'product_name', 'brand', 'product_type',
        'product_status', 'sale_status', 'need_maintenance', 'nickname',
        'short_name',
    ]
    search_fields = ['product_code', 'product_name', 'short_name', 'nickname', 'brand']
    ordering_fields = ['id', 'product_code', 'retail_price', 'create_datetime']
    extra_filter_class = []
    filter_backends = [CustomDjangoFilterBackend, SearchFilter, OrderingFilter]

    @action(detail=False, methods=['get'])
    def dict(self, request):
        """获取产品档案字典数据（用于前端下拉选择）"""
        products = self.queryset.values(
            'id', 'product_code', 'product_name', 'nickname', 'brand', 'specification', 'keywords'
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
    """
    产品规格提报历史维度表视图集
    """
    queryset = ProductSpecSubmission.objects.all()
    serializer_class = ProductSpecSubmissionSerializer
    permission_classes = [CustomPermission]
    filter_fields = ['name', 'shop', 'status']
    search_fields = ['name', 'shop']

    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        """一键复用活动提报接口"""
        original = self.get_object()
        new_name = request.data.get('name', f"{original.name}_复用")
        new_shop = request.data.get('shop', original.shop)
        
        # Clone ProductSpecSubmission
        clone = ProductSpecSubmission.objects.create(
            name=new_name,
            shop=new_shop,
            status='draft',
            product_count=original.product_count,
            snapshot_data=original.snapshot_data,
            template_type=original.template_type,
            creator=request.user
        )
        
        # Clone associated ProductSpec details
        specs_to_create = []
        original_specs = ProductSpec.objects.filter(submission=original)
        for spec in original_specs:
            spec.pk = None  # Reset pk to create new records
            spec.submission = clone
            specs_to_create.append(spec)
            
        ProductSpec.objects.bulk_create(specs_to_create)
        
        return DetailResponse(data={'id': clone.id}, msg="活动提报复用成功！")


ROW_TO_FIELD_MAP_16 = {
    1: 'brand',
    2: 'nickname',
    3: 'full_name',
    4: 'specification',
    5: 'efficacy',
    6: 'gifts',
    7: 'threshold_a',
    8: 'member_gift',
    9: 'member_value',
    10: 'selling_point',
    11: 'price',
    12: 'start_date',
    13: 'end_date',
    14: 'remarks'
}

ROW_TO_FIELD_MAP_15 = {
    1: 'brand',
    2: 'nickname',
    3: 'full_name',
    4: 'specification',
    5: 'efficacy',
    6: 'gifts',
    7: 'threshold_a',
    8: 'member_gift',
    9: 'member_value',
    10: 'selling_point',
    11: 'price',
    12: 'start_date',
    13: 'remarks'
}

ROW_TO_FIELD_MAP = ROW_TO_FIELD_MAP_15


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

    def validate_submission(self, data):
        """校验提交数据的完整性"""
        errors = []

        # 1. 提报级校验
        name = (data.get('name') or '').strip()
        if not name:
            errors.append({
                'productIndex': -1, 'productLabel': '提报信息',
                'field': 'name', 'fieldLabel': '提报名称',
                'rule': 'required', 'message': '提报名称不能为空'
            })

        shop = (data.get('shop') or '').strip()
        if not shop:
            errors.append({
                'productIndex': -1, 'productLabel': '提报信息',
                'field': 'shop', 'fieldLabel': '提报店铺',
                'rule': 'required', 'message': '提报店铺不能为空'
            })

        # 2. 产品级校验
        products = data.get('products', [])
        if not products:
            errors.append({
                'productIndex': -1, 'productLabel': '提报信息',
                'field': 'products', 'fieldLabel': '产品数据',
                'rule': 'required', 'message': '至少需要1个有效产品'
            })

        for idx, prod in enumerate(products):
            label = f"商品提报 {idx + 1}"
            nickname = (prod.get('nickname') or '').strip()
            if not nickname:
                continue  # 空 nickname 的产品跳过

            # 必填字段
            for field_key, field_label in [
                ('brand', '品牌'),
                ('fullName', '官方全称'),
                ('spec', '规格'),
            ]:
                val = (prod.get(field_key) or '').strip()
                if not val or val == '***':
                    errors.append({
                        'productIndex': idx, 'productLabel': label,
                        'field': field_key, 'fieldLabel': field_label,
                        'rule': 'required',
                        'message': f'{label} 的「{field_label}」不能为空'
                    })

            # 价格校验
            price = (prod.get('price') or '').strip()
            if not price or price == '***':
                errors.append({
                    'productIndex': idx, 'productLabel': label,
                    'field': 'price', 'fieldLabel': '提报价格',
                    'rule': 'required',
                    'message': f'{label} 的「提报价格」不能为空'
                })
            else:
                try:
                    price_num = float(str(price).replace(',', ''))
                    if price_num <= 0:
                        raise ValueError()
                except (ValueError, TypeError):
                    errors.append({
                        'productIndex': idx, 'productLabel': label,
                        'field': 'price', 'fieldLabel': '提报价格',
                        'rule': 'format',
                        'message': f'{label} 的「提报价格」必须为大于0的数值'
                    })

            # 日期校验
            start_date = (prod.get('startDate') or '').strip()
            end_date = (prod.get('endDate') or '').strip()
            if not start_date or not end_date or start_date == '***' or end_date == '***':
                errors.append({
                    'productIndex': idx, 'productLabel': label,
                    'field': 'dateRange', 'fieldLabel': '活动时间',
                    'rule': 'required',
                    'message': f'{label} 的「活动时间」不能为空'
                })

        return errors

    def post(self, request):
        """
        保存Univer表格提交的结构化产品规格数据到指定的提报历史中
        请求体: { id: submission_id, name: '...', shop: '...', products: [...], snapshot: {...}, formCount: ... }
        """
        products = request.data.get('products', [])
        snapshot = request.data.get('snapshot', None)
        form_count = request.data.get('formCount', 1)
        submission_id = request.data.get('id', None)
        name = request.data.get('name', '')
        shop = request.data.get('shop', '')
        status = request.data.get('status', 'draft')
        template_type = request.data.get('templateType', 'main_image')

        # 提交时执行校验
        if status == 'submitted':
            validation_errors = self.validate_submission(request.data)
            if validation_errors:
                return ErrorResponse(
                    data={'errors': validation_errors},
                    msg='提交校验未通过，请修正以下问题后重新提交',
                    status=400
                )

        user = request.user
        submission = None

        with transaction.atomic():
            return self._do_save(request, user, products, snapshot, form_count,
                                 submission_id, name, shop, status, template_type)

    def _do_save(self, request, user, products, snapshot, form_count,
                 submission_id, name, shop, status, template_type):
        """事务内执行实际保存逻辑"""
        submission = None

        # 1. 查找或创建提报历史维度记录
        if submission_id:
            submission = ProductSpecSubmission.objects.filter(id=submission_id).first()
            if not submission:
                return ErrorResponse(msg="未找到对应的提报历史记录", status=400)
            
            # 如果是已提交状态，非超级管理员不可修改
            if submission.status == 'submitted' and not user.is_superuser:
                return ErrorResponse(msg="该提报已提交正式归档，无法修改", status=400)

            if not user.is_superuser and snapshot and submission.snapshot_data:
                snapshot = merge_snapshots(submission.snapshot_data, snapshot)
            
            submission.name = name or submission.name
            submission.shop = shop or submission.shop
            if status:
                submission.status = status
            submission.product_count = len(products)
            if snapshot:
                submission.snapshot_data = snapshot
            if template_type:
                submission.template_type = template_type
            submission.save()
        else:
            import datetime
            time_str = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            submission = ProductSpecSubmission.objects.create(
                name=name or f"活动提报_{time_str}",
                shop=shop,
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

            nickname = prod.get('nickname', '')
            if nickname == '***' and existing:
                nickname = existing.nickname
            
            brand = prod.get('brand', '')
            if brand == '***' and existing:
                brand = existing.brand

            full_name = prod.get('fullName', '')
            if full_name == '***' and existing:
                full_name = existing.full_name

            spec = prod.get('spec', '')
            if spec == '***' and existing:
                spec = existing.specification

            efficacy = prod.get('efficacy', '')
            if efficacy == '***' and existing:
                efficacy = existing.efficacy

            # gifts
            gifts_list = prod.get('gifts', [])
            has_masked_gift = any(g.get('name') == '***' for g in gifts_list if isinstance(g, dict))
            if has_masked_gift and existing:
                gifts_str = existing.gifts
            else:
                gifts_str = " | ".join([f"🎁 {g.get('name')} x {g.get('qty')}" for g in gifts_list if g.get('name')])

            threshold_a = prod.get('thresholdA', '')
            if threshold_a == '***' and existing:
                threshold_a = existing.threshold_a

            value_a = prod.get('valueA', '')
            threshold_b = prod.get('thresholdB', '')
            value_b = prod.get('valueB', '')

            member_gift = prod.get('memberGift', '')
            if member_gift == '***' and existing:
                member_gift = existing.member_gift

            member_value = prod.get('memberValue', '')
            if member_value == '***' and existing:
                member_value = existing.member_value

            selling_point = prod.get('sellingPoint', '')
            if selling_point == '***' and existing:
                selling_point = existing.selling_point

            price = prod.get('price', '')
            if price == '***' and existing:
                price = existing.price

            start_date = prod.get('startDate', '')
            if start_date == '***' and existing:
                start_date = existing.start_date

            end_date = prod.get('endDate', '')
            if end_date == '***' and existing:
                end_date = existing.end_date

            remarks = prod.get('remarks', '')
            if remarks == '***' and existing:
                remarks = existing.remarks

            # 关联或更新已存在产品档案
            matched_product = None
            if full_name and spec:
                matched_product = ProductArchive.objects.filter(
                    product_name=full_name,
                    specification=spec
                ).first()
            if not matched_product and nickname and spec:
                matched_product = ProductArchive.objects.filter(
                    nickname=nickname,
                    specification=spec
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
            ProductSpec.objects.create(
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
                remarks=remarks
            )

        return DetailResponse(
            data={
                'id': submission.id,
                'total': len(products),
            },
            msg=f"规格书“{submission.name}”保存成功！"
        )


class LoadProductSpecView(APIView):
    """
    加载产品规格书表格快照数据
    """
    permission_classes = [permissions.IsAuthenticated]

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
            snapshot = snapshot_obj.snapshot_data
            
            # 执行列字段遮罩
            user = request.user
            if not user.is_superuser and snapshot:
                roles = user.role.values_list('id', flat=True)
                menu_fields = MenuField.objects.filter(model='ProductSpec').values_list('field_name', flat=True)
                queryable_fields = set(FieldPermission.objects.filter(
                    field__model='ProductSpec', role__in=roles, is_query=True
                ).values_list('field__field_name', flat=True))
                restricted_fields = set(menu_fields) - queryable_fields
                
                if restricted_fields and 'sheets' in snapshot:
                    for sheet_id, sheet_data in snapshot['sheets'].items():
                        cell_data = sheet_data.get('cellData', {})
                        # Determine if this sheet is 16-row or 15-row based on row 13 label
                        # Row 13 of col 0 in 16-row is '活动结束日期'
                        row13_col0 = cell_data.get('13', {}).get('0', {})
                        is_16_row = False
                        if isinstance(row13_col0, dict):
                            val = row13_col0.get('v')
                            if val in ['活动结束日期', '活动结束时间']:
                                is_16_row = True
                        
                        mod_val = 16 if is_16_row else 15
                        field_map = ROW_TO_FIELD_MAP_16 if is_16_row else ROW_TO_FIELD_MAP_15
                        
                        for row_str, cols in list(cell_data.items()):
                            row = int(row_str)
                            rel_row = row % mod_val
                            field_name = field_map.get(rel_row)
                            if field_name in restricted_fields:
                                for col_str in list(cols.keys()):
                                    col = int(col_str)
                                    if col > 0:
                                        if isinstance(cols[col_str], dict):
                                            cols[col_str]['v'] = '***'
            
            return DetailResponse(
                data={
                    'id': snapshot_obj.id,
                    'name': snapshot_obj.name,
                    'shop': snapshot_obj.shop,
                    'status': snapshot_obj.status,
                    'snapshot': snapshot,
                    'formCount': snapshot_obj.product_count or 1,
                    'templateType': snapshot_obj.template_type
                },
                msg="获取规格书快照成功"
            )
        else:
            return DetailResponse(
                data=None,
                msg="没有找到已保存的规格数据，请初始化新表"
            )
