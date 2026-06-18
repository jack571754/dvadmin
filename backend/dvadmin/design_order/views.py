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
from dvadmin.system.models import FieldPermission, MenuField, SystemConfig, Menu
from .models import ProductArchive, ProductSpec, ProductSpecSnapshot, ProductSpecSubmission
from .serializers import ProductArchiveSerializer, ProductSpecSerializer, ProductSpecSubmissionSerializer
from .templates_schemas import (
    get_schema, get_rows_per_block, get_maskkey_to_row,
    list_all_templates, list_template_types, BUILTIN_TEMPLATE_KEYS,
)


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
    filter_fields = ['name', 'shop', 'status', 'template_type']
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
        """按模板 Schema 驱动校验提交数据的完整性"""
        errors = []
        template_type = data.get('templateType') or 'main_image'
        schema = get_schema(template_type)
        validation = schema['validation']

        # 1. 提报级必填校验
        for fkey in validation.get('requiredSubmissionFields', []):
            raw = data.get(fkey)
            val = raw.strip() if isinstance(raw, str) else raw
            if not val:
                labels = {'name': '提报名称', 'shop': '提报店铺'}
                errors.append({
                    'productIndex': -1, 'productLabel': '提报信息',
                    'field': fkey, 'fieldLabel': labels.get(fkey, fkey),
                    'rule': 'required', 'message': f'{labels.get(fkey, fkey)}不能为空'
                })

        # 2. 产品级校验
        products = data.get('products', [])
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
            nickname = (prod.get('nickname') or '').strip()
            if not nickname:
                continue  # 空 nickname 的产品跳过

            # 必填字段校验：从模板 Schema 的 validation.requiredProductFields 读取
            required_product_fields = validation.get('requiredProductFields', [])
            field_defs = {f['key']: f for f in schema['fields']}
            for field_key in required_product_fields:
                fdef = field_defs.get(field_key)
                field_label = fdef['label'] if fdef else field_key
                val = (prod.get(field_key) or '').strip()
                if not val or val == '***':
                    errors.append({
                        'productIndex': idx, 'productLabel': label,
                        'field': field_key, 'fieldLabel': field_label,
                        'rule': 'required',
                        'message': f'{label} 的「{field_label}」不能为空'
                    })

            # 价格校验
            if price_key:
                price = (prod.get(price_key) or '').strip()
                if not price or price == '***':
                    errors.append({
                        'productIndex': idx, 'productLabel': label,
                        'field': price_key, 'fieldLabel': '提报价格',
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
                            'field': price_key, 'fieldLabel': '提报价格',
                            'rule': 'format',
                            'message': f'{label} 的「提报价格」必须为大于0的数值'
                        })

            # 日期校验
            if date_key:
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
        schema_fields = get_schema(template_type)['fields']

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

            # —— 兼容旧固定列：保持原有 *** 恢复逻辑（仅 main_image 的标准字段键存在）——
            def _restore(field_key, existing_attr):
                val = prod.get(field_key, '')
                if val == '***' and existing:
                    return getattr(existing, existing_attr, '')
                return val

            nickname = _restore('nickname', 'nickname')
            brand = _restore('brand', 'brand')
            full_name = _restore('fullName', 'full_name')
            spec = _restore('spec', 'specification')
            efficacy = _restore('efficacy', 'efficacy')

            gifts_list = prod.get('gifts', [])
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

            # —— 新增：动态字段统一收集到 spec_data（按当前模板 Schema 字段 kind 派发）——
            spec_data = {}
            for fdef in schema_fields:
                fk = fdef['key']
                kind = fdef['kind']
                if kind == 'gifts':
                    # gifts 单独处理：存结构化数组
                    if has_masked_gift and existing and existing.spec_data and 'gifts' in existing.spec_data:
                        spec_data['gifts'] = existing.spec_data['gifts']
                    else:
                        spec_data['gifts'] = gifts_list
                elif kind == 'dateRange':
                    # 日期字段：按字段键存结构化对象（兼容自定义 dateRange 键名）
                    spec_data[fk] = {'startDate': start_date, 'endDate': end_date}
                else:
                    # 优先取前端传的 camelCase 键；*** 时从旧 spec_data 恢复
                    val = prod.get(fk, '')
                    if val == '***' and existing and existing.spec_data:
                        val = existing.spec_data.get(fk, '')
                    spec_data[fk] = val

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
                remarks=remarks,
                spec_data=spec_data
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
                    template_type = snapshot_obj.template_type or 'main_image'
                    rows_per_block = get_rows_per_block(template_type)
                    maskkey_to_row = get_maskkey_to_row(template_type)
                    # 受限遮罩键 -> 块内行偏移集合
                    restricted_rows = {
                        maskkey_to_row[mk] for mk in restricted_fields if mk in maskkey_to_row
                    }

                    if restricted_rows:
                        for sheet_id, sheet_data in snapshot['sheets'].items():
                            cell_data = sheet_data.get('cellData', {})
                            for row_str, cols in list(cell_data.items()):
                                row = int(row_str)
                                rel_row = row % rows_per_block
                                if rel_row in restricted_rows:
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


