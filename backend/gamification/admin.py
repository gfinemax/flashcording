from django.contrib import admin
from .models import Badge, UserBadge, Activity, Streak, Leaderboard, Reward, UserReward


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'rarity', 'criteria_type', 'criteria_value', 'exp_reward', 'is_active')
    list_filter = ('rarity', 'criteria_type', 'is_active')
    search_fields = ('name', 'description')


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'earned_at')
    list_filter = ('badge__rarity', 'earned_at')
    search_fields = ('user__username', 'badge__name')
    readonly_fields = ('earned_at',)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'description', 'exp_gained', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at',)


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_streak', 'longest_streak', 'last_activity_date')
    search_fields = ('user__username',)


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('rank', 'user', 'period', 'score', 'period_start', 'period_end')
    list_filter = ('period', 'period_start')
    search_fields = ('user__username',)
    ordering = ('period', 'rank')


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('name', 'cost', 'stock', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')


@admin.register(UserReward)
class UserRewardAdmin(admin.ModelAdmin):
    list_display = ('user', 'reward', 'redeemed_at', 'is_used')
    list_filter = ('is_used', 'redeemed_at')
    search_fields = ('user__username', 'reward__name')
    readonly_fields = ('redeemed_at',)
