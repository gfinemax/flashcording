"""
Serializers for user authentication and profile management.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User, RefreshToken
from datetime import timedelta
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    level_progress = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'avatar', 'bio',
            'level', 'exp', 'total_exp', 'level_progress',
            'provider', 'created_at', 'last_login'
        ]
        read_only_fields = ['id', 'level', 'exp', 'total_exp', 'created_at', 'last_login']

    def get_level_progress(self, obj):
        """Get level progress information."""
        return obj.get_level_progress()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'avatar']

    def validate(self, data):
        """Validate passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def validate_email(self, value):
        """Validate email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate_username(self, value):
        """Validate username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def create(self, validated_data):
        """Create new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user info."""

    def validate(self, attrs):
        """Validate and return tokens with user info."""
        data = super().validate(attrs)

        # Add user information
        data['user'] = UserSerializer(self.user).data

        # Store refresh token in database
        refresh_token, created = RefreshToken.objects.get_or_create(
            user=self.user,
            token=data['refresh'],
            defaults={
                'expires_at': timezone.now() + timedelta(days=7)
            }
        )

        return data

    @classmethod
    def get_token(cls, user):
        """Customize token claims."""
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['username'] = user.username
        token['level'] = user.level

        return token


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Validate credentials and return user."""
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid email or password.')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            data['user'] = user
            return data
        else:
            raise serializers.ValidationError('Must include email and password.')


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        """Validate passwords."""
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return data

    def validate_old_password(self, value):
        """Validate old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['username', 'avatar', 'bio']

    def validate_username(self, value):
        """Validate username is unique."""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value
