from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import JournalEntry, User
from app.core.security import get_current_user

router = APIRouter()


class JournalEntryCreate(BaseModel):
    entry_text: str


class JournalEntryResponse(BaseModel):
    id: int
    entry_text: str
    sentiment_score: float | None
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/test")
async def test_journal_endpoint():
    """Test endpoint to verify journal API is working"""
    return {"message": "Journal API is working!", "timestamp": datetime.utcnow().isoformat()}


@router.get("/mock-entries")
async def get_mock_entries():
    """Mock journal entries for testing without authentication"""
    return [
        {
            "id": 1,
            "entry_text": "Today was surprisingly good. I managed to complete my meditation session and felt more centered throughout the day. The breathing exercises really helped when I felt stressed about the meeting.",
            "sentiment_score": 0.7,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": 2,
            "entry_text": "Woke up feeling anxious about the presentation. Used the mindfulness techniques to ground myself. Grateful for the tools I've learned.",
            "sentiment_score": 0.2,
            "created_at": datetime.utcnow().isoformat()
        }
    ]


@router.post("/mock-entries")
async def create_mock_entry(entry: JournalEntryCreate):
    """Mock create journal entry for testing without authentication"""
    return {
        "id": 999,
        "entry_text": entry.entry_text,
        "sentiment_score": 0.5,  # Mock sentiment score
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/entries", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all journal entries for the current user"""
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.created_at.desc()).all()
    return entries


@router.post("/entries", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new journal entry"""
    # Create journal entry
    db_entry = JournalEntry(
        user_id=current_user.id,
        entry_text=entry.entry_text,
        sentiment_score=0.5  # TODO: Implement actual sentiment analysis
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry