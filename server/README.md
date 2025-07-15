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
- **Cloud Storage**: AWS S3 (configured)

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
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL
- Redis (for Celery, optional)

### Installation

1. **Clone and navigate to the server directory**:

   ```bash
   cd server
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the server directory:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/uplook_db
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=uplook-storage
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=your_secret_key
   ENVIRONMENT=development
   DEBUG=true
   ```

5. **Set up the database**:

   ```bash
   # Create PostgreSQL database
   createdb uplook_db

   # Run migrations
   alembic upgrade head
   ```

6. **Run the application**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

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

## Deployment

### AWS Deployment

1. **Set up AWS resources**:

   - RDS PostgreSQL instance
   - S3 bucket for file storage
   - ElastiCache Redis (optional)

2. **Configure environment variables** for production

3. **Deploy using your preferred method**:
   - AWS ECS/Fargate
   - AWS Lambda (with Mangum)
   - EC2 instances
   - Docker containers

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Adding New Endpoints

1. Create endpoint in appropriate file in `app/api/endpoints/`
2. Add router to `app/api/main.py`
3. Update schemas in `app/db/schemas.py` if needed
4. Add any new models to `app/db/models.py`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
