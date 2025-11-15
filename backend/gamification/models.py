"""
Gamification models for badges, achievements, and leaderboards.
"""
from django.db import models
from django.utils import timezone
from users.models import User


class Badge(models.Model):
    """Achievement badge that users can earn."""

    RARITY_CHOICES = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=500)  # URL or emoji
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')

    # Unlock criteria
    criteria_type = models.CharField(max_length=50)  # 'quiz_complete', 'level_reach', 'streak', etc.
    criteria_value = models.IntegerField(default=0)  # Target value

    exp_reward = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'badges'
        ordering = ['rarity', 'name']

    def __str__(self):
        return f"{self.icon} {self.name} ({self.rarity})"


class UserBadge(models.Model):
    """Badges earned by users."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'user_badges'
        ordering = ['-earned_at']
        unique_together = ['user', 'badge']

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"


class Activity(models.Model):
    """User activity log for gamification feed."""

    EVENT_TYPE_CHOICES = [
        ('quiz_started', 'Quiz Started'),
        ('quiz_completed', 'Quiz Completed'),
        ('level_up', 'Level Up'),
        ('badge_earned', 'Badge Earned'),
        ('streak_milestone', 'Streak Milestone'),
        ('code_generated', 'Code Generated'),
        ('code_analyzed', 'Code Analyzed'),
        ('challenge_solved', 'Challenge Solved'),
        ('reward_redeemed', 'Reward Redeemed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    description = models.TextField()
    exp_gained = models.IntegerField(default=0)

    # Related objects (optional)
    badge = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)  # Additional event data

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'activities'
        ordering = ['-created_at']
        verbose_name_plural = 'activities'

    def __str__(self):
        return f"{self.user.username} - {self.event_type} ({self.created_at.strftime('%Y-%m-%d')})"


class Streak(models.Model):
    """User's daily activity streak."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'streaks'

    def __str__(self):
        return f"{self.user.username} - {self.current_streak} days"

    def check_and_update(self):
        """Check and update streak based on today's activity."""
        from datetime import date, timedelta

        today = date.today()

        if self.last_activity_date is None:
            # First activity
            self.current_streak = 1
            self.longest_streak = 1
            self.last_activity_date = today
        elif self.last_activity_date == today:
            # Already counted today
            return False
        elif self.last_activity_date == today - timedelta(days=1):
            # Consecutive day
            self.current_streak += 1
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
            self.last_activity_date = today
        else:
            # Streak broken
            self.current_streak = 1
            self.last_activity_date = today

        self.save()
        return True


class Leaderboard(models.Model):
    """Leaderboard entry for ranking users."""

    PERIOD_CHOICES = [
        ('all_time', 'All Time'),
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES, default='all_time')
    rank = models.IntegerField(default=0)
    score = models.IntegerField(default=0)  # Total XP for the period
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboards'
        ordering = ['period', 'rank']
        unique_together = ['user', 'period', 'period_start']

    def __str__(self):
        return f"#{self.rank} {self.user.username} - {self.period} ({self.score} XP)"


class Reward(models.Model):
    """Redeemable rewards for achievements."""

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=500)
    cost = models.IntegerField(default=100)  # XP cost
    is_active = models.BooleanField(default=True)
    stock = models.IntegerField(default=-1)  # -1 for unlimited

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'rewards'
        ordering = ['cost', 'name']

    def __str__(self):
        return f"{self.name} ({self.cost} XP)"


class UserReward(models.Model):
    """Rewards redeemed by users."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='redeemed_rewards')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE, related_name='redemptions')
    redeemed_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_rewards'
        ordering = ['-redeemed_at']

    def __str__(self):
        return f"{self.user.username} - {self.reward.name}"
