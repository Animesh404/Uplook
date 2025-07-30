# Uplook Wellness API

A comprehensive FastAPI backend for the Uplook wellness application, featuring AI-powered mood analysis, personalized recommendations, and real-time chat functionality.

## Features

- **User Authentication**: Clerk-based authentication with JWT tokens
- **Onboarding Flow**: Complete user onboarding with goals and preferences
- **AI Analysis**: Sentiment analysis from journals and mood analysis from wearables
- **Personalized Recommendations**: AI-driven wellness content recommendations
- **Real-time Chat**: WebSocket-based chat functionality
- **Content Management**: Explore and library screens with filtering
- **Activity Tracking**: Journal entries and activity logging
- **Database Migrations**: Alembic for database schema management

## Tech Stack

- **Backend Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Clerk
- **Real-time**: WebSockets
- **AI/ML**: VADER Sentiment Analysis, NumPy, Pandas, Scikit-learn
- **Migrations**: Alembic
- **Task Queue**: Celery with Redis (optional)

## Project Structure

```
server/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py          # Clerk webhooks
│   │   │   ├── users.py         # User management
│   │   │   ├── home.py          # Home screen data
│   │   │   ├── content.py       # Content management
│   │   │   ├── activity.py      # Activity logging
│   │   │   ├── ai.py            # AI analysis
│   │   │   └── chat.py          # WebSocket chat
│   │   └── main.py              # FastAPI app setup
│   ├── core/
│   │   ├── config.py            # Settings
│   │   └── security.py          # Authentication
│   ├── db/
│   │   ├── database.py          # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   └── schemas.py           # Pydantic schemas
│   └── services/
│       ├── ai_service.py        # AI analysis logic
│       └── recommendation_service.py # Recommendations
├── alembic/                     # Database migrations
├── requirements.txt
├── main.py                      # Application entry point
├── docker-compose.yml           # Local development services
├── setup-local.sh               # Automated setup script
├── test-local.py                # Local testing script
└── README.md
```

## Local Development Setup

### Prerequisites

- **Python 3.8+**
- **PostgreSQL** (local installation or Docker)
- **Redis** (optional, for Celery background tasks)

### Quick Start with Docker (Recommended)

The easiest way to get started is using Docker for PostgreSQL and Redis:

#### Option 1: Automated Setup (Recommended)

1. **Install Docker and Docker Compose** (if not already installed)

2. **Run the automated setup script**:
   ```bash
   ./setup-local.sh
   ```

This script will:
- Check prerequisites (Docker, Python)
- Start PostgreSQL and Redis with Docker Compose
- Create a virtual environment
- Install Python dependencies
- Create a `.env` file template
- Run database migrations

#### Option 2: Manual Setup

1. **Install Docker and Docker Compose** (if not already installed)

2. **Start PostgreSQL and Redis with Docker Compose**:
   ```bash
   # Start the services
   docker-compose up -d
   ```

3. **Clone and navigate to the server directory**:
   ```bash
   cd server
   ```

4. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

5. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

6. **Set up environment variables**:
   Create a `.env` file in the server directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://uplook_user:uplook_password@localhost:5432/uplook_db
   
   # Clerk Configuration (get these from your Clerk dashboard)
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   
   # Redis Configuration (optional)
   REDIS_URL=redis://localhost:6379/0
   
   # Application Configuration
   SECRET_KEY=your_local_secret_key_here
   ENVIRONMENT=development
   DEBUG=true
   
   # AWS Configuration (optional for local development)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=uplook-storage
   ```

7. **Set up the database**:
   ```bash
   # Run migrations
   alembic upgrade head
   ```

8. **Run the application**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Manual Setup (Without Docker)

If you prefer to install PostgreSQL and Redis manually:

#### PostgreSQL Setup

**macOS (using Homebrew)**:
```bash
brew install postgresql
brew services start postgresql
createdb uplook_db
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres createdb uplook_db
sudo -u postgres createuser uplook_user
sudo -u postgres psql -c "ALTER USER uplook_user WITH PASSWORD 'uplook_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE uplook_db TO uplook_user;"
```

**Windows**:
1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. Create database and user through pgAdmin or command line

#### Redis Setup (Optional)

**macOS (using Homebrew)**:
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian**:
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows**:
1. Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
2. Install and start the Redis service

Then follow steps 3-8 from the Docker setup above.

## Testing the API

### API Documentation

Once the server is running, you can access:

- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

### Quick Test Endpoints

Test the API is working:

```bash
# Health check
curl http://localhost:8000/health

