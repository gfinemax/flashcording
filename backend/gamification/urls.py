"""
URL patterns for gamification functionality.
"""
from django.urls import path
from .views import (
    gamification_profile,
    BadgeListView,
    user_badges,
    record_activity,
    activity_feed,
    leaderboard,
    RewardListView,
    redeem_reward,
    user_rewards,
)

urlpatterns = [
    # Profile
    path('profile', gamification_profile, name='gamification_profile'),

    # Badges
    path('badges', BadgeListView.as_view(), name='badges'),
    path('user-badges', user_badges, name='user_badges'),

    # Activities
    path('events', record_activity, name='record_activity'),
    path('activities', activity_feed, name='activity_feed'),

    # Leaderboard
    path('leaderboard', leaderboard, name='leaderboard'),

    # Rewards
    path('rewards', RewardListView.as_view(), name='rewards'),
    path('redeem', redeem_reward, name='redeem_reward'),
    path('user-rewards', user_rewards, name='user_rewards'),
]
