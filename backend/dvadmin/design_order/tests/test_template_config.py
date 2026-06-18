"""产品规格书模板管理 ViewSet + 自定义模板校验/保存行为测试。"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from dvadmin.design_order.views import ProductSpecTemplateViewSet, SaveProductSpecView
from dvadmin.design_order.models import ProductSpec, ProductSpecSubmission
from dvadmin.design_order.templates_schemas import list_all_templates
from dvadmin.system.models import Role, SystemConfig, MenuField, Menu

User = get_user_model()


@pytest.fixture
def superuser(db):
    Role.objects.get_or_create(name="管理员", defaults={"key": "admin", "sort": 1, "status": True})
    return User.objects.create_superuser(username='t_tpl', password='p', mobile='13800000099')


@pytest.fixture
def factory():
    return APIRequestFactory()


def _valid_custom_schema(template_type='custom_test'):
    return {
        'templateType': template_type,
        'label': '测试自定义模板',
        'rowsPerBlock': 15,
        'columnsPerBlock': 6,
        'fields': [
            {'row': i, 'key': f'cf{i}', 'label': f'字段{i}', 'style': 'contentCenter', 'kind': 'text', 'maskKey': f'cf_{i}'}
            for i in range(1, 12)
        ] + [
            {'row': 12, 'key': 'dateRange', 'label': '日期', 'style': 'editableCenter', 'kind': 'dateRange', 'maskKey': 'start_date'},
            {'row': 13, 'key': 'price', 'label': '价格', 'style': 'editableCenter', 'kind': 'price', 'maskKey': 'price'},
        ],
        'validation': {
            'requiredSubmissionFields': ['name', 'shop'],
            'requiredProductFields': ['cf1'],
            'priceFieldKey': 'price',
            'dateRangeFieldKey': 'dateRange',
        },
    }


def _auth(factory, method, url, user, data=None):
    req = getattr(factory, method)(url, data, format='json') if data is not None else getattr(factory, method)(url)
    force_authenticate(req, user=user)
    return req


# ========== 模板管理 ViewSet ==========

@pytest.mark.django_db
def test_list_returns_builtin_and_custom(factory, superuser):
    V = ProductSpecTemplateViewSet.as_view({'get': 'list'})
    resp = V(_auth(factory, 'get', '/t/', superuser))
    resp.render()
    import json
    data = json.loads(resp.content)['data']
    builtins = [d['templateType'] for d in data if d.get('builtin')]
    assert set(builtins) == {'main_image', 'live_stream', 'detail_page'}


@pytest.mark.django_db
def test_create_custom_template_and_cache_refresh(factory, superuser):
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    resp = Vc(_auth(factory, 'post', '/t/', superuser, _valid_custom_schema('promo_unit')))
    resp.render()
    import json
    assert resp.status_code == 200
    # 缓存即时生效
    assert 'promo_unit' in list_all_templates()


@pytest.mark.django_db
def test_create_builtin_rejected(factory, superuser):
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    resp = Vc(_auth(factory, 'post', '/t/', superuser, _valid_custom_schema('main_image')))
    resp.render()
    assert resp.status_code == 400


@pytest.mark.django_db
def test_create_bad_fields_count_rejected(factory, superuser):
    bad = _valid_custom_schema('bad_count')
    bad['fields'] = bad['fields'][:5]
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    resp = Vc(_auth(factory, 'post', '/t/', superuser, bad))
    resp.render()
    assert resp.status_code == 400


@pytest.mark.django_db
def test_create_bad_price_row_rejected(factory, superuser):
    bad = _valid_custom_schema('bad_price')
    # 把 price 行的 key 改错
    for f in bad['fields']:
        if f['kind'] == 'price':
            f['key'] = 'wrong'
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    resp = Vc(_auth(factory, 'post', '/t/', superuser, bad))
    resp.render()
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_field_permissions_creates_menufield(factory, superuser):
    # 测试环境无 init 菜单，先建一个规格书菜单（生产由 init 播种）
    menu = Menu.objects.create(name='产品规格书', web_path='/product_spec', component='design_order/product_spec/index')
    # 先创建一个自定义模板
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    resp = Vc(_auth(factory, 'post', '/t/', superuser, _valid_custom_schema('reg_test')))
    resp.render()
    import json
    new_id = json.loads(resp.content)['data']['id']
    # 登记字段权限
    Vr = ProductSpecTemplateViewSet.as_view({'post': 'register_field_permissions'})
    resp2 = Vr(_auth(factory, 'post', f'/t/{new_id}/register_field_permissions/', superuser), pk=new_id)
    resp2.render()
    assert resp2.status_code == 200
    # cf_1 应已登记到 MenuField
    assert MenuField.objects.filter(model='ProductSpec', field_name='cf_1').exists()
    # 清理
    SystemConfig.objects.filter(key='reg_test').delete()


# ========== 自定义模板的校验与保存行为 ==========

@pytest.mark.django_db
def test_validate_submission_uses_custom_required_fields(factory, superuser):
    """自定义模板按其 requiredProductFields 校验，而非硬编码 brand/fullName/spec。"""
    # 创建自定义模板（requiredProductFields=['cf1']）
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    Vc(_auth(factory, 'post', '/t/', superuser, _valid_custom_schema('v_custom')))
    # 提交产品：缺 cf1 → 应报错
    products = [{
        'cardIndex': 0, 'nickname': 'N',
        'cf1': '',  # 必填，留空
        'price': '99', 'startDate': '2026-05-15 00:00', 'endDate': '2026-05-16 00:00',
        'gifts': [], 'dateRange': {'startDate': '2026-05-15 00:00', 'endDate': '2026-05-16 00:00'},
    }]
    req = factory.post('/save_spec/', {
        'name': '自定义提报', 'shop': '店', 'status': 'submitted',
        'templateType': 'v_custom', 'formCount': 1, 'products': products, 'snapshot': None,
    }, format='json')
    force_authenticate(req, user=superuser)
    resp = SaveProductSpecView.as_view()(req)
    assert resp.status_code == 400
    errs = resp.data['data']['errors']
    assert any(e['field'] == 'cf1' and e['rule'] == 'required' for e in errs)
    # 清理
    SystemConfig.objects.filter(key='v_custom').delete()


@pytest.mark.django_db
def test_do_save_kind_driven_specdata_for_custom_daterange(factory, superuser):
    """自定义模板 dateRange 字段按 kind 派发存入 spec_data，键名为字段 key。"""
    Vc = ProductSpecTemplateViewSet.as_view({'post': 'create'})
    Vc(_auth(factory, 'post', '/t/', superuser, _valid_custom_schema('s_custom')))
    products = [{
        'cardIndex': 0, 'nickname': 'N', 'cf1': 'v1', 'cf2': 'v2',
        'price': '88', 'startDate': '2026-06-01 00:00', 'endDate': '2026-06-02 00:00',
        'gifts': [], 'dateRange': {'startDate': '2026-06-01 00:00', 'endDate': '2026-06-02 00:00'},
    }]
    req = factory.post('/save_spec/', {
        'name': '自定义保存', 'shop': '店', 'status': 'draft',
        'templateType': 's_custom', 'formCount': 1, 'products': products, 'snapshot': None,
    }, format='json')
    force_authenticate(req, user=superuser)
    resp = SaveProductSpecView.as_view()(req)
    assert resp.status_code == 200
    spec = ProductSpec.objects.get(submission_id=resp.data['data']['id'], card_index=0)
    # dateRange 按 kind 存结构化对象，键名为 'dateRange'
    assert spec.spec_data['dateRange'] == {'startDate': '2026-06-01 00:00', 'endDate': '2026-06-02 00:00'}
    # cf1/cf2 普通字段
    assert spec.spec_data['cf1'] == 'v1'
    assert spec.spec_data['cf2'] == 'v2'
    # 清理
    SystemConfig.objects.filter(key='s_custom').delete()
