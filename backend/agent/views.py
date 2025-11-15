"""
Views for agent functionality.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import threading

from .models import AgentJob, CodeAnalysis, ConversationHistory
from .serializers import (
    AgentJobSerializer,
    CreateAgentJobSerializer,
    CodeAnalysisSerializer,
    AnalyzeCodeSerializer,
    ConversationHistorySerializer,
    ChatMessageSerializer,
)
from .langgraph_agent import run_agent, analyze_code_complexity
from gamification.models import Activity


class AgentJobListView(generics.ListAPIView):
    """List user's agent jobs."""

    serializer_class = AgentJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get jobs for current user."""
        return AgentJob.objects.filter(user=self.request.user).order_by('-created_at')


class AgentJobDetailView(generics.RetrieveAPIView):
    """Get agent job details."""

    serializer_class = AgentJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get jobs for current user."""
        return AgentJob.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_agent_job(request):
    """Create a new agent job and start processing."""
    serializer = CreateAgentJobSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Create job
    job = AgentJob.objects.create(
        user=request.user,
        prompt=serializer.validated_data['prompt'],
        context=serializer.validated_data.get('context', {}),
        model_used=serializer.validated_data.get('model', 'gpt-4'),
    )

    # Start processing in background thread
    thread = threading.Thread(target=process_agent_job, args=(job.id,))
    thread.start()

    return Response({
        'job': AgentJobSerializer(job).data,
    }, status=status.HTTP_201_CREATED)


def process_agent_job(job_id):
    """Process agent job in background."""
    try:
        job = AgentJob.objects.get(id=job_id)
        job.start_processing()

        # Run the agent
        result = run_agent(
            prompt=job.prompt,
            context=job.context,
            model=job.model_used
        )

        # Update job with results
        job.complete(
            result_data={
                'messages': [{'role': 'assistant', 'content': str(msg.content)} for msg in result.get('messages', [])],
                'analysis': result.get('analysis', {}),
            },
            generated_code=result.get('generated_code', ''),
            diff=''  # TODO: Generate diff
        )

        # Record activity
        Activity.objects.create(
            user=job.user,
            event_type='code_generated',
            description=f'Generated code using AI agent',
            exp_gained=20,
            metadata={'job_id': job.id}
        )

        # Award XP
        job.user.add_exp(20)

    except Exception as e:
        job.fail(str(e))


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def analyze_code(request):
    """Analyze code complexity and quality."""
    serializer = AnalyzeCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    code = serializer.validated_data['code']
    language = serializer.validated_data['language']
    file_path = serializer.validated_data.get('file_path', 'untitled')

    # Analyze code using LangGraph agent
    analysis_result = analyze_code_complexity(code, language)

    # Create code analysis record
    analysis = CodeAnalysis.objects.create(
        user=request.user,
        file_path=file_path,
        language=language,
        code_content=code,
        complexity_score=analysis_result.get('complexity_score', 0),
        lines_of_code=analysis_result.get('lines_of_code', 0),
        maintainability_index=analysis_result.get('maintainability_index', 0),
        issues=analysis_result.get('issues', []),
        suggestions=analysis_result.get('suggestions', []),
        cyclomatic_complexity=analysis_result.get('cyclomatic_complexity', 0),
        cognitive_complexity=analysis_result.get('cognitive_complexity', 0),
        code_smells=analysis_result.get('code_smells', 0),
    )

    # Record activity
    Activity.objects.create(
        user=request.user,
        event_type='code_analyzed',
        description=f'Analyzed code: {file_path}',
        exp_gained=5,
        metadata={'analysis_id': analysis.id}
    )

    # Award XP
    request.user.add_exp(5)

    return Response({
        'analysis': CodeAnalysisSerializer(analysis).data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def code_analysis_history(request):
    """Get user's code analysis history."""
    analyses = CodeAnalysis.objects.filter(user=request.user).order_by('-created_at')

    # Apply filters
    language = request.query_params.get('language')
    if language:
        analyses = analyses.filter(language=language)

    return Response({
        'analyses': CodeAnalysisSerializer(analyses, many=True).data,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    """Chat with the AI agent."""
    serializer = ChatMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    session_id = serializer.validated_data['session_id']
    message = serializer.validated_data['message']
    model = serializer.validated_data.get('model', 'gpt-4')

    # Save user message
    ConversationHistory.objects.create(
        user=request.user,
        session_id=session_id,
        role='user',
        content=message,
        model=model
    )

    # Get conversation history
    history = ConversationHistory.objects.filter(
        user=request.user,
        session_id=session_id
    ).order_by('created_at')

    # Build conversation context
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    messages = [
        SystemMessage(content="You are a helpful AI coding assistant.")
    ]

    for msg in history:
        if msg.role == 'user':
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == 'assistant':
            messages.append(AIMessage(content=msg.content))

    # Generate response
    from .langgraph_agent import create_llm
    llm = create_llm(model)
    response = llm.invoke(messages)

    # Save assistant response
    ConversationHistory.objects.create(
        user=request.user,
        session_id=session_id,
        role='assistant',
        content=response.content,
        model=model,
        tokens=len(response.content.split())  # Rough estimate
    )

    return Response({
        'response': response.content,
        'session_id': session_id,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_history(request, session_id):
    """Get conversation history for a session."""
    history = ConversationHistory.objects.filter(
        user=request.user,
        session_id=session_id
    ).order_by('created_at')

    return Response({
        'messages': ConversationHistorySerializer(history, many=True).data,
    })
