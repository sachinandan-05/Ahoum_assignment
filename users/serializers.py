from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
from .utils import generate_otp, send_otp_email
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

class SignupSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'role']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        role = validated_data['role']

        # Generate a dummy username since it's required by default User model
        username = email  # Using email as username since it's unique enough for now, or could use uuid

        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Create OTP
        otp = generate_otp()

        # Create Profile
        Profile.objects.create(
            user=user,
            role=role,
            otp=otp,
            otp_created_at=timezone.now()
        )
        
        # Send OTP email
        send_otp_email(email, otp)

        return user

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp = data.get('otp')

        try:
            user = User.objects.get(email=email)
            profile = user.profile
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or OTP.")

        if profile.is_verified:
            raise serializers.ValidationError("User is already verified.")

        if profile.otp != otp:
             raise serializers.ValidationError("Invalid OTP.")
        
        # Check expiry using settings
        otp_expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 5)
        if profile.otp_created_at and (timezone.now() - profile.otp_created_at > timedelta(minutes=otp_expiry_minutes)):
             raise serializers.ValidationError("OTP has expired.")

        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        user.profile.is_verified = True
        user.profile.otp = None # Clear OTP
        user.profile.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password) # Since we set username=email
        
        # If username was random, we might need to find user by email first
        if not user:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
             raise serializers.ValidationError("Invalid credentials.")

        if not hasattr(user, 'profile'):
             raise serializers.ValidationError("User profile missing.")

        if not user.profile.is_verified:
             raise serializers.ValidationError("User is not verified.")

        self.user = user
        return data


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get('email')

        try:
            user = User.objects.get(email=email)
            profile = user.profile
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")

        if profile.is_verified:
            raise serializers.ValidationError("User is already verified.")

        data['user'] = user
        return data

    def save(self):
        user = self.validated_data['user']
        profile = user.profile
        
        # Generate new OTP
        otp = generate_otp()
        profile.otp = otp
        profile.otp_created_at = timezone.now()
        profile.save()
        
        # Send OTP email
        send_otp_email(user.email, otp)
        
        return user