# ========== 产品规格书模板管理（自定义模板 CRUD，内置只读）==========
_TEMPLATE_PARENT_KEY = "design_order_template"
ALLOWED_KINDS = {'text', 'longtext', 'mention', 'gifts', 'tier', 'dateRange', 'price'}
ALLOWED_STYLES = {'contentCenter', 'contentLeft', 'contentLeftShaded', 'editableCenter', 'editableDate'}


def _validate_template_schema(schema, is_create=True, instance_key=None):
    """校验自定义模板 Schema，返回错误消息列表（空表示通过）。"""
    errors = []
    if not isinstance(schema, dict):
        return ["请求体必须是 JSON 对象"]
    tt = schema.get('templateType')
    if not tt or not isinstance(tt, str):
        return ["templateType 必填且为字符串"]
    if not tt.replace('_', '').isalnum():
        errors.append("templateType 仅允许字母/数字/下划线")
    if tt in BUILTIN_TEMPLATE_KEYS:
        errors.append(f"内置模板 {tt} 不可创建/修改/删除")
    if is_create and tt in list_all_templates():
        errors.append(f"模板 {tt} 已存在")
    if instance_key and schema.get('templateType') != instance_key:
        errors.append("templateType 不可修改")

    rpb = schema.get('rowsPerBlock')
    if not isinstance(rpb, int) or rpb < 5:
        errors.append("rowsPerBlock 必须为 >=5 的整数")
        return errors
    if schema.get('columnsPerBlock') != 6:
        errors.append("columnsPerBlock 当前必须为 6")

    fields = schema.get('fields')
    if not isinstance(fields, list):
        errors.append("fields 必须为数组")
        return errors
    if len(fields) != rpb - 2:
        errors.append(f"fields 数量必须 = rowsPerBlock-2 = {rpb - 2}")
    rows = [f.get('row') for f in fields if isinstance(f, dict)]
    if sorted(rows) != list(range(1, rpb - 1)):
        errors.append(f"row 必须为 1..{rpb - 2} 连续唯一")

    price_field = next((f for f in fields if isinstance(f, dict) and f.get('kind') == 'price'), None)
    date_field = next((f for f in fields if isinstance(f, dict) and f.get('kind') == 'dateRange'), None)
    if not price_field or price_field.get('row') != rpb - 2 or price_field.get('key') != 'price':
        errors.append(f"倒数第二行(row={rpb - 2})必须为 key='price', kind='price'")
    if not date_field or date_field.get('row') != rpb - 3 or date_field.get('key') != 'dateRange':
        errors.append(f"倒数第三行(row={rpb - 3})必须为 key='dateRange', kind='dateRange'")

    for i, f in enumerate(fields):
        if not isinstance(f, dict):
            errors.append(f"fields[{i}] 必须为对象"); continue
        if not f.get('key'):
            errors.append(f"fields[{i}].key 必填")
        if not f.get('label'):
            errors.append(f"fields[{i}].label 必填")
        if f.get('kind') not in ALLOWED_KINDS:
            errors.append(f"fields[{i}].kind 非法: {f.get('kind')}")
        if f.get('style') not in ALLOWED_STYLES:
            errors.append(f"fields[{i}].style 非法: {f.get('style')}")

    if not isinstance(schema.get('validation', {}), dict):
        errors.append("validation 必须为对象")
    return errors


