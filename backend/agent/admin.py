from django.contrib import admin
from .models import AgentJob, CodeAnalysis, ConversationHistory


@admin.register(AgentJob)
class AgentJobAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'progress', 'model_used', 'processing_time', 'created_at')
    list_filter = ('status', 'model_used', 'created_at')
    search_fields = ('user__username', 'prompt', 'message')
    readonly_fields = ('created_at', 'started_at', 'completed_at', 'processing_time')

    fieldsets = (
        ('Job Info', {
            'fields': ('user', 'prompt', 'context')
        }),
        ('Status', {
            'fields': ('status', 'progress', 'current_step', 'message')
        }),
        ('Results', {
            'fields': ('result', 'generated_code', 'diff', 'error_message')
        }),
        ('Metadata', {
            'fields': ('model_used', 'tokens_used', 'processing_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'started_at', 'completed_at')
        }),
    )


@admin.register(CodeAnalysis)
class CodeAnalysisAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_path', 'language', 'complexity_score', 'lines_of_code', 'created_at')
    list_filter = ('language', 'created_at')
    search_fields = ('user__username', 'file_path')
    readonly_fields = ('created_at',)


@admin.register(ConversationHistory)
class ConversationHistoryAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'role', 'content_preview', 'tokens', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__username', 'session_id', 'content')
    readonly_fields = ('created_at',)

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
