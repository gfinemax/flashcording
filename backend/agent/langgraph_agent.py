"""
LangGraph agent for code generation and analysis.
"""
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, END
from django.conf import settings
import json


class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    prompt: str
    context: dict
    current_step: str
    progress: int
    generated_code: str
    analysis: dict
    error: str


def create_llm(model_name: str = None):
    """Create LLM instance based on model name."""
    if model_name is None:
        model_name = settings.DEFAULT_LLM_MODEL

    if model_name.startswith('gpt'):
        return ChatOpenAI(
            model=model_name,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )
    elif model_name.startswith('claude'):
        return ChatAnthropic(
            model=model_name,
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=0.7
        )
    else:
        # Default to GPT-4
        return ChatOpenAI(
            model='gpt-4',
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )


def analyze_context(state: AgentState) -> AgentState:
    """Analyze the provided context (Git, files, etc.)."""
    state['current_step'] = 'Analyzing context'
    state['progress'] = 20

    context = state.get('context', {})

    # Extract relevant information from context
    git_info = context.get('git', {})
    file_info = context.get('files', [])

    analysis = {
        'git_branch': git_info.get('branch', 'unknown'),
        'git_changes': git_info.get('changes', []),
        'files_count': len(file_info),
        'files': file_info,
    }

    state['analysis'] = analysis

    # Add context analysis to messages
    context_message = f"""
Context Analysis:
- Git Branch: {analysis['git_branch']}
- Files: {analysis['files_count']} files provided
- Changes: {len(analysis['git_changes'])} changes detected
"""

    state['messages'].append(AIMessage(content=context_message))

    return state


def read_git_context(state: AgentState) -> AgentState:
    """Read and process Git repository context."""
    state['current_step'] = 'Reading Git context'
    state['progress'] = 40

    context = state.get('context', {})
    git_info = context.get('git', {})

    git_summary = f"""
Git Repository Context:
- Branch: {git_info.get('branch', 'main')}
- Last Commit: {git_info.get('last_commit', 'N/A')}
- Modified Files: {', '.join(git_info.get('modified_files', []))}
- Untracked Files: {', '.join(git_info.get('untracked_files', []))}
"""

    state['messages'].append(AIMessage(content=git_summary))

    return state


def plan_solution(state: AgentState) -> AgentState:
    """Plan the solution based on prompt and context."""
    state['current_step'] = 'Planning solution'
    state['progress'] = 60

    llm = create_llm()

    # Create planning prompt
    planning_prompt = f"""
You are an expert software engineer. Based on the following request and context, create a detailed plan for implementing the solution.

User Request: {state['prompt']}

Context: {json.dumps(state.get('context', {}), indent=2)}

Please provide a step-by-step plan for implementing this solution. Be specific and detailed.
"""

    messages = [
        SystemMessage(content="You are an expert software engineer planning a code implementation."),
        HumanMessage(content=planning_prompt)
    ]

    response = llm.invoke(messages)
    plan = response.content

    state['messages'].append(AIMessage(content=f"Plan:\n{plan}"))

    return state


def generate_code(state: AgentState) -> AgentState:
    """Generate code based on the plan."""
    state['current_step'] = 'Generating code'
    state['progress'] = 80

    llm = create_llm()

    # Create code generation prompt
    code_prompt = f"""
Based on the plan and context, generate the necessary code to fulfill the user's request.

User Request: {state['prompt']}

Context: {json.dumps(state.get('context', {}), indent=2)}

Plan: {state['messages'][-1].content if state['messages'] else 'No plan available'}

Generate clean, well-documented code. Include comments explaining key sections.
Return only the code without additional explanation.
"""

    messages = [
        SystemMessage(content="You are an expert software engineer. Generate clean, production-ready code."),
        HumanMessage(content=code_prompt)
    ]

    response = llm.invoke(messages)
    generated_code = response.content

    state['generated_code'] = generated_code
    state['messages'].append(AIMessage(content=f"Generated code:\n```\n{generated_code}\n```"))

    return state


