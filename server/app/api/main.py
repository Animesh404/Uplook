from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import activity, ai, auth, chat, content, home, users, streaks, admin
from app.core.config import settings
from app.db.database import engine
from app.db.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Uplook Wellness API",
    description="Backend API for the Uplook wellness application",
    version="1.0.0",
    debug=settings.debug,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(home.router, prefix="/home", tags=["home"])
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(activity.router, prefix="/activity", tags=["activity"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(streaks.router, prefix="/streaks", tags=["streaks"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/")
async def root():
    return {"message": "Uplook Wellness API is running!", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.environment}
