"""
Custom authentication backend for email-based authentication.
"""
from django.contrib.auth.backends import ModelBackend
from .models import User


class EmailBackend(ModelBackend):
    """
    Authenticate using email instead of username.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        """
        Authenticate user with email and password.
        """
        if email is None or password is None:
            return None

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            User().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None

    def get_user(self, user_id):
        """
        Get user by ID.
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
