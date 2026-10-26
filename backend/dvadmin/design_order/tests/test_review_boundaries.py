"""Actual API regressions for review boundaries; always run with e2e settings."""
import json
from copy import deepcopy

from django.test import TestCase
from rest_framework.test import APIClient

from dvadmin.design_order.models import ProductSpec, ProductSpecSubmission, ProductSpecShare, UserPlatformPermission
from dvadmin.design_order.template_models import ProductSpecTemplate
from dvadmin.system.models import Menu, MenuButton, MenuField, FieldPermission, Role, RoleMenuButtonPermission, Users


class ReviewBoundaryTests(TestCase):
    def setUp(self):
        self.user = Users.objects.create(username="review-user", is_active=True)
        self.role = Role.objects.create(name="review", key="review")
        self.user.role.add(self.role)
        UserPlatformPermission.objects.create(user=self.user, platform="京东", scope="self")
        self.menu = Menu.objects.create(name="review-menu")
        for action, api, method in (
            ("Search", "/api/design_order/product_spec_submissions/", 0),
            ("Create", "/api/design_order/product_spec_submissions/", 1),
            ("View", "/api/design_order/product_spec_submissions/{id}/", 0),
            ("Update", "/api/design_order/product_spec_submissions/{id}/", 2),
            ("Delete", "/api/design_order/product_spec_submissions/{id}/", 3),
            ("MultipleDelete", "/api/design_order/product_spec_submissions/multiple_delete/", 3),
        ):
            button = MenuButton.objects.create(menu=self.menu, name=action, value=f"design_order:product_spec_submission:{action}", api=api, method=method)
            RoleMenuButtonPermission.objects.create(role=self.role, menu_button=button, data_range=3)
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.snapshot = {"sheets": {"sheet1": {"cellData": {"4": {"1": {"v": "secret-value", "p": {"body": {"dataStream": "secret-rich"}}, "f": '=SECRET("secret-formula")', "s": "style1"}}}}}}

    def deny(self, field, **flags):
        row = MenuField.objects.create(menu=self.menu, model="ProductSpec", field_name=field, title=field)
        FieldPermission.objects.create(role=self.role, field=row, is_query=flags.get("query", False), is_create=flags.get("create", False), is_update=flags.get("update", False))

    def submission(self, **kwargs):
        return ProductSpecSubmission.objects.create(name="existing", shop="shop", creator=self.user, snapshot_data=deepcopy(self.snapshot), **kwargs)

    def save(self, products, submission=None, **kwargs):
        data = {"name": "review", "shop": "shop", "platform": "京东", "templateType": "main_image", "status": "draft", "products": products, "snapshot": deepcopy(self.snapshot), **kwargs}
        if submission: data["id"] = submission.pk
        return self.client.post('/api/design_order/product_archives/save_spec/', data, format='json')

    def test_actual_snapshot_apis_scrub_richtext_and_formulas(self):
        self.deny("efficacy")
        submission = self.submission()
        share = ProductSpecShare.objects.create(submission=submission)
        for path in (f'/api/design_order/product_spec_submissions/{submission.pk}/', f'/api/design_order/product_archives/load_spec/?id={submission.pk}', f'/api/design_order/product_spec_shares/{share.share_code}/'):
            response = self.client.get(path)
            self.assertEqual(response.data['code'], 2000, response.data)
            payload = json.dumps(response.data, ensure_ascii=False)
            for secret in ('secret-value', 'secret-rich', 'secret-formula'):
                self.assertNotIn(secret, payload, path)
        anonymous = APIClient().get(f'/api/design_order/product_spec_shares/{share.share_code}/')
        self.assertIn('secret-rich', json.dumps(anonymous.data))

    def test_denied_update_preserves_structured_legacy_and_snapshot_values(self):
        self.deny('efficacy', query=True)
        submission = self.submission()
        ProductSpec.objects.create(submission=submission, card_index=0, nickname='product', efficacy='old', spec_data={'efficacy': 'old', 'efficacyItems': [{'name': 'old-item'}]})
        response = self.save([{'cardIndex': 0, 'nickname': 'product', 'efficacy': 'forged', 'specData': {'efficacy': 'forged', 'efficacyItems': [{'name': 'forged-item'}]}}], submission)
        self.assertEqual(response.data['code'], 2000, response.data)
        spec = submission.specs.get()
        self.assertEqual(spec.efficacy, 'old')
        self.assertEqual(spec.spec_data['efficacyItems'], [{'name': 'old-item'}])
        submission.refresh_from_db()
        self.assertEqual(submission.snapshot_data, self.snapshot)

    def test_ordinary_crud_cannot_write_snapshot_or_submit(self):
        for data in ({'name': 'bypass', 'status': 'submitted'}, {'name': 'bypass', 'snapshot_data': self.snapshot}):
            response = self.client.post('/api/design_order/product_spec_submissions/', data, format='json')
            self.assertNotEqual(response.data['code'], 2000, response.data)


    def test_denied_create_drops_flat_dynamic_and_snapshot_secrets(self):
        self.deny('efficacy', query=True)
        response = self.save([{'nickname': 'product', 'efficacy': 'forged', 'specData': {'efficacy': 'forged', 'efficacyItems': [{'name': 'forged-item'}]}}])
        self.assertEqual(response.data['code'], 2000, response.data)
        submission = ProductSpecSubmission.objects.get(pk=response.data['data']['id'])
        self.assertEqual(submission.specs.get().efficacy, '')
        payload = json.dumps({'spec': submission.specs.get().spec_data, 'snapshot': submission.snapshot_data})
        for secret in ('forged', 'secret-value', 'secret-rich', 'secret-formula'):
            self.assertNotIn(secret, payload)

    def test_denied_update_restores_forged_and_omitted_snapshot_cells(self):
        self.deny('efficacy', query=True)
        submission = self.submission()
        ProductSpec.objects.create(submission=submission, card_index=0, nickname='product', efficacy='old', spec_data={'efficacy': 'old'})
        for snapshot in ({'sheets': {'sheet1': {'cellData': {'4': {'1': {'v': 'forged', 'p': {'secret': 'forged'}}}}}}}, {'sheets': {'sheet1': {'cellData': {}}}}):
            response = self.save([{'cardIndex': 0, 'nickname': 'product', 'specData': {'efficacy': 'forged'}}], submission, snapshot=snapshot)
            self.assertEqual(response.data['code'], 2000, response.data)
            submission.refresh_from_db()
            self.assertEqual(submission.snapshot_data['sheets']['sheet1']['cellData']['4']['1'], self.snapshot['sheets']['sheet1']['cellData']['4']['1'])

    def test_denied_update_keeps_omitted_card_values_and_snapshot(self):
        self.deny('efficacy', query=True)
        submission = self.submission()
        ProductSpec.objects.create(submission=submission, card_index=0, nickname='product', gifts='old gift', efficacy='old', spec_data={'efficacy': 'old'})
        response = self.save([], submission, snapshot={'sheets': {'sheet1': {'cellData': {}}}})
        self.assertEqual(response.data['code'], 2000, response.data)
        self.assertEqual(submission.specs.get().efficacy, 'old')
        self.assertEqual(submission.specs.get().gifts, 'old gift')

    def test_metadata_update_cannot_write_snapshot_or_submit(self):
        submission = self.submission()
        for payload in ({'name': 'bad', 'status': 'submitted'}, {'name': 'bad', 'snapshot_data': {'sheets': {}}}):
            response = self.client.put(f'/api/design_order/product_spec_submissions/{submission.pk}/', payload, format='json')
            self.assertNotEqual(response.data['code'], 2000)
        submission.refresh_from_db()
        self.assertEqual(submission.status, 'draft')
        self.assertEqual(submission.snapshot_data, self.snapshot)

    def test_submitted_state_cannot_be_reopened_or_deleted_by_any_mutation(self):
        submission = self.submission(status='submitted')
        responses = [self.save([{'nickname': 'product'}], submission),
                     self.client.put(f'/api/design_order/product_spec_submissions/{submission.pk}/', {'name': 'bad', 'status': 'draft'}, format='json'),
                     self.client.delete(f'/api/design_order/product_spec_submissions/{submission.pk}/'),
                     self.client.delete('/api/design_order/product_spec_submissions/multiple_delete/', {'keys': [submission.pk]}, format='json')]
        for response in responses:
            self.assertNotEqual(response.data['code'], 2000, response.data)
        submission.refresh_from_db()
        self.assertEqual(submission.status, 'submitted')

    def test_rename_keeps_historical_template_after_active_template_changes(self):
        submission = self.submission()
        template = ProductSpecTemplate.objects.get(template_code='main_image')
        template.status = False
        template.save()
        template.pk = None
        template.template_code = 'new-main-image'
        template.template_name = 'new-active-template'
        template.status = True
        template.save()
        response = self.client.put(f'/api/design_order/product_spec_submissions/{submission.pk}/', {'name': 'renamed', 'shop': 'shop', 'platform': '京东'}, format='json')
        self.assertEqual(response.data['code'], 2000, response.data)
        submission.refresh_from_db()
        self.assertEqual(submission.template_type, 'main_image')
        self.assertEqual(submission.snapshot_data, self.snapshot)

    def customize_template(self, fields, validation=None):
        template = ProductSpecTemplate.objects.get(template_code='main_image')
        template.fields = [*template.fields, *fields]
        template.rows_per_block += len(fields)
        if validation is not None: template.validation = validation
        template.save()

    def test_custom_required_and_price_validate_spec_data(self):
        self.customize_template([
            {'row': 13, 'key': 'customNeed', 'label': 'required', 'kind': 'text'},
            {'row': 14, 'key': 'customPrice', 'label': 'price', 'kind': 'price'},
        ], {'requiredProductFields': ['customNeed', 'customPrice'], 'priceFieldKey': 'customPrice'})
        good = self.save([{'specData': {'nickname': 'product', 'customNeed': 'yes', 'customPrice': '1,200.50'}}], status='submitted')
        self.assertEqual(good.data['code'], 2000, good.data)
        for dynamic, required in (({'nickname': 'product'}, {'customNeed', 'customPrice'}), ({'nickname': 'product', 'customNeed': 'yes', 'customPrice': 'abc199'}, {'customPrice'})):
            response = self.save([{'specData': dynamic}], status='submitted')
            self.assertNotEqual(response.data['code'], 2000)
            self.assertTrue(required <= {error['field'] for error in response.data['data']['errors']})

    def test_custom_date_ranges_stay_independent_of_legacy_standard_dates(self):
        self.customize_template([
            {'row': 13, 'key': 'rangeA', 'label': 'A', 'kind': 'dateRange'},
            {'row': 14, 'key': 'rangeB', 'label': 'B', 'kind': 'dateRange'},
        ])
        ranges = {'rangeA': {'startDate': '2026-01-01', 'endDate': '2026-01-02'}, 'rangeB': {'startDate': '2026-02-01', 'endDate': '2026-02-02'}}
        response = self.save([{'nickname': 'product', 'startDate': 'legacy-start', 'endDate': 'legacy-end', 'specData': ranges}])
        self.assertEqual(response.data['code'], 2000, response.data)
        spec = ProductSpec.objects.get(submission_id=response.data['data']['id'])
        self.assertEqual(spec.spec_data['rangeA'], ranges['rangeA'])
        self.assertEqual(spec.spec_data['rangeB'], ranges['rangeB'])
        self.assertEqual(spec.spec_data['dateRange'], {'startDate': 'legacy-start', 'endDate': 'legacy-end'})

    def test_submission_requires_valid_products_and_only_counts_valid_details(self):
        bad = self.save([{}], status='submitted')
        self.assertNotEqual(bad.data['code'], 2000)
        self.assertEqual(ProductSpecSubmission.objects.count(), 0)
        good = self.save([{}, {'nickname': 'valid', 'brand': 'brand', 'fullName': 'name'}], status='submitted')
        self.assertEqual(good.data['code'], 2000, good.data)
        submission = ProductSpecSubmission.objects.get(pk=good.data['data']['id'])
        self.assertEqual(submission.product_count, 1)
        self.assertEqual(submission.specs.count(), 1)
        empty = self.save([])
        self.assertEqual(empty.data['code'], 2000)


