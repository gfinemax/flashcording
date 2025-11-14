# Django Backend Server

Django REST API backend for the Flash AI Coding Agent project.

## Setup

### Prerequisites
- Python 3.11+
- pip

### Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

## Running the Server

Start the development server:
```bash
python manage.py runserver
```

The server will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- **URL**: `/api/health/`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "healthy",
  "message": "Django server is running!"
}
```

### Hello World
- **URL**: `/api/hello/`
- **Methods**: `GET`, `POST`

**GET Request**:
```json
{
  "message": "Hello from Django!",
  "method": "GET"
}
```

**POST Request**:
```bash
curl -X POST http://localhost:8000/api/hello/ \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

Response:
```json
{
  "message": "Hello, John!",
  "method": "POST",
  "data_received": {"name": "John"}
}
```

## Project Structure

```
backend/
├── api/                 # Main API app
│   ├── views.py        # API views
│   └── urls.py         # API URL patterns
├── config/             # Django project configuration
│   ├── settings.py     # Django settings
│   └── urls.py         # Main URL configuration
├── manage.py           # Django management script
└── requirements.txt    # Python dependencies
```

## Features

- Django REST Framework for API development
- CORS headers configured for Next.js frontend (localhost:3000)
- SQLite database (default)
- Ready for development with hot reload

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

Use the superuser credentials you created with `createsuperuser` command.

## Configuration

### CORS Settings
The server is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

To modify CORS settings, edit `config/settings.py` and update `CORS_ALLOWED_ORIGINS`.

### Database
By default, the project uses SQLite. To use PostgreSQL or another database, update the `DATABASES` setting in `config/settings.py` and install the appropriate database adapter.

## Development

### Adding New API Endpoints

1. Create views in `api/views.py`
2. Add URL patterns in `api/urls.py`
3. Test the endpoint

### Running Tests
```bash
python manage.py test
```

## Production Notes

Before deploying to production:
- Set `DEBUG = False` in settings.py
- Configure a proper `SECRET_KEY` using environment variables
- Set up a production database (PostgreSQL recommended)
- Configure static files serving
- Set proper `ALLOWED_HOSTS`
- Use environment variables for sensitive settings
