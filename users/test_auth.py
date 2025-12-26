import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from users.models import Profile
from django.utils import timezone

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


@pytest.mark.django_db
class TestPasswordReset:
    def setup_method(self):
        self.client = APIClient()
        self.password_reset_url = reverse('password-reset')
        self.password_reset_confirm_url = reverse('password-reset-confirm')

    def test_password_reset_request(self):
        """Test requesting password reset OTP"""
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='password123')
        Profile.objects.create(user=user, role='SEEKER', is_verified=True)

        data = {"email": "test@test.com"}
        response = self.client.post(self.password_reset_url, data)
        assert response.status_code == status.HTTP_200_OK
        
        # Check OTP was generated
        user.refresh_from_db()
        assert user.profile.otp is not None

    def test_password_reset_request_nonexistent_email(self):
        """Test password reset with non-existent email returns success (security)"""
        data = {"email": "nonexistent@test.com"}
        response = self.client.post(self.password_reset_url, data)
        # Should return success to prevent email enumeration
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_confirm(self):
        """Test confirming password reset with OTP"""
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='oldpassword')
        Profile.objects.create(
            user=user, role='SEEKER', is_verified=True, 
            otp='123456', otp_created_at=timezone.now()
        )

        data = {
            "email": "test@test.com",
            "otp": "123456",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123"
        }
        response = self.client.post(self.password_reset_confirm_url, data)
        assert response.status_code == status.HTTP_200_OK
        
        # Check password was changed
        user.refresh_from_db()
        assert user.check_password("newpassword123")
        # Check OTP was cleared
        assert user.profile.otp is None

    def test_password_reset_confirm_invalid_otp(self):
        """Test password reset with invalid OTP fails"""
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='oldpassword')
        Profile.objects.create(
            user=user, role='SEEKER', is_verified=True, 
            otp='123456', otp_created_at=timezone.now()
        )

        data = {
            "email": "test@test.com",
            "otp": "wrong123",
            "new_password": "newpassword123",
            "confirm_password": "newpassword123"
        }
        response = self.client.post(self.password_reset_confirm_url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_confirm_passwords_dont_match(self):
        """Test password reset with mismatched passwords fails"""
        user = User.objects.create_user(username='test@test.com', email='test@test.com', password='oldpassword')
        Profile.objects.create(
            user=user, role='SEEKER', is_verified=True, 
            otp='123456', otp_created_at=timezone.now()
        )

        data = {
            "email": "test@test.com",
            "otp": "123456",
            "new_password": "newpassword123",
            "confirm_password": "differentpassword"
        }
        response = self.client.post(self.password_reset_confirm_url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
