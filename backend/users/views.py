"""
Views for user authentication and profile management.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta

from .models import User, RefreshToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    UserUpdateSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create new user and return tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access = refresh.access_token

        # Store refresh token in database
        RefreshToken.objects.create(
            user=user,
            token=str(refresh),
            expires_at=timezone.now() + timedelta(days=7)
        )

        return Response({
            'user': UserSerializer(user).data,
            'access': str(access),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """User login endpoint with custom token serializer."""

    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        """Login user and return tokens."""
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Update last login
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

        return response


class RefreshTokenView(TokenRefreshView):
    """Refresh access token endpoint."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        """Refresh access token."""
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate token exists in database
        try:
            token_obj = RefreshToken.objects.get(token=refresh_token)

            if not token_obj.is_valid():
                return Response({
                    'error': 'Refresh token is invalid or expired.'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except RefreshToken.DoesNotExist:
            return Response({
                'error': 'Refresh token not found.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    """User logout endpoint."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Logout user by blacklisting refresh token."""
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = RefreshToken.objects.get(
                token=refresh_token,
                user=request.user
            )
            token_obj.is_blacklisted = True
            token_obj.save()

            return Response({
                'message': 'Successfully logged out.'
            }, status=status.HTTP_200_OK)

        except RefreshToken.DoesNotExist:
            return Response({
                'error': 'Refresh token not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class ProfileView(APIView):
    """User profile endpoint."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user profile."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update user profile."""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    """Change password endpoint."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Change user password."""
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Update password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Blacklist all existing refresh tokens
        RefreshToken.objects.filter(user=request.user).update(is_blacklisted=True)

        return Response({
            'message': 'Password changed successfully. Please login again.'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics."""
    user = request.user

    # Count user's activities
    from quiz.models import QuizSession
    from gamification.models import UserBadge, Activity

    total_quizzes = QuizSession.objects.filter(user=user, status='completed').count()
    total_badges = UserBadge.objects.filter(user=user).count()
    total_activities = Activity.objects.filter(user=user).count()

    # Get streak info
    from gamification.models import Streak
    streak, created = Streak.objects.get_or_create(user=user)

    return Response({
        'level': user.level,
        'exp': user.exp,
        'total_exp': user.total_exp,
        'level_progress': user.get_level_progress(),
        'stats': {
            'total_quizzes': total_quizzes,
            'total_badges': total_badges,
            'total_activities': total_activities,
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
        }
    })
