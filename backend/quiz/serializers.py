"""
Serializers for quiz functionality.
"""
from rest_framework import serializers
from .models import QuizPool, QuizQuestion, QuizOption, TestCase, QuizSession, QuizAnswer


class QuizOptionSerializer(serializers.ModelSerializer):
    """Serializer for quiz options."""

    class Meta:
        model = QuizOption
        fields = ['id', 'text', 'order']
        # Don't expose is_correct to users during quiz


class QuizOptionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz options with correct answer (for results)."""

    class Meta:
        model = QuizOption
        fields = ['id', 'text', 'is_correct', 'order']


class TestCaseSerializer(serializers.ModelSerializer):
    """Serializer for test cases (public only)."""

    input = serializers.SerializerMethodField()

    class Meta:
        model = TestCase
        fields = ['id', 'input', 'expected_output', 'order']

    def get_input(self, obj):
        """Parse and return input data."""
        return obj.get_input()


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions."""

    options = QuizOptionSerializer(many=True, read_only=True)
    test_cases = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'question_type', 'text', 'code_snippet',
            'options', 'test_cases', 'starter_code',
            'points', 'time_limit', 'order'
        ]

    def get_test_cases(self, obj):
        """Return only public test cases."""
        public_cases = obj.test_cases.filter(is_hidden=False)
        return TestCaseSerializer(public_cases, many=True).data


class QuizQuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions with answers (for results)."""

    options = QuizOptionWithAnswerSerializer(many=True, read_only=True)
    test_cases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'question_type', 'text', 'code_snippet', 'explanation',
            'options', 'test_cases', 'starter_code', 'solution_code',
            'points', 'time_limit', 'order'
        ]


class QuizPoolSerializer(serializers.ModelSerializer):
    """Serializer for quiz pools."""

    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizPool
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'question_count', 'created_at'
        ]


class QuizPoolDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for quiz pools with questions."""

    questions = QuizQuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizPool
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'question_count', 'questions', 'created_at'
        ]


class QuizSessionSerializer(serializers.ModelSerializer):
    """Serializer for quiz sessions."""

    pool = QuizPoolSerializer(read_only=True)
    accuracy = serializers.FloatField(read_only=True)

    class Meta:
        model = QuizSession
        fields = [
            'id', 'pool', 'status', 'score', 'max_score',
            'current_question_index', 'started_at', 'completed_at',
            'time_spent', 'correct_answers', 'total_questions', 'accuracy'
        ]
        read_only_fields = ['user', 'started_at']


class CreateQuizSessionSerializer(serializers.Serializer):
    """Serializer for creating a quiz session."""

    pool_id = serializers.IntegerField()

    def validate_pool_id(self, value):
        """Validate pool exists and is active."""
        try:
            pool = QuizPool.objects.get(id=value, is_active=True)
            if pool.questions.filter(is_active=True).count() == 0:
                raise serializers.ValidationError('This quiz pool has no active questions.')
            return value
        except QuizPool.DoesNotExist:
            raise serializers.ValidationError('Quiz pool not found or inactive.')


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers."""

    question_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField(required=False, allow_null=True)
    code_answer = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    time_taken = serializers.IntegerField(default=0)

    def validate(self, data):
        """Validate answer data based on question type."""
        question_id = data.get('question_id')

        try:
            question = QuizQuestion.objects.get(id=question_id)

            if question.question_type == 'coding':
                if not data.get('code_answer'):
                    raise serializers.ValidationError({
                        'code_answer': 'Code answer is required for coding questions.'
                    })
            else:
                if not data.get('selected_option_id'):
                    raise serializers.ValidationError({
                        'selected_option_id': 'Selected option is required for multiple choice questions.'
                    })

            data['question'] = question
            return data

        except QuizQuestion.DoesNotExist:
            raise serializers.ValidationError({
                'question_id': 'Question not found.'
            })


class QuizAnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz answers."""

    question = QuizQuestionWithAnswerSerializer(read_only=True)
    selected_option = QuizOptionWithAnswerSerializer(read_only=True)

    class Meta:
        model = QuizAnswer
        fields = [
            'id', 'question', 'selected_option', 'code_answer',
            'is_correct', 'points_earned', 'time_taken', 'answered_at'
        ]


class QuizResultSerializer(serializers.Serializer):
    """Serializer for quiz results."""

    session = QuizSessionSerializer()
    answers = QuizAnswerSerializer(many=True)
    exp_earned = serializers.IntegerField()
    leveled_up = serializers.BooleanField()
    new_level = serializers.IntegerField()
