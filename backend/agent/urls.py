"""
URL patterns for agent functionality.
"""
from django.urls import path
from .views import (
    AgentJobListView,
    AgentJobDetailView,
    create_agent_job,
    analyze_code,
    code_analysis_history,
    chat,
    conversation_history,
)

urlpatterns = [
    # Agent jobs
    path('agent/jobs', AgentJobListView.as_view(), name='agent_jobs'),
    path('agent/jobs/<int:pk>', AgentJobDetailView.as_view(), name='agent_job_detail'),
    path('agent/generate', create_agent_job, name='create_agent_job'),

    # Code analysis
    path('analyze', analyze_code, name='analyze_code'),
    path('analyses', code_analysis_history, name='code_analysis_history'),

    # Chat
    path('chat', chat, name='chat'),
    path('chat/<str:session_id>', conversation_history, name='conversation_history'),
]