def validate_code(state: AgentState) -> AgentState:
    """Validate and review the generated code."""
    state['current_step'] = 'Validating code'
    state['progress'] = 95

    llm = create_llm()

    # Create validation prompt
    validation_prompt = f"""
Review the following generated code for:
1. Correctness
2. Best practices
3. Potential bugs or issues
4. Code quality

Code:
```
{state.get('generated_code', '')}
```

Provide a brief review and any suggestions for improvement.
"""

    messages = [
        SystemMessage(content="You are an expert code reviewer."),
        HumanMessage(content=validation_prompt)
    ]

    response = llm.invoke(messages)
    review = response.content

    state['messages'].append(AIMessage(content=f"Code Review:\n{review}"))

    return state


def finalize_result(state: AgentState) -> AgentState:
    """Finalize the result and prepare output."""
    state['current_step'] = 'Completed'
    state['progress'] = 100

    return state


def create_agent_graph():
    """Create the LangGraph agent workflow."""

    # Create the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("analyze_context", analyze_context)
    workflow.add_node("read_git", read_git_context)
    workflow.add_node("plan", plan_solution)
    workflow.add_node("generate", generate_code)
    workflow.add_node("validate", validate_code)
    workflow.add_node("finalize", finalize_result)

    # Add edges (workflow)
    workflow.set_entry_point("analyze_context")
    workflow.add_edge("analyze_context", "read_git")
    workflow.add_edge("read_git", "plan")
    workflow.add_edge("plan", "generate")
    workflow.add_edge("generate", "validate")
    workflow.add_edge("validate", "finalize")
    workflow.add_edge("finalize", END)

    # Compile the graph
    return workflow.compile()


def run_agent(prompt: str, context: dict = None, model: str = None):
    """Run the agent with given prompt and context."""

    if context is None:
        context = {}

    # Create initial state
    initial_state = {
        "messages": [HumanMessage(content=prompt)],
        "prompt": prompt,
        "context": context,
        "current_step": "Starting",
        "progress": 0,
        "generated_code": "",
        "analysis": {},
        "error": "",
    }

    # Create and run the agent graph
    agent = create_agent_graph()

    try:
        # Run the graph
        result = agent.invoke(initial_state)
        return result
    except Exception as e:
        initial_state['error'] = str(e)
        initial_state['current_step'] = 'Failed'
        return initial_state


def analyze_code_complexity(code: str, language: str = 'python'):
    """Analyze code complexity and quality."""

    llm = create_llm()

    analysis_prompt = f"""
Analyze the following {language} code for:
1. Cyclomatic complexity
2. Code maintainability
3. Potential code smells
4. Lines of code
5. Suggestions for improvement

Code:
```{language}
{code}
```

Return your analysis in JSON format with the following structure:
{{
    "complexity_score": <float 0-10>,
    "maintainability_index": <float 0-100>,
    "lines_of_code": <int>,
    "cyclomatic_complexity": <int>,
    "cognitive_complexity": <int>,
    "code_smells": <int>,
    "issues": [
        {{"severity": "high|medium|low", "message": "description", "line": <int>}}
    ],
    "suggestions": [
        {{"type": "improvement type", "message": "suggestion"}}
    ]
}}
"""

    messages = [
        SystemMessage(content="You are an expert code analyzer. Return only valid JSON."),
        HumanMessage(content=analysis_prompt)
    ]

    response = llm.invoke(messages)

    try:
        analysis = json.loads(response.content)
        return analysis
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "complexity_score": 5.0,
            "maintainability_index": 70.0,
            "lines_of_code": len(code.split('\n')),
            "cyclomatic_complexity": 5,
            "cognitive_complexity": 5,
            "code_smells": 0,
            "issues": [],
            "suggestions": []
        }
