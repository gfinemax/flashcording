#!/bin/bash

# FlashCording Backend Setup Script

echo "🚀 Setting up FlashCording Backend..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
fi

# Database migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Create superuser (admin account)..."
python manage.py createsuperuser

echo "✨ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver 0.0.0.0:8000"
