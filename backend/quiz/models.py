"""
Quiz models for coding challenges and assessments.
"""
from django.db import models
from django.utils import timezone
from users.models import User
import json


class QuizPool(models.Model):
    """Collection of quiz questions grouped by topic."""

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('react', 'React'),
        ('git', 'Git'),
        ('algorithms', 'Algorithms'),
        ('data-structures', 'Data Structures'),
        ('system-design', 'System Design'),
        ('general', 'General'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quiz_pools'
        ordering = ['category', 'difficulty']

    def __str__(self):
        return f"{self.title} ({self.category} - {self.difficulty})"

    @property
    def question_count(self):
        """Get total number of questions in this pool."""
        return self.questions.count()


class QuizQuestion(models.Model):
    """Individual quiz question with multiple choice or coding challenge."""

    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('coding', 'Coding Challenge'),
        ('true_false', 'True/False'),
    ]

    pool = models.ForeignKey(QuizPool, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    text = models.TextField()
    code_snippet = models.TextField(blank=True, null=True)  # Optional code example
    explanation = models.TextField(blank=True, null=True)  # Explanation of the answer

    # For coding challenges
    starter_code = models.TextField(blank=True, null=True)
    solution_code = models.TextField(blank=True, null=True)

    points = models.IntegerField(default=10)
    time_limit = models.IntegerField(default=300)  # seconds
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'quiz_questions'
        ordering = ['pool', 'order']

    def __str__(self):
        return f"{self.pool.title} - Q{self.order}: {self.text[:50]}..."


class QuizOption(models.Model):
    """Multiple choice option for a quiz question."""

    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'quiz_options'
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.question.text[:30]}... - {self.text[:30]}..."


class TestCase(models.Model):
    """Test case for coding challenge questions."""

    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()  # JSON string
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)  # Hidden test cases for validation
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'test_cases'
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.question.text[:30]}... - Test {self.order}"

    def get_input(self):
        """Parse input data from JSON."""
        try:
            return json.loads(self.input_data)
        except:
            return self.input_data


class QuizSession(models.Model):
    """User's quiz session tracking progress and score."""

    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    pool = models.ForeignKey(QuizPool, on_delete=models.CASCADE, related_name='sessions')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=0)
    current_question_index = models.IntegerField(default=0)

    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    time_spent = models.IntegerField(default=0)  # seconds
    correct_answers = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)

    class Meta:
        db_table = 'quiz_sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.pool.title} ({self.status})"

    @property
    def accuracy(self):
        """Calculate accuracy percentage."""
        if self.total_questions == 0:
            return 0
        return (self.correct_answers / self.total_questions) * 100

    def finish(self):
        """Mark session as completed."""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

        # Award XP to user
        exp_earned = self.score
        leveled_up = self.user.add_exp(exp_earned)

        return {
            'exp_earned': exp_earned,
            'leveled_up': leveled_up,
            'new_level': self.user.level
        }


class QuizAnswer(models.Model):
    """User's answer to a quiz question."""

    session = models.ForeignKey(QuizSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.ForeignKey(QuizOption, on_delete=models.SET_NULL, null=True, blank=True)
    code_answer = models.TextField(blank=True, null=True)  # For coding challenges

    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)
    time_taken = models.IntegerField(default=0)  # seconds

    answered_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'quiz_answers'
        ordering = ['session', 'answered_at']
        unique_together = ['session', 'question']

    def __str__(self):
        return f"{self.session.user.username} - {self.question.text[:30]}... ({'✓' if self.is_correct else '✗'})"
