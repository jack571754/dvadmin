"""Regression tests use Django's disposable test database, never the working DB."""
from types import SimpleNamespace
from django.test import TestCase
from dvadmin.system.models import Dept, Post, Users
from dvadmin.system.views.user import UserUpdateSerializer
from dvadmin.system.models import Menu, Role, MenuButton, RoleMenuButtonPermission
from rest_framework.test import APIClient


class UserRelationParityTests(TestCase):
    def setUp(self):
        self.dept = Dept.objects.create(name='parity root', key='parity-root')
        self.other = Dept.objects.create(name='parity other', key='parity-other')
        self.admin = Users.objects.create(username='parity_admin', is_superuser=True, dept=self.dept)
        self.user = Users.objects.create(username='parity_user', dept=self.dept)
        self.post = Post.objects.create(name='parity post', code='parity-post')
        self.user.post.set([self.post])
        self.user.manage_dept.set([self.other])

    def update(self, **data):
        serializer = UserUpdateSerializer(self.user, data={'username': self.user.username, 'name': 'parity user', **data},
                                          request=SimpleNamespace(user=self.admin))
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def test_edit_and_status_updates_preserve_omitted_relations(self):
        self.update(name='changed')
        self.assertEqual(list(self.user.post.values_list('id', flat=True)), [self.post.id])

        self.assertEqual(list(self.user.manage_dept.values_list('id', flat=True)), [self.other.id])
        self.update(is_active=False)
        self.assertEqual(list(self.user.post.values_list('id', flat=True)), [self.post.id])

    def test_explicit_empty_relations_clear_without_reinserting_department(self):
        self.update(post=[], manage_dept=[])
        self.assertFalse(self.user.post.exists())
        self.assertFalse(self.user.manage_dept.exists())

    def test_unknown_post_is_rejected_without_changing_relations(self):
        serializer = UserUpdateSerializer(self.user, data={'username': self.user.username, 'name': 'parity user', 'post': [99999999]},
                                          request=SimpleNamespace(user=self.admin))
        self.assertFalse(serializer.is_valid())
        self.assertEqual(list(self.user.post.values_list('id', flat=True)), [self.post.id])


class MenuOrderingPermissionTests(TestCase):
    def setUp(self):
        self.first = Menu.objects.create(name='first', sort=1)
        self.second = Menu.objects.create(name='second', sort=2)
        self.reader = Users.objects.create(username='ordering_reader')
        self.admin = Users.objects.create(username='ordering_admin', is_superuser=True)
        self.client = APIClient()

    def test_anonymous_and_reader_cannot_reorder(self):
        for user in [None, self.reader]:
            self.client.force_authenticate(user=user)
            for action in ['move_up', 'move_down']:
                result = self.client.post(f'/api/system/menu/{action}/', {'menu_id': self.second.id}, format='json')
                self.assertNotEqual(result.json().get('code'), 2000)
            self.first.refresh_from_db(); self.second.refresh_from_db()
            self.assertEqual((self.first.sort, self.second.sort), (1, 2))

    def test_specific_move_permission_and_superuser_still_work(self):
        role = Role.objects.create(name='ordering editor', key='ordering-editor')
        self.reader.role.add(role)
        button = MenuButton.objects.create(menu=self.first, name='up', value='menu:MoveUp',
                                           api='/api/system/menu/move_up/', method=1)
        RoleMenuButtonPermission.objects.create(role=role, menu_button=button)
        self.client.force_authenticate(user=self.reader)
        self.assertEqual(self.client.post('/api/system/menu/move_up/', {'menu_id': self.second.id}, format='json').json()['code'], 2000)
        self.second.refresh_from_db(); self.assertEqual(self.second.sort, 1)
        self.client.force_authenticate(user=self.admin)
        self.assertEqual(self.client.post('/api/system/menu/move_down/', {'menu_id': self.second.id}, format='json').json()['code'], 2000)
        self.second.refresh_from_db(); self.assertEqual(self.second.sort, 2)
