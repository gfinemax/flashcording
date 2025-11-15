"""
Agent models for AI-powered code generation and analysis.
"""
from django.db import models
from django.utils import timezone
from users.models import User


class AgentJob(models.Model):
    """Background job for agent processing."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agent_jobs')
    prompt = models.TextField()
    context = models.JSONField(default=dict, blank=True)  # Git context, file context, etc.

    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.IntegerField(default=0)  # 0-100
    current_step = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)

    # Results
    result = models.JSONField(default=dict, blank=True)
    generated_code = models.TextField(blank=True, null=True)
    diff = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    # Metadata
    model_used = models.CharField(max_length=50, blank=True, null=True)  # 'gpt-4', 'claude-3', etc.
    tokens_used = models.IntegerField(default=0)
    processing_time = models.FloatField(default=0.0)  # seconds

    created_at = models.DateTimeField(default=timezone.now)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'agent_jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

    def start_processing(self):
        """Mark job as processing."""
        self.status = 'processing'
        self.started_at = timezone.now()
        self.save()

    def complete(self, result_data, generated_code=None, diff=None):
        """Mark job as completed."""
        self.status = 'completed'
        self.progress = 100
        self.result = result_data
        self.generated_code = generated_code
        self.diff = diff
        self.completed_at = timezone.now()

        if self.started_at:
            self.processing_time = (self.completed_at - self.started_at).total_seconds()

        self.save()

    def fail(self, error_message):
        """Mark job as failed."""
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = timezone.now()

        if self.started_at:
            self.processing_time = (self.completed_at - self.started_at).total_seconds()

        self.save()

    def update_progress(self, progress, step=None, message=None):
        """Update job progress."""
        self.progress = progress
        if step:
            self.current_step = step
        if message:
            self.message = message
        self.save()


class CodeAnalysis(models.Model):
    """Code complexity and quality analysis results."""

    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('java', 'Java'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='code_analyses')
    file_path = models.CharField(max_length=500)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='python')
    code_content = models.TextField()

    # Analysis results
    complexity_score = models.FloatField(default=0.0)
    lines_of_code = models.IntegerField(default=0)
    maintainability_index = models.FloatField(default=0.0)

    # Issues found
    issues = models.JSONField(default=list, blank=True)
    suggestions = models.JSONField(default=list, blank=True)

    # Metrics
    cyclomatic_complexity = models.IntegerField(default=0)
    cognitive_complexity = models.IntegerField(default=0)
    code_smells = models.IntegerField(default=0)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'code_analyses'
        ordering = ['-created_at']
        verbose_name_plural = 'code analyses'

    def __str__(self):
        return f"{self.file_path} - {self.language} (Score: {self.complexity_score})"


class ConversationHistory(models.Model):
    """Store agent conversation history."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    session_id = models.CharField(max_length=100, db_index=True)

    # Message content
    role = models.CharField(max_length=20)  # 'user', 'assistant', 'system'
    content = models.TextField()

    # Metadata
    tokens = models.IntegerField(default=0)
    model = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'conversation_history'
        ordering = ['session_id', 'created_at']
        verbose_name_plural = 'conversation histories'

    def __str__(self):
        return f"{self.session_id} - {self.role} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
