from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from dvadmin.design_order.store_models import DesignOrderStore
from dvadmin.design_order.store_views import DesignOrderStoreViewSet


User = get_user_model()


class DesignOrderStoreViewSetTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.superuser = User.objects.create(
            username="store_admin",
            is_superuser=True,
            is_staff=True,
            is_active=True,
        )

    @staticmethod
    def store_payload(**overrides):
        payload = {
            "store_code": "TM-KFM-001",
            "store_name": "可复美天猫旗舰店",
            "store_type": "运营",
            "brand": "可复美",
            "platform": "天猫",
            "department": "电商运营部",
            "owner_name": "张敏",
            "status": True,
        }
        return {**payload, **overrides}

    def call_view(self, method, path, data=None, action=None, pk=None):
        request = getattr(self.factory, method)(path, data=data, format="json")
        force_authenticate(request, user=self.superuser)
        view = DesignOrderStoreViewSet.as_view(action)
        kwargs = {"pk": pk} if pk is not None else {}
        return view(request, **kwargs)

    def test_store_crud_rejects_duplicate_code(self):
        create_action = {"post": "create"}
        first = self.call_view(
            "post",
            "/stores/",
            self.store_payload(),
            create_action,
        )
        duplicate = self.call_view(
            "post",
            "/stores/",
            self.store_payload(store_name="重复店铺"),
            create_action,
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(duplicate.status_code, 200)
        self.assertEqual(duplicate.data["code"], 4000)
        self.assertEqual(DesignOrderStore.objects.count(), 1)

    def test_store_create_does_not_require_department(self):
        payload = self.store_payload()
        payload.pop("department")

        response = self.call_view(
            "post",
            "/stores/",
            payload,
            {"post": "create"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["code"], 2000)
        self.assertEqual(
            DesignOrderStore.objects.get(store_code="TM-KFM-001").department,
            "",
        )

    def test_store_list_supports_keyword_and_filters(self):
        DesignOrderStore.objects.create(**self.store_payload())
        DesignOrderStore.objects.create(
            **self.store_payload(
                store_code="DY-KLJ-002",
                store_name="可丽金抖音达人店",
                store_type="达播",
                brand="可丽金",
                platform="抖音",
                department="内容电商部",
                owner_name="李悦",
            )
        )

        response = self.call_view(
            "get",
            "/stores/?search=李悦&store_type=达播&brand=可丽金&platform=抖音&department=内容电商部",
            action={"get": "list"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["data"][0]["store_code"], "DY-KLJ-002")

    def test_store_status_controls_deletion(self):
        store = DesignOrderStore.objects.create(**self.store_payload())

        blocked = self.call_view(
            "delete",
            f"/stores/{store.id}/",
            action={"delete": "destroy"},
            pk=store.id,
        )
        disabled = self.call_view(
            "post",
            f"/stores/{store.id}/set_status/",
            {"status": False},
            {"post": "set_status"},
            store.id,
        )
        deleted = self.call_view(
            "delete",
            f"/stores/{store.id}/",
            action={"delete": "destroy"},
            pk=store.id,
        )

        self.assertEqual(blocked.status_code, 400)
        self.assertEqual(
            blocked.data["msg"],
            "店铺“可复美天猫旗舰店”当前处于启用状态，不能删除，请先禁用后再删除",
        )
        self.assertEqual(disabled.status_code, 200)
        self.assertIs(disabled.data["data"]["status"], False)
        self.assertEqual(deleted.status_code, 200)
        self.assertFalse(DesignOrderStore.objects.filter(id=store.id).exists())
