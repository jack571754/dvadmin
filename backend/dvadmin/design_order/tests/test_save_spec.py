import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from dvadmin.design_order.views import SaveProductSpecView, LoadProductSpecView
from dvadmin.design_order.models import ProductSpec
from dvadmin.system.models import Role

User = get_user_model()


@pytest.fixture
def superuser(db):
    # CustomUserManager.create_superuser 依赖 "管理员" 角色存在（由 manage.py init 创建）
    Role.objects.get_or_create(name="管理员", defaults={"key": "admin", "sort": 1, "status": True})
    return User.objects.create_superuser(username='t_admin', password='p', mobile='13800000000')


@pytest.fixture
def factory():
    return APIRequestFactory()


def _valid_products():
    return [{
        'cardIndex': 0,
        'brand': '巨子生物 | 可丽金',
        'nickname': '可丽金胶卷精华水',
        'fullName': '可丽金胶卷精华水',
        'spec': '150ml',
        'efficacy': '紧致',
        'gifts': [{'name': '小样', 'qty': '1'}],
        'thresholdA': '满369元',
        'valueA': '价值143元',
        'memberGift': '会员礼',
        'memberValue': '价值409元',
        'sellingPoint': '卖点',
        'price': '269',
        'startDate': '2026-05-15 00:00',
        'endDate': '2026-05-31 00:00',
        'remarks': '备注',
    }]


@pytest.mark.django_db
def test_save_main_image_persists_spec_data(factory, superuser):
    req = factory.post('/save_spec/', {
        'name': '5月提报', 'shop': '天猫旗舰店', 'status': 'draft',
        'templateType': 'main_image', 'formCount': 1,
        'products': _valid_products(), 'snapshot': None,
    }, format='json')
    force_authenticate(req, user=superuser)
    resp = SaveProductSpecView.as_view()(req)
    assert resp.status_code == 200
    sub_id = resp.data['data']['id']
    spec = ProductSpec.objects.get(submission_id=sub_id, card_index=0)
    # 固定列（旧行为）
    assert spec.brand == '巨子生物 | 可丽金'
    assert spec.price == '269'
    # 动态字段 spec_data
    assert spec.spec_data['brand'] == '巨子生物 | 可丽金'
    assert spec.spec_data['efficacy'] == '紧致'
    assert spec.spec_data['price'] == '269'
    assert spec.spec_data['dateRange'] == {'startDate': '2026-05-15 00:00', 'endDate': '2026-05-31 00:00'}
    assert spec.specification == ''
    assert spec.member_gift == ''
    assert spec.member_value == ''
    assert not {'spec', 'memberGift', 'memberValue'} & set(spec.spec_data)


@pytest.mark.django_db
def test_auto_save_draft_accepts_long_nickname(factory, superuser):
    products = _valid_products()
    long_nickname = '超长昵称' * 30
    products[0]['nickname'] = long_nickname
    products[0]['specData'] = {'nickname': long_nickname}
    req = factory.post('/save_spec/', {
        'name': '自动保存测试', 'shop': '测试店铺', 'status': 'draft',
        'templateType': 'main_image', 'formCount': 1,
        'products': products, 'snapshot': None,
    }, format='json')
    force_authenticate(req, user=superuser)

    resp = SaveProductSpecView.as_view()(req)

    assert resp.status_code == 200
    spec = ProductSpec.objects.get(
        submission_id=resp.data['data']['id'],
        card_index=0,
    )
    assert spec.nickname == long_nickname
    assert spec.spec_data['nickname'] == long_nickname


@pytest.mark.django_db
def test_submit_accepts_optional_missing_price(factory, superuser):
    products = _valid_products()
    products[0]['price'] = ''
    req = factory.post('/save_spec/', {
        'name': '5月提报', 'shop': '天猫旗舰店', 'status': 'submitted',
        'templateType': 'main_image', 'formCount': 1,
        'products': products, 'snapshot': {'sheets': {'s1': {'cellData': {}}}},
    }, format='json')
    force_authenticate(req, user=superuser)
    resp = SaveProductSpecView.as_view()(req)
    assert resp.status_code == 200
    assert resp.data['data']['status'] == 'submitted'


@pytest.mark.django_db
def test_submit_validation_blocks_bad_price_format(factory, superuser):
    products = _valid_products()
    products[0]['price'] = 'abc'
    req = factory.post('/save_spec/', {
        'name': '5月提报', 'shop': '天猫旗舰店', 'status': 'submitted',
        'templateType': 'main_image', 'formCount': 1,
        'products': products, 'snapshot': {'sheets': {'s1': {'cellData': {}}}},
    }, format='json')
    force_authenticate(req, user=superuser)
    resp = SaveProductSpecView.as_view()(req)
    assert resp.status_code == 400
    errs = resp.data['data']['errors']
    assert any(e['field'] == 'price' and e['rule'] == 'format' for e in errs)


@pytest.mark.django_db
def test_submit_accepts_numeric_price_and_returns_persisted_status(factory, superuser):
    products = _valid_products()
    products[0]['price'] = 269
    req = factory.post('/save_spec/', {
        'name': '5月提报', 'shop': '天猫旗舰店', 'status': 'submitted',
        'templateType': 'main_image', 'formCount': 1,
        'products': products, 'snapshot': {'sheets': {'s1': {'cellData': {}}}},
    }, format='json')
    force_authenticate(req, user=superuser)

    resp = SaveProductSpecView.as_view()(req)

    assert resp.status_code == 200
    assert resp.data['data']['status'] == 'submitted'
    spec = ProductSpec.objects.get(submission_id=resp.data['data']['id'], card_index=0)
    assert spec.submission.status == 'submitted'
    assert spec.price == '269'


@pytest.mark.django_db
def test_load_masking_driven_by_schema_rows(factory, superuser):
    """超管不遮罩；受限字段集为空时也不遮罩（行为基线）。"""
    # 先保存一条
    req = factory.post('/save_spec/', {
        'name': '5月提报', 'shop': '天猫旗舰店', 'status': 'draft',
        'templateType': 'main_image', 'formCount': 1,
        'products': _valid_products(), 'snapshot': {
            'sheets': {'s1': {'cellData': {'1': {'1': {'v': '巨子生物'}}}}}
        },
    }, format='json')
    force_authenticate(req, user=superuser)
    save_resp = SaveProductSpecView.as_view()(req)
    sub_id = save_resp.data['data']['id']

    # 超管加载：不遮罩
    req2 = factory.get(f'/load_spec/?id={sub_id}')
    force_authenticate(req2, user=superuser)
    resp2 = LoadProductSpecView.as_view()(req2)
    assert resp2.status_code == 200
    cell = resp2.data['data']['snapshot']['sheets']['s1']['cellData']['1']['1']
    assert cell['v'] == '巨子生物'  # 超管不遮罩
    schema_fields = resp2.data['data']['templateSchema']['fields']
    assert [field['key'] for field in schema_fields][-3:] == ['icon', 'remark', 'remarks']


@pytest.mark.django_db
def test_submit_rejects_empty_snapshot(factory, superuser):
    req = factory.post('/save_spec/', {
        'name': '空表提交', 'shop': '测试店铺', 'status': 'submitted',
        'templateType': 'main_image', 'products': _valid_products(), 'snapshot': None,
    }, format='json')
    force_authenticate(req, user=superuser)
    response = SaveProductSpecView.as_view()(req)
    assert response.status_code == 400
    assert '表格无内容' in response.data['msg']