class ProductSpecTemplateViewSet(CustomModelViewSet):
    """产品规格书模板管理（自定义模板 CRUD，内置只读）。"""
    queryset = SystemConfig.objects.filter(parent__key=_TEMPLATE_PARENT_KEY).order_by('sort')
    permission_classes = [CustomPermission]
    http_method_names = ['get', 'post', 'put', 'delete']

    def list(self, request, *args, **kwargs):
        data = []
        for obj in self.get_queryset():
            schema = obj.value or {}
            if isinstance(schema, dict):
                data.append({**schema, 'id': obj.id, 'builtin': False})
        for tt, schema in list_all_templates().items():
            if tt in BUILTIN_TEMPLATE_KEYS:
                data.append({**schema, 'id': tt, 'builtin': True})
        return DetailResponse(data=data, msg="查询成功")

    def retrieve(self, request, pk=None):
        from .templates_schemas import BUILTIN_TEMPLATES
        if pk in BUILTIN_TEMPLATE_KEYS:
            return DetailResponse(data={**BUILTIN_TEMPLATES[pk], 'id': pk, 'builtin': True})
        obj = self.get_queryset().filter(id=pk).first()
        if not obj:
            return ErrorResponse(msg="模板不存在", status=404)
        return DetailResponse(data={**(obj.value or {}), 'id': obj.id, 'builtin': False})

    def create(self, request, *args, **kwargs):
        schema = request.data
        errs = _validate_template_schema(schema, is_create=True)
        if errs:
            return ErrorResponse(data={'errors': errs}, msg="模板校验未通过", status=400)
        parent = SystemConfig.objects.filter(key=_TEMPLATE_PARENT_KEY, parent__isnull=True).first()
        if not parent:
            return ErrorResponse(msg="模板父配置缺失，请先运行迁移", status=500)
        obj = SystemConfig.objects.create(
            key=schema['templateType'], parent=parent, title=schema.get('label', ''),
            value=schema, form_item_type=0, sort=0, status=True,
        )  # save() 自动 refresh_system_config
        return DetailResponse(data={'id': obj.id, 'templateType': obj.key}, msg="模板创建成功")

    def update(self, request, pk=None, *args, **kwargs):
        obj = self.get_queryset().filter(id=pk).first()
        if not obj:
            return ErrorResponse(msg="模板不存在", status=404)
        if obj.key in BUILTIN_TEMPLATE_KEYS:
            return ErrorResponse(msg="内置模板不可修改", status=400)
        schema = request.data
        errs = _validate_template_schema(schema, is_create=False, instance_key=obj.key)
        if errs:
            return ErrorResponse(data={'errors': errs}, msg="模板校验未通过", status=400)
        obj.value = schema
        obj.title = schema.get('label', obj.title)
        obj.save()  # 自动刷新缓存
        return DetailResponse(msg="模板更新成功")

    def destroy(self, request, pk=None, *args, **kwargs):
        obj = self.get_queryset().filter(id=pk).first()
        if not obj:
            return ErrorResponse(msg="模板不存在", status=404)
        if obj.key in BUILTIN_TEMPLATE_KEYS:
            return ErrorResponse(msg="内置模板不可删除", status=400)
        obj.delete()  # 自动刷新缓存
        return DetailResponse(msg="模板删除成功")

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def template_types(self, request):
        """供前端 dict-select 拉取可用模板列表（含内置）。"""
        return DetailResponse(data=list_template_types(), msg="查询成功")

    @action(detail=True, methods=['post'], permission_classes=[CustomPermission])
    def register_field_permissions(self, request, pk=None):
        """将模板的 maskKey 登记到 MenuField(model='ProductSpec')，仅登记未存在的。"""
        obj = self.get_queryset().filter(id=pk).first()
        if not obj:
            return ErrorResponse(msg="模板不存在", status=404)
        schema = obj.value or {}
        menu = Menu.objects.filter(web_path__in=['product_spec', '/product_spec']).first()
        created = []
        for f in schema.get('fields', []):
            mk = f.get('maskKey')
            if mk and not MenuField.objects.filter(model='ProductSpec', field_name=mk).exists():
                MenuField.objects.create(
                    model='ProductSpec', menu=menu, field_name=mk, title=f.get('label', mk)
                )
                created.append(mk)
        return DetailResponse(data={'created': created}, msg=f"已登记 {len(created)} 个字段")
