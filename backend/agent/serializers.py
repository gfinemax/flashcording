"""
Serializers for agent functionality.
"""
from rest_framework import serializers
from .models import AgentJob, CodeAnalysis, ConversationHistory


class AgentJobSerializer(serializers.ModelSerializer):
    """Serializer for agent jobs."""

    class Meta:
        model = AgentJob
        fields = [
            'id', 'prompt', 'context', 'status', 'progress',
            'current_step', 'message', 'result', 'generated_code',
            'diff', 'error_message', 'model_used', 'tokens_used',
            'processing_time', 'created_at', 'started_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'status', 'progress', 'current_step', 'message',
            'result', 'generated_code', 'diff', 'error_message',
            'tokens_used', 'processing_time', 'created_at',
            'started_at', 'completed_at'
        ]


class CreateAgentJobSerializer(serializers.Serializer):
    """Serializer for creating agent jobs."""

    prompt = serializers.CharField()
    context = serializers.JSONField(required=False, default=dict)
    model = serializers.CharField(required=False, default='gpt-4')


class CodeAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for code analysis."""

    class Meta:
        model = CodeAnalysis
        fields = [
            'id', 'file_path', 'language', 'code_content',
            'complexity_score', 'lines_of_code', 'maintainability_index',
            'issues', 'suggestions', 'cyclomatic_complexity',
            'cognitive_complexity', 'code_smells', 'created_at'
        ]
        read_only_fields = [
            'id', 'complexity_score', 'lines_of_code',
            'maintainability_index', 'issues', 'suggestions',
            'cyclomatic_complexity', 'cognitive_complexity',
            'code_smells', 'created_at'
        ]


class AnalyzeCodeSerializer(serializers.Serializer):
    """Serializer for code analysis request."""

    code = serializers.CharField()
    language = serializers.ChoiceField(
        choices=['python', 'javascript', 'typescript', 'java', 'go', 'rust', 'other'],
        default='python'
    )
    file_path = serializers.CharField(required=False, default='untitled')


class ConversationHistorySerializer(serializers.ModelSerializer):
    """Serializer for conversation history."""

    class Meta:
        model = ConversationHistory
        fields = [
            'id', 'session_id', 'role', 'content',
            'tokens', 'model', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for chat messages."""

    session_id = serializers.CharField()
    message = serializers.CharField()
    model = serializers.CharField(required=False, default='gpt-4')
