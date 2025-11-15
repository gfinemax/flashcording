"""
User models for authentication and profile management.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import math


class UserManager(BaseUserManager):
    """Custom user manager."""

    def create_user(self, email, username, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with gamification features."""

    # Authentication fields
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(unique=True, max_length=150)

    # Profile fields
    avatar = models.CharField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Gamification fields
    level = models.IntegerField(default=1)
    exp = models.IntegerField(default=0)
    total_exp = models.IntegerField(default=0)

    # OAuth provider
    provider = models.CharField(max_length=50, blank=True, null=True)  # 'google', 'github', etc.
    provider_id = models.CharField(max_length=255, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Permissions
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def add_exp(self, amount):
        """Add experience points and handle level up."""
        from django.conf import settings

        self.exp += amount
        self.total_exp += amount

        # Calculate level based on total_exp
        xp_per_level = getattr(settings, 'XP_PER_LEVEL', 100)
        xp_multiplier = getattr(settings, 'XP_MULTIPLIER', 1.5)

        # Calculate required XP for next level
        required_xp = xp_per_level
        current_level = 1
        total_xp_needed = 0

        while total_xp_needed <= self.total_exp:
            current_level += 1
            total_xp_needed += required_xp
            required_xp = int(required_xp * xp_multiplier)

        old_level = self.level
        self.level = current_level - 1

        # Calculate XP for current level
        required_xp = xp_per_level
        total_xp_for_level = 0
        for i in range(1, self.level):
            total_xp_for_level += required_xp
            required_xp = int(required_xp * xp_multiplier)

        self.exp = self.total_exp - total_xp_for_level
        self.save()

        return self.level > old_level  # Return True if leveled up

    def get_level_progress(self):
        """Get progress to next level as percentage."""
        from django.conf import settings

        xp_per_level = getattr(settings, 'XP_PER_LEVEL', 100)
        xp_multiplier = getattr(settings, 'XP_MULTIPLIER', 1.5)

        required_xp = xp_per_level * (xp_multiplier ** (self.level - 1))
        progress = (self.exp / required_xp) * 100 if required_xp > 0 else 0

        return {
            'current_exp': self.exp,
            'required_exp': int(required_xp),
            'progress_percentage': min(100, progress)
        }


class RefreshToken(models.Model):
    """Store refresh tokens for JWT authentication."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_blacklisted = models.BooleanField(default=False)

    class Meta:
        db_table = 'refresh_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.token[:20]}..."

    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_blacklisted and self.expires_at > timezone.now()
