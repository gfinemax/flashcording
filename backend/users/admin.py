from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, RefreshToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'level', 'exp', 'is_staff', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'provider')
    search_fields = ('email', 'username')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Profile', {'fields': ('avatar', 'bio')}),
        ('Gamification', {'fields': ('level', 'exp', 'total_exp')}),
        ('OAuth', {'fields': ('provider', 'provider_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'last_login')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('created_at', 'updated_at', 'last_login')


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'expires_at', 'is_blacklisted')
    list_filter = ('is_blacklisted', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('created_at',)
