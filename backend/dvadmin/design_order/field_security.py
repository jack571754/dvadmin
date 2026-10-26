"""Server-owned ProductSpec field policy shared by save and snapshot responses."""
from copy import deepcopy

from dvadmin.system.models import FieldPermission, MenuField
from .template_service import get_schema


def restricted_fields(user, operation='query'):
    # Anonymous reads are share-code access: preserve the original share semantics.
    if not getattr(user, 'is_authenticated', False) or user.is_superuser:
        return set()
    registered = set(MenuField.objects.filter(model='ProductSpec').values_list('field_name', flat=True))
    allowed = FieldPermission.objects.filter(field__model='ProductSpec', role__in=user.role.all(), **{f'is_{operation}': True}).values_list('field__field_name', flat=True)
    return registered - set(allowed)


def scrub_cell(cell, value='***'):
    # v, p, f, si and custom payloads may all carry content. Only style survives.
    return {**({'s': deepcopy(cell['s'])} if isinstance(cell, dict) and 's' in cell else {}), 'v': value}


def mask_snapshot_for_user(snapshot, template_type, user):
    snapshot = deepcopy(snapshot)
    denied = restricted_fields(user)
    if not denied or not isinstance(snapshot, dict):
        return snapshot
    schema = get_schema(template_type or 'main_image')
    rows = {field['row'] for field in schema['fields'] if field.get('maskKey') in denied}
    for sheet in snapshot.get('sheets', {}).values():
        mask_sheet_cells(sheet.get('cellData', {}), schema['rowsPerBlock'], rows)
    return snapshot


def mask_sheet_cells(cell_data, rows_per_block, restricted_rows):
    for row, columns in cell_data.items():
        if int(row) % rows_per_block in restricted_rows:
            for column, cell in list(columns.items()):
                if int(column) > 0:
                    columns[column] = scrub_cell(cell)


def product_value(product, key, default=''):
    dynamic = product.get('specData') or {}
    return dynamic[key] if key in dynamic else product.get(key, default)


SIDECARS = {'efficacy': ('efficacyItems',), 'icon': ('iconRefs',), 'nickname': ('mainProducts',), 'fullName': ('mainProducts',)}


def protect_products(products, schema, user, existing_specs):
    result = []
    for source in products:
        product = deepcopy(source)
        index = product.get('cardIndex', 0)
        old = existing_specs.get(index)
        denied = restricted_fields(user, 'update' if old else 'create')
        dynamic = product['specData'] = product.get('specData') or {}
        for field in schema['fields']:
            if field.get('maskKey') not in denied:
                continue
            key = field['key']
            previous = old.spec_data or {} if old else {}
            fallback = getattr(old, field.get('maskKey', ''), '') if old else ''
            if field['kind'] == 'dateRange':
                fallback = {'startDate': old.start_date if old else '', 'endDate': old.end_date if old else ''} if key == 'dateRange' else {'startDate': '', 'endDate': ''}
            elif field['kind'] == 'gifts':
                fallback = []
            value = deepcopy(previous.get(key, fallback))
            dynamic[key] = value
            product[key] = value
            if key == 'dateRange':
                product.update(startDate=value.get('startDate', ''), endDate=value.get('endDate', ''))
            for sidecar in SIDECARS.get(key, ()):
                dynamic[sidecar] = deepcopy(previous.get(sidecar, []))
        result.append(product)
    # Omitting a card must not delete fields for which this editor has no update grant.
    if restricted_fields(user, 'update'):
        seen = {product.get('cardIndex', 0) for product in result}
        for index, old in existing_specs.items():
            if index not in seen:
                legacy = {field['key']: getattr(old, field.get('maskKey', ''), '') for field in schema['fields']}
                legacy.update(cardIndex=index, nickname=old.nickname, startDate=old.start_date, endDate=old.end_date, specData=deepcopy(old.spec_data or {}), __preserved_card__=True)
                result.append(legacy)
    return result


def protect_snapshot(snapshot, previous, schema, user, existing_specs):
    if not isinstance(snapshot, dict):
        return deepcopy(previous) if previous else snapshot
    result = deepcopy(snapshot)
    old_sheets = (previous or {}).get('sheets', {})
    new_sheets = result.setdefault('sheets', {})
    denied_by_mode = {mode: restricted_fields(user, mode) for mode in ('create', 'update')}
    for sheet_id in set(new_sheets) | set(old_sheets):
        old_sheet = old_sheets.get(sheet_id, {})
        if sheet_id not in new_sheets:
            if denied_by_mode['update']:
                new_sheets[sheet_id] = deepcopy(old_sheet)
            continue
        cells = new_sheets[sheet_id].setdefault('cellData', {})
        old_cells = old_sheet.get('cellData', {})
        for row in set(cells) | set(old_cells):
            relative = int(row) % schema['rowsPerBlock']
            field = next((field for field in schema['fields'] if field['row'] == relative), None)
            if not field:
                continue
            columns = cells.setdefault(row, {})
            old_columns = old_cells.get(row, {})
            for column in set(columns) | set(old_columns):
                if int(column) <= 0:
                    continue
                card = (int(row) // schema['rowsPerBlock']) * schema['columnsPerBlock'] + int(column) - 1
                mode = 'update' if card in existing_specs else 'create'
                preserve_old = column in old_columns and field.get('maskKey') in denied_by_mode['update']
                if not preserve_old and field.get('maskKey') not in denied_by_mode[mode]:
                    continue
                if preserve_old:
                    columns[column] = deepcopy(old_columns[column])
                elif column in columns:
                    columns[column] = scrub_cell(columns[column], '')
    return result
