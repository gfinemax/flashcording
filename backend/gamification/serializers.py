"""
Serializers for gamification functionality.
"""
from rest_framework import serializers
from .models import Badge, UserBadge, Activity, Streak, Leaderboard, Reward, UserReward
from users.serializers import UserSerializer


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for badges."""

    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'description', 'icon', 'rarity',
            'criteria_type', 'criteria_value', 'exp_reward', 'created_at'
        ]


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for user badges."""

    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for activities."""

    user = serializers.StringRelatedField(read_only=True)
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'user', 'event_type', 'description',
            'exp_gained', 'badge', 'metadata', 'created_at'
        ]


class CreateActivitySerializer(serializers.Serializer):
    """Serializer for creating activities."""

    event_type = serializers.ChoiceField(choices=Activity.EVENT_TYPE_CHOICES)
    description = serializers.CharField(max_length=500)
    exp_gained = serializers.IntegerField(default=0, min_value=0)
    metadata = serializers.JSONField(required=False, default=dict)


class StreakSerializer(serializers.ModelSerializer):
    """Serializer for streaks."""

    class Meta:
        model = Streak
        fields = ['current_streak', 'longest_streak', 'last_activity_date']


class LeaderboardEntrySerializer(serializers.Serializer):
    """Serializer for leaderboard entries."""

    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    avatar = serializers.CharField(allow_null=True)
    level = serializers.IntegerField()
    exp = serializers.IntegerField()
    score = serializers.IntegerField()


class RewardSerializer(serializers.ModelSerializer):
    """Serializer for rewards."""

    class Meta:
        model = Reward
        fields = [
            'id', 'name', 'description', 'icon',
            'cost', 'stock', 'is_active', 'created_at'
        ]


class UserRewardSerializer(serializers.ModelSerializer):
    """Serializer for user rewards."""

    reward = RewardSerializer(read_only=True)

    class Meta:
        model = UserReward
        fields = ['id', 'reward', 'redeemed_at', 'is_used']


class RedeemRewardSerializer(serializers.Serializer):
    """Serializer for redeeming rewards."""

    reward_id = serializers.IntegerField()

    def validate_reward_id(self, value):
        """Validate reward exists and is available."""
        try:
            reward = Reward.objects.get(id=value, is_active=True)

            if reward.stock == 0:
                raise serializers.ValidationError('This reward is out of stock.')

            return value
        except Reward.DoesNotExist:
            raise serializers.ValidationError('Reward not found or inactive.')


class GamificationProfileSerializer(serializers.Serializer):
    """Serializer for user gamification profile."""

    user = UserSerializer()
    badges = UserBadgeSerializer(many=True)
    streak = StreakSerializer()
    total_activities = serializers.IntegerField()
    recent_activities = ActivitySerializer(many=True)
