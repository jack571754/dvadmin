# -*- coding: utf-8 -*-
"""i18n integration tests — INT-03 verification."""
import pytest
from rest_framework import status


@pytest.mark.django_db
class TestLoginI18n:
    """Verify login error messages are returned in the correct language (INT-03).

    The integration chain tested:
    Accept-Language header -> LocaleMiddleware -> translation.activate() ->
    CustomValidationError -> CustomExceptionHandler -> ErrorResponse

    We test the "account does not exist" error path (login.py lines 93-96) because:
    - No user creation required (reduces test complexity)
    - No risk of account lockout (login_error_count only increments on wrong password)
    - Full translation chain is exercised (LocaleMiddleware activates locale before error)
    """

    def test_login_error_english(self, en_api_client):
        """Wrong credentials (non-existent user) returns English error when Accept-Language: en is sent."""
        response = en_api_client.post(
            "/api/login/",
            {"username": "nonexistent_user_12345", "password": "wrong_password"},
            format="json",
        )
        # ErrorResponse returns HTTP 200 with code=400 in body (project design)
        assert response.json()["code"] == 4000
        # "The account you are logging in with does not exist" (from locale/en/LC_MESSAGES/django.po)
        assert "account you are logging in with does not exist" in response.json()["msg"]

    def test_login_error_chinese(self, zh_api_client):
        """Wrong credentials (non-existent user) returns Chinese error when Accept-Language: zh-cn is sent."""
        response = zh_api_client.post(
            "/api/login/",
            {"username": "nonexistent_user_12345", "password": "wrong_password"},
            format="json",
        )
        # ErrorResponse returns HTTP 200 with code=400 in body (project design)
        assert response.json()["code"] == 4000
        # "您登录的账号不存在" (from locale/zh_Hans/LC_MESSAGES/django.po)
        assert response.json()["msg"] == "您登录的账号不存在"