class IconReviewBoundaryTests(TestCase):
    def setUp(self):
        from dvadmin.design_order.icon_models import IconDefinition, IconProductRelation
        from dvadmin.design_order.models import ProductArchive
        self.Icon = IconDefinition
        self.Link = IconProductRelation
        self.product = ProductArchive.objects.create(product_code='P-A', product_name='A', brand='A')
        self.other = ProductArchive.objects.create(product_code='P-B', product_name='B', brand='B')
        self.client = APIClient()
        self.client.force_authenticate(Users.objects.create(username='icon-admin', is_superuser=True))

    def icon(self, name, **kwargs):
        return self.Icon.objects.create(short_name=name, brand=kwargs.pop('brand', 'A'), **kwargs)

    def test_batch_status_cannot_resurrect_deleted_or_mix_invalid_targets(self):
        deleted = self.icon('deleted', status='deleted')
        enabled = self.icon('valid')
        for ids in ([deleted.pk], [enabled.pk, deleted.pk], [enabled.pk, 999999], ['bad']):
            response = self.client.post('/api/design_order/icons/batch-change-status/', {'ids': ids, 'status': 'disabled'}, format='json')
            self.assertNotEqual(response.data['code'], 2000)
        deleted.refresh_from_db()
        enabled.refresh_from_db()
        self.assertEqual(deleted.status, 'deleted')
        self.assertEqual(enabled.status, 'enabled')
        response = self.client.post('/api/design_order/icons/batch-change-status/', {'ids': [enabled.pk, enabled.pk], 'status': 'disabled'}, format='json')
        self.assertEqual(response.data['data']['updated'], 1)

    def test_resolve_by_products_actual_api_returns_exact_id_sets(self):
        all_a = self.icon('all-a', scope_type='all')
        linked_a = self.icon('linked-a')
        self.Link.objects.create(icon=linked_a, product=self.product)
        self.icon('unlinked')
        disabled = self.icon('disabled', status='disabled')
        deleted = self.icon('deleted', status='deleted')
        for icon in (disabled, deleted): self.Link.objects.create(icon=icon, product=self.product)
        self.icon('other-all', brand='B', scope_type='all')
        wrong_brand = self.icon('wrong-link', brand='B')
        self.Link.objects.create(icon=wrong_brand, product=self.product)
        response = self.client.post('/api/design_order/icons/resolve-by-products/', {'product_codes': ['P-A', 'P-B']}, format='json')
        self.assertEqual(response.data['code'], 2000, response.data)
        rows = {item['product_code']: {icon['id'] for icon in item['icons']} for item in response.data['data']['items']}
        self.assertEqual(rows['P-A'], {all_a.pk, linked_a.pk})