# Get API documentation
curl http://localhost:8000/openapi.json
```

### Automated Testing

Run the automated test script to verify your setup:

```bash
# Make sure the server is running first
python main.py

# In another terminal, run the test script
python test-local.py
```

This will test:
- Health endpoint connectivity
- OpenAPI documentation access
- Database connection (basic check)

### Testing with Sample Data

You can test the API endpoints using the interactive documentation at `http://localhost:8000/docs` or using tools like:

- **Postman**
- **Insomnia**
- **curl** commands

## API Endpoints

### Authentication

- `POST /auth/webhook` - Clerk webhook handler
- `GET /auth/verify` - Verify authentication

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `PUT /users/me/onboard` - Complete onboarding
- `GET /users/me/settings` - Get user settings
- `PUT /users/me/settings` - Update user settings
- `GET /users/me/goals` - Get user goals

### Home

- `GET /home/agenda` - Get personalized home screen data

### Content

- `GET /content/explore` - Get explore screen content
- `GET /content/library` - Get library content
- `GET /content/{id}` - Get specific content

### Activity

- `POST /activity/log` - Log completed activity
- `GET /activity/logs` - Get activity history
- `POST /activity/journal` - Create journal entry
- `GET /activity/journal` - Get journal entries

### AI

- `POST /ai/smartwatch-sync` - Sync wearable data
- `GET /ai/analysis` - Get AI analysis overview
- `GET /ai/recommendations` - Get personalized recommendations
- `GET /ai/wellness-score` - Get wellness score

### Chat

- `WS /chat/ws/{room}` - WebSocket chat endpoint
- `GET /chat/rooms/{room}/messages` - Get chat history
- `GET /chat/rooms` - Get user's chat rooms

## Database Schema

The application uses the following main models:

- **User**: User profiles and authentication
- **Goal**: Available wellness goals
- **UserGoal**: User-goal relationships
- **UserSettings**: User preferences and settings
- **Content**: Wellness content (videos, articles, etc.)
- **ActivityLog**: User activity tracking
- **JournalEntry**: User journal entries with sentiment analysis
- **MoodLog**: Wearable device data and mood scores
- **ChatMessage**: Real-time chat messages

## AI Features

### Sentiment Analysis

- Uses VADER sentiment analyzer for journal entries
- Provides sentiment scores from -1.0 to 1.0
- Runs as background tasks for performance

### Mood Analysis

- Analyzes wearable data (heart rate, HRV, stress levels)
- Calculates mood scores from 0.0 to 1.0
- Considers multiple biometric factors

### Recommendations

- Personalized content recommendations based on:
  - User goals
  - Recent mood and sentiment data
  - Activity history
  - Popular content

## WebSocket Chat

The chat system supports:

- Real-time messaging
- Multiple chat rooms
- Message persistence
- Connection management
- User presence tracking

## Development Workflow

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run tests with coverage
pytest --cov=app
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history
```

### Code Formatting and Linting

```bash
# Install development tools
pip install black isort flake8

# Format code
black app/
isort app/

# Lint code
flake8 app/
```

### Adding New Endpoints

1. Create endpoint in appropriate file in `app/api/endpoints/`
2. Add router to `app/api/main.py`
3. Update schemas in `app/db/schemas.py` if needed
4. Add any new models to `app/db/models.py`
5. Create and run migrations if needed

### Debugging

The application runs in debug mode by default. You can:

- Set breakpoints in your IDE
- Use `print()` statements (they'll appear in the console)
- Check the logs in the terminal where you started the server

## Troubleshooting

### Common Issues

**Database Connection Error**:
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify database and user exist

**Port Already in Use**:
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Redis Connection Error** (if using Celery):
- Ensure Redis is running
- Check your `REDIS_URL` in `.env`
- Redis is optional for basic functionality

**Clerk Authentication Issues**:
- Verify your Clerk credentials in `.env`
- Check Clerk dashboard for correct keys
- Ensure webhook endpoints are properly configured

### Reset Database

```bash
# Drop and recreate database
dropdb uplook_db
createdb uplook_db
alembic upgrade head
```

### Clean Start

```bash
# Stop all services
docker-compose down -v  # if using Docker

# Remove virtual environment
rm -rf venv

# Start fresh
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Production Deployment

For production deployment, see the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions on:

- AWS deployment
- Docker deployment
- Environment configuration
- Security best practices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
