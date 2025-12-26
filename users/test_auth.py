import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import Profile

@pytest.mark.django_db
class TestAuth:
    def setup_method(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.verify_url = reverse('verify-email')
        self.login_url = reverse('login')

    def test_signup_seeker(self):
        data = {
            "email": "seeker@test.com",
            "password": "password123",
            "role": "SEEKER"
        }
        response = self.client.post(self.signup_url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.count() == 1
        user = User.objects.first()
        assert user.email == "seeker@test.com"
        assert user.profile.role == "SEEKER"
        assert user.profile.otp is not None
        assert user.profile.is_verified is False

    def test_signup_facilitator(self):
        data = {
            "email": "facilitator@test.com",
            "password": "password123",
            "role": "FACILITATOR"
        }
        response = self.client.post(self.signup_url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.first().profile.role == "FACILITATOR"

    def test_verify_email(self):
        # Create user manually to control OTP
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='password123')
        Profile.objects.create(user=user, role='SEEKER', otp='123456', is_verified=False)

        data = {
            "email": "test@test.com",
            "otp": "123456"
        }
        response = self.client.post(self.verify_url, data)
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.profile.is_verified is True
        assert user.profile.otp is None # Should be cleared

    def test_login_success(self):
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='password123')
        Profile.objects.create(user=user, role='SEEKER', is_verified=True)

        data = {
            "email": "test@test.com",
            "password": "password123"
        }
        response = self.client.post(self.login_url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_unverified_fails(self):
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='password123')
        Profile.objects.create(user=user, role='SEEKER', is_verified=False) # Not verified

        data = {
            "email": "test@test.com",
            "password": "password123"
        }
        response = self.client.post(self.login_url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
