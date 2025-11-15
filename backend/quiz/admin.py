from django.contrib import admin
from .models import QuizPool, QuizQuestion, QuizOption, TestCase, QuizSession, QuizAnswer


class QuizOptionInline(admin.TabularInline):
    model = QuizOption
    extra = 4


class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 2


@admin.register(QuizPool)
class QuizPoolAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'difficulty', 'question_count', 'is_active', 'created_at')
    list_filter = ('category', 'difficulty', 'is_active')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('pool', 'question_type', 'text_preview', 'points', 'order', 'is_active')
    list_filter = ('question_type', 'pool', 'is_active')
    search_fields = ('text',)
    inlines = [QuizOptionInline, TestCaseInline]

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


@admin.register(QuizOption)
class QuizOptionAdmin(admin.ModelAdmin):
    list_display = ('question', 'text_preview', 'is_correct', 'order')
    list_filter = ('is_correct', 'question__pool')
    search_fields = ('text',)

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Option'


@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('question', 'is_hidden', 'order')
    list_filter = ('is_hidden', 'question__pool')


@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'pool', 'status', 'score', 'accuracy', 'started_at', 'completed_at')
    list_filter = ('status', 'pool', 'started_at')
    search_fields = ('user__username', 'user__email', 'pool__title')
    readonly_fields = ('started_at', 'completed_at')


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    list_display = ('session', 'question', 'is_correct', 'points_earned', 'time_taken', 'answered_at')
    list_filter = ('is_correct', 'answered_at')
    search_fields = ('session__user__username', 'question__text')
    readonly_fields = ('answered_at',)
