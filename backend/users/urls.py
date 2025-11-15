"""
URL patterns for user authentication and profile management.
"""
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    user_stats,
)

urlpatterns = [
    # Authentication
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('refresh', RefreshTokenView.as_view(), name='token_refresh'),
    path('logout', LogoutView.as_view(), name='logout'),

    # Profile
    path('profile', ProfileView.as_view(), name='profile'),
    path('change-password', ChangePasswordView.as_view(), name='change_password'),
    path('stats', user_stats, name='user_stats'),
]
