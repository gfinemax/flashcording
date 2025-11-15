"""
Views for quiz functionality.
"""
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from .models import QuizPool, QuizQuestion, QuizOption, QuizSession, QuizAnswer
from .serializers import (
    QuizPoolSerializer,
    QuizPoolDetailSerializer,
    QuizSessionSerializer,
    CreateQuizSessionSerializer,
    SubmitAnswerSerializer,
    QuizAnswerSerializer,
    QuizResultSerializer,
)
from gamification.models import Activity


class QuizPoolListView(generics.ListAPIView):
    """List all quiz pools."""

    serializer_class = QuizPoolSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get active quiz pools with question count."""
        return QuizPool.objects.filter(is_active=True).annotate(
            question_count=Count('questions', filter=Q(questions__is_active=True))
        ).filter(question_count__gt=0)


class QuizPoolDetailView(generics.RetrieveAPIView):
    """Get quiz pool details."""

    serializer_class = QuizPoolDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = QuizPool.objects.filter(is_active=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_quiz_session(request):
    """Create a new quiz session."""
    serializer = CreateQuizSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    pool = get_object_or_404(QuizPool, id=serializer.validated_data['pool_id'])

    # Get active questions for this pool
    questions = pool.questions.filter(is_active=True).order_by('order')

    if not questions.exists():
        return Response({
            'error': 'No active questions in this quiz pool.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Calculate max score
    max_score = sum(q.points for q in questions)

    # Create session
    session = QuizSession.objects.create(
        user=request.user,
        pool=pool,
        max_score=max_score,
        total_questions=questions.count()
    )

    # Record activity
    Activity.objects.create(
        user=request.user,
        event_type='quiz_started',
        description=f'Started quiz: {pool.title}',
        exp_gained=0
    )

    return Response({
        'session': QuizSessionSerializer(session).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_quiz_session(request, session_id):
    """Get quiz session details."""
    session = get_object_or_404(QuizSession, id=session_id, user=request.user)

    # Get questions for this session
    questions = session.pool.questions.filter(is_active=True).order_by('order')

    # Get user's answers for this session
    from .serializers import QuizQuestionSerializer
    answers = QuizAnswer.objects.filter(session=session)

    return Response({
        'session': QuizSessionSerializer(session).data,
        'questions': QuizQuestionSerializer(questions, many=True).data,
        'answers': QuizAnswerSerializer(answers, many=True).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_answer(request, session_id):
    """Submit answer for a quiz question."""
    session = get_object_or_404(QuizSession, id=session_id, user=request.user)

    if session.status != 'in_progress':
        return Response({
            'error': 'Quiz session is not in progress.'
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = SubmitAnswerSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    question = serializer.validated_data['question']

    # Check if answer already exists
    if QuizAnswer.objects.filter(session=session, question=question).exists():
        return Response({
            'error': 'Answer already submitted for this question.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Create answer
    answer_data = {
        'session': session,
        'question': question,
        'time_taken': serializer.validated_data.get('time_taken', 0),
    }

    # Check if answer is correct
    is_correct = False
    points_earned = 0

    if question.question_type == 'coding':
        # For coding questions, run test cases
        code_answer = serializer.validated_data.get('code_answer')
        answer_data['code_answer'] = code_answer

        # TODO: Implement code execution and validation
        # For now, just check if code is not empty
        is_correct = bool(code_answer and len(code_answer.strip()) > 0)

    else:
        # For multiple choice, check selected option
        selected_option_id = serializer.validated_data.get('selected_option_id')
        selected_option = get_object_or_404(QuizOption, id=selected_option_id, question=question)
        answer_data['selected_option'] = selected_option
        is_correct = selected_option.is_correct

    if is_correct:
        points_earned = question.points
        session.correct_answers += 1

    answer_data['is_correct'] = is_correct
    answer_data['points_earned'] = points_earned

    answer = QuizAnswer.objects.create(**answer_data)

    # Update session
    session.score += points_earned
    session.time_spent += answer_data['time_taken']
    session.current_question_index += 1
    session.save()

    return Response({
        'answer': QuizAnswerSerializer(answer).data,
        'session': QuizSessionSerializer(session).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def finish_quiz_session(request, session_id):
    """Finish a quiz session."""
    session = get_object_or_404(QuizSession, id=session_id, user=request.user)

    if session.status != 'in_progress':
        return Response({
            'error': 'Quiz session is not in progress.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Finish session and award XP
    result = session.finish()

    # Get all answers
    answers = QuizAnswer.objects.filter(session=session).order_by('answered_at')

    # Record activity
    Activity.objects.create(
        user=request.user,
        event_type='quiz_completed',
        description=f'Completed quiz: {session.pool.title} (Score: {session.score}/{session.max_score})',
        exp_gained=result['exp_earned'],
        metadata={
            'score': session.score,
            'max_score': session.max_score,
            'accuracy': session.accuracy,
        }
    )

    # Check for streak
    from gamification.models import Streak
    streak, created = Streak.objects.get_or_create(user=request.user)
    streak.check_and_update()

    return Response(QuizResultSerializer({
        'session': session,
        'answers': answers,
        'exp_earned': result['exp_earned'],
        'leveled_up': result['leveled_up'],
        'new_level': result['new_level'],
    }).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_history(request):
    """Get user's quiz history."""
    sessions = QuizSession.objects.filter(
        user=request.user,
        status='completed'
    ).order_by('-completed_at')

    # Apply filters
    category = request.query_params.get('category')
    if category:
        sessions = sessions.filter(pool__category=category)

    difficulty = request.query_params.get('difficulty')
    if difficulty:
        sessions = sessions.filter(pool__difficulty=difficulty)

    return Response({
        'sessions': QuizSessionSerializer(sessions, many=True).data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_recommendations(request):
    """Get recommended quizzes for user."""
    user = request.user

    # Get user's completed quiz categories
    completed_categories = QuizSession.objects.filter(
        user=user,
        status='completed'
    ).values_list('pool__category', flat=True).distinct()

    # Get pools in categories user hasn't tried
    recommended = QuizPool.objects.filter(is_active=True).annotate(
        question_count=Count('questions', filter=Q(questions__is_active=True))
    ).filter(question_count__gt=0)

    # Prioritize new categories
    if completed_categories:
        recommended = recommended.exclude(category__in=completed_categories)

    # Order by difficulty (start with beginner)
    recommended = recommended.order_by('difficulty', '-created_at')[:5]

    return Response({
        'recommendations': QuizPoolSerializer(recommended, many=True).data,
    })
