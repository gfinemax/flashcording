# FlashCording Backend

Django backend for FlashCording - AI-powered coding agent platform.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Quiz System**: Coding challenges with multiple choice and coding questions
- **Gamification**: Badges, leaderboards, XP system, and rewards
- **AI Agent**: LangGraph-powered code generation and analysis
- **Code Analysis**: Complexity analysis and code quality metrics

## Tech Stack

- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **LangChain & LangGraph** - AI agent framework
- **OpenAI & Anthropic** - LLM providers
- **JWT** - Authentication
- **Celery** - Background tasks (optional)

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb flashcording

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at http://localhost:8000/api/

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get tokens
- `POST /api/users/refresh` - Refresh access token
- `POST /api/users/logout` - Logout
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Quiz
- `GET /api/quiz/pools` - List quiz pools
- `GET /api/quiz/pools/:id` - Get quiz pool details
- `POST /api/quiz/sessions` - Start quiz session
- `GET /api/quiz/sessions/:id` - Get quiz session
- `POST /api/quiz/sessions/:id/answers` - Submit answer
- `POST /api/quiz/sessions/:id/finish` - Finish quiz
- `GET /api/quiz/history` - Get quiz history
- `GET /api/quiz/recommendations` - Get recommendations

### Gamification
- `GET /api/gami/profile` - Get gamification profile
- `GET /api/gami/badges` - List all badges
- `GET /api/gami/user-badges` - Get user's badges
- `POST /api/gami/events` - Record activity event
- `GET /api/gami/activities` - Get activity feed
- `GET /api/gami/leaderboard` - Get leaderboard
- `GET /api/gami/rewards` - List rewards
- `POST /api/gami/redeem` - Redeem reward

### Agent
- `POST /api/agent/generate` - Generate code with AI
- `GET /api/agent/jobs` - List agent jobs
- `GET /api/agent/jobs/:id` - Get job details
- `POST /api/analyze` - Analyze code complexity
- `GET /api/analyses` - Get analysis history
- `POST /api/chat` - Chat with AI agent
- `GET /api/chat/:session_id` - Get chat history

## Models

### User
- Custom user model with gamification features
- Email-based authentication
- Level and XP tracking

### Quiz
- QuizPool - Collection of questions
- QuizQuestion - Individual questions
- QuizOption - Multiple choice options
- QuizSession - User's quiz attempts
- QuizAnswer - User's answers

### Gamification
- Badge - Achievement badges
- UserBadge - Earned badges
- Activity - Activity feed
- Streak - Daily streak tracking
- Leaderboard - Rankings
- Reward - Redeemable rewards

### Agent
- AgentJob - Code generation jobs
- CodeAnalysis - Code quality analysis
- ConversationHistory - Chat history

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
flake8 .
```

### Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface

Access at http://localhost:8000/admin/

## Production Deployment

1. Set `DEBUG=False` in .env
2. Configure proper `SECRET_KEY`
3. Set up PostgreSQL database
4. Configure Redis for Celery
5. Use gunicorn as WSGI server
6. Set up nginx as reverse proxy
7. Configure HTTPS

```bash
# Collect static files
python manage.py collectstatic

# Run with gunicorn
gunicorn flashcording_backend.wsgi:application --bind 0.0.0.0:8000
```

## License

MIT
