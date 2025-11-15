"""
URL patterns for quiz functionality.
"""
from django.urls import path
from .views import (
    QuizPoolListView,
    QuizPoolDetailView,
    create_quiz_session,
    get_quiz_session,
    submit_answer,
    finish_quiz_session,
    quiz_history,
    quiz_recommendations,
)

urlpatterns = [
    # Quiz pools
    path('pools', QuizPoolListView.as_view(), name='quiz_pools'),
    path('pools/<int:pk>', QuizPoolDetailView.as_view(), name='quiz_pool_detail'),

    # Quiz sessions
    path('sessions', create_quiz_session, name='create_quiz_session'),
    path('sessions/<int:session_id>', get_quiz_session, name='get_quiz_session'),
    path('sessions/<int:session_id>/answers', submit_answer, name='submit_answer'),
    path('sessions/<int:session_id>/finish', finish_quiz_session, name='finish_quiz_session'),

    # Quiz history and recommendations
    path('history', quiz_history, name='quiz_history'),
    path('recommendations', quiz_recommendations, name='quiz_recommendations'),
]
