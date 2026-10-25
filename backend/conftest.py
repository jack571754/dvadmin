# -*- coding: utf-8 -*-
"""pytest fixtures for i18n integration tests."""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Unauthenticated API test client with no Accept-Language header."""
    client = APIClient()
    client.credentials(HTTP_USER_AGENT="Mozilla/5.0 (Test) pytest/0.0")
    return client


@pytest.fixture
def en_api_client(api_client):
    """API client sending Accept-Language: en header (maps to locale/en/)."""
    client = APIClient()
    client.credentials(HTTP_ACCEPT_LANGUAGE="en", HTTP_USER_AGENT="Mozilla/5.0 (Test) pytest/0.0")
    return client


@pytest.fixture
def zh_api_client(api_client):
    """API client sending Accept-Language: zh-cn header (maps to locale/zh_Hans/ via zh-hans)."""
    client = APIClient()
    client.credentials(HTTP_ACCEPT_LANGUAGE="zh-cn", HTTP_USER_AGENT="Mozilla/5.0 (Test) pytest/0.0")
    return client


@pytest.fixture
def test_user(db):
    """Create a test user for login i18n testing.

    The user is created fresh per test via pytest's db transaction isolation.
    LOGIN_NO_CAPTCHA_AUTH=True in env.py means no captcha is required.
    """
    from dvadmin.system.models import Users
    user = Users.objects.create_user(
        username="test_i18n_user",
        password="TestPass123",
        name="Test User",
        is_active=True,
    )
    # Ensure no failed login attempts are accumulated
    user.login_error_count = 0
    user.save(update_fields=["login_error_count"])
    yield user
    user.delete()
