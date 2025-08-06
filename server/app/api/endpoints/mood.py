from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import MoodLog, User
from app.core.security import get_current_user

router = APIRouter()


class MoodLogCreate(BaseModel):
    mood_rating: int
    note: str | None = None


class MoodLogResponse(BaseModel):
    id: int
    mood_rating: int
    note: str | None
    timestamp: datetime
    
    class Config:
        from_attributes = True


@router.get("/test")
async def test_mood_endpoint():
    """Test endpoint to verify mood API is working"""
    return {"message": "Mood API is working!", "timestamp": datetime.utcnow().isoformat()}


@router.get("/mock-logs")
async def get_mock_logs():
    """Mock mood logs for testing without authentication"""
    return [
        {
            "id": 1,
            "mood_rating": 4,
            "note": "Feeling good after meditation",
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "id": 2,
            "mood_rating": 3,
            "note": "Okay day, some stress",
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "id": 3,
            "mood_rating": 5,
            "note": "Great day!",
            "timestamp": datetime.utcnow().isoformat()
        }
    ]


@router.post("/mock-logs")
async def create_mock_log(mood: MoodLogCreate):
    """Mock create mood log for testing without authentication"""
    return {
        "id": 999,
        "mood_rating": mood.mood_rating,
        "note": mood.note,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/logs", response_model=List[MoodLogResponse])
async def get_mood_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all mood logs for the current user"""
    logs = db.query(MoodLog).filter(MoodLog.user_id == current_user.id).order_by(MoodLog.timestamp.desc()).all()
    return logs


@router.post("/logs", response_model=MoodLogResponse)
async def create_mood_log(
    mood: MoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new mood log"""
    # Create mood log
    db_mood = MoodLog(
        user_id=current_user.id,
        raw_sensor_data={"mood_rating": mood.mood_rating, "note": mood.note or ""},
        calculated_mood_score=mood.mood_rating / 5.0  # Normalize to 0-1 scale
    )
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    
    # Return in expected format
    return {
        "id": db_mood.id,
        "mood_rating": mood.mood_rating,
        "note": mood.note,
        "timestamp": db_mood.timestamp
    }