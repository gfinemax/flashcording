"""
Views for gamification functionality.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from datetime import datetime, timedelta

from .models import Badge, UserBadge, Activity, Streak, Leaderboard, Reward, UserReward
from .serializers import (
    BadgeSerializer,
    UserBadgeSerializer,
    ActivitySerializer,
    CreateActivitySerializer,
    StreakSerializer,
    LeaderboardEntrySerializer,
    RewardSerializer,
    UserRewardSerializer,
    RedeemRewardSerializer,
    GamificationProfileSerializer,
)
from users.models import User


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def gamification_profile(request):
    """Get user's gamification profile."""
    user = request.user

    # Get user badges
    badges = UserBadge.objects.filter(user=user).select_related('badge')

    # Get or create streak
    streak, created = Streak.objects.get_or_create(user=user)

    # Get recent activities
    recent_activities = Activity.objects.filter(user=user).order_by('-created_at')[:10]

    # Get total activities count
    total_activities = Activity.objects.filter(user=user).count()

    profile_data = {
        'user': user,
        'badges': badges,
        'streak': streak,
        'total_activities': total_activities,
        'recent_activities': recent_activities,
    }

    return Response(GamificationProfileSerializer(profile_data).data)


class BadgeListView(generics.ListAPIView):
    """List all available badges."""

    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Badge.objects.filter(is_active=True).order_by('rarity', 'name')

    def get(self, request, *args, **kwargs):
        """Get all badges with user's progress."""
        response = super().get(request, *args, **kwargs)

        # Add user's earned badges
        user_badges = UserBadge.objects.filter(user=request.user).values_list('badge_id', flat=True)

        for badge_data in response.data:
            badge_data['earned'] = badge_data['id'] in user_badges

        return response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_badges(request):
    """Get user's earned badges."""
    badges = UserBadge.objects.filter(user=request.user).select_related('badge').order_by('-earned_at')

    return Response({
        'badges': UserBadgeSerializer(badges, many=True).data,
        'total_count': badges.count(),
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def record_activity(request):
    """Record a new activity."""
    serializer = CreateActivitySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Create activity
    activity = Activity.objects.create(
        user=request.user,
        **serializer.validated_data
    )

    # Award XP if any
    exp_gained = serializer.validated_data.get('exp_gained', 0)
    if exp_gained > 0:
        leveled_up = request.user.add_exp(exp_gained)

        if leveled_up:
            # Record level up activity
            Activity.objects.create(
                user=request.user,
                event_type='level_up',
                description=f'Reached level {request.user.level}!',
                exp_gained=0
            )

    # Update streak
    streak, created = Streak.objects.get_or_create(user=request.user)
    streak_updated = streak.check_and_update()

    # Check for badge unlocks
    check_and_award_badges(request.user)

    return Response({
        'activity': ActivitySerializer(activity).data,
        'user_level': request.user.level,
        'user_exp': request.user.exp,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_feed(request):
    """Get user's activity feed."""
    # Get query parameters
    limit = int(request.query_params.get('limit', 20))
    offset = int(request.query_params.get('offset', 0))
    event_type = request.query_params.get('event_type')

    # Build query
    activities = Activity.objects.filter(user=request.user)

    if event_type:
        activities = activities.filter(event_type=event_type)

    activities = activities.order_by('-created_at')[offset:offset + limit]

    return Response({
        'activities': ActivitySerializer(activities, many=True).data,
        'total_count': Activity.objects.filter(user=request.user).count(),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """Get leaderboard rankings."""
    period = request.query_params.get('period', 'all_time')

    if period not in ['all_time', 'monthly', 'weekly']:
        return Response({
            'error': 'Invalid period. Must be one of: all_time, monthly, weekly'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Get top users by total_exp
    if period == 'all_time':
        top_users = User.objects.filter(is_active=True).order_by('-total_exp')[:100]

        leaderboard_data = []
        for rank, user in enumerate(top_users, start=1):
            leaderboard_data.append({
                'rank': rank,
                'user_id': user.id,
                'username': user.username,
                'avatar': user.avatar,
                'level': user.level,
                'exp': user.exp,
                'score': user.total_exp,
            })

    else:
        # For monthly/weekly, use Leaderboard model
        now = datetime.now().date()

        if period == 'weekly':
            period_start = now - timedelta(days=now.weekday())
        else:  # monthly
            period_start = now.replace(day=1)

        entries = Leaderboard.objects.filter(
            period=period,
            period_start=period_start
        ).select_related('user').order_by('rank')[:100]

        leaderboard_data = []
        for entry in entries:
            leaderboard_data.append({
                'rank': entry.rank,
                'user_id': entry.user.id,
                'username': entry.user.username,
                'avatar': entry.user.avatar,
                'level': entry.user.level,
                'exp': entry.user.exp,
                'score': entry.score,
            })

    # Find current user's rank
    user_rank = None
    for entry in leaderboard_data:
        if entry['user_id'] == request.user.id:
            user_rank = entry
            break

    return Response({
        'period': period,
        'leaderboard': leaderboard_data,
        'user_rank': user_rank,
    })


class RewardListView(generics.ListAPIView):
    """List available rewards."""

    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reward.objects.filter(is_active=True).order_by('cost', 'name')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def redeem_reward(request):
    """Redeem a reward."""
    serializer = RedeemRewardSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    reward = get_object_or_404(Reward, id=serializer.validated_data['reward_id'])

    # Check if user has enough XP
    if request.user.total_exp < reward.cost:
        return Response({
            'error': f'Insufficient XP. You need {reward.cost} XP but have {request.user.total_exp} XP.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check stock
    if reward.stock == 0:
        return Response({
            'error': 'This reward is out of stock.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Deduct XP
    request.user.total_exp -= reward.cost
    request.user.save()

    # Decrease stock if limited
    if reward.stock > 0:
        reward.stock -= 1
        reward.save()

    # Create user reward
    user_reward = UserReward.objects.create(
        user=request.user,
        reward=reward
    )

    # Record activity
    Activity.objects.create(
        user=request.user,
        event_type='reward_redeemed',
        description=f'Redeemed reward: {reward.name}',
        exp_gained=0,
        metadata={'reward_id': reward.id, 'cost': reward.cost}
    )

    return Response({
        'user_reward': UserRewardSerializer(user_reward).data,
        'remaining_exp': request.user.total_exp,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_rewards(request):
    """Get user's redeemed rewards."""
    rewards = UserReward.objects.filter(user=request.user).select_related('reward').order_by('-redeemed_at')

    return Response({
        'rewards': UserRewardSerializer(rewards, many=True).data,
    })


def check_and_award_badges(user):
    """Check and award badges based on user's achievements."""
    from quiz.models import QuizSession

    # Get all active badges
    badges = Badge.objects.filter(is_active=True)

    for badge in badges:
        # Skip if user already has this badge
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            continue

        # Check criteria
        should_award = False

        if badge.criteria_type == 'quiz_complete':
            completed_count = QuizSession.objects.filter(
                user=user,
                status='completed'
            ).count()
            should_award = completed_count >= badge.criteria_value

        elif badge.criteria_type == 'level_reach':
            should_award = user.level >= badge.criteria_value

        elif badge.criteria_type == 'streak':
            streak = Streak.objects.filter(user=user).first()
            if streak:
                should_award = streak.current_streak >= badge.criteria_value

        elif badge.criteria_type == 'exp_earn':
            should_award = user.total_exp >= badge.criteria_value

        # Award badge if criteria met
        if should_award:
            UserBadge.objects.create(user=user, badge=badge)

            # Award XP
            user.add_exp(badge.exp_reward)

            # Record activity
            Activity.objects.create(
                user=user,
                event_type='badge_earned',
                description=f'Earned badge: {badge.name}',
                exp_gained=badge.exp_reward,
                badge=badge
            )
