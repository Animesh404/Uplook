from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models import ActivityLog, JournalEntry, User
from app.db.schemas import ActivityLog as ActivityLogSchema
from app.db.schemas import ActivityLogCreate
from app.db.schemas import JournalEntry as JournalEntrySchema
from app.db.schemas import JournalEntryCreate
from app.services.ai_service import ai_service

router = APIRouter()


def analyze_journal_sentiment_background(db: Session, journal_entry_id: int):
    """Background task to analyze journal sentiment"""
    journal_entry = (
        db.query(JournalEntry).filter(JournalEntry.id == journal_entry_id).first()
    )
    if journal_entry:
        sentiment_score = ai_service.analyze_journal_sentiment(journal_entry.entry_text)
        journal_entry.sentiment_score = sentiment_score
        db.commit()


@router.post("/log", response_model=ActivityLogSchema)
async def log_activity(
    activity_data: ActivityLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Log a completed activity"""

    activity_log = ActivityLog(
        user_id=current_user.id, content_id=activity_data.content_id
    )

    db.add(activity_log)
    db.commit()
    db.refresh(activity_log)

    return activity_log


@router.get("/logs", response_model=List[ActivityLogSchema])
async def get_activity_logs(
    limit: int = Query(50, ge=1, le=200, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get user's activity logs"""

    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.completed_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return logs


@router.post("/journal", response_model=JournalEntrySchema)
async def create_journal_entry(
    journal_data: JournalEntryCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new journal entry"""

    journal_entry = JournalEntry(
        user_id=current_user.id, entry_text=journal_data.entry_text
    )

    db.add(journal_entry)
    db.commit()
    db.refresh(journal_entry)

    # Add background task to analyze sentiment
    background_tasks.add_task(
        analyze_journal_sentiment_background, db, journal_entry.id
    )

    return journal_entry


@router.get("/journal", response_model=List[JournalEntrySchema])
async def get_journal_entries(
    limit: int = Query(50, ge=1, le=200, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get user's journal entries"""

    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return entries


@router.get("/journal/{entry_id}", response_model=JournalEntrySchema)
async def get_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get specific journal entry"""

    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )

    if not entry:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found"
        )

    return entry


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a journal entry"""

    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )

    if not entry:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found"
        )

    db.delete(entry)
    db.commit()

    return {"message": "Journal entry deleted successfully"}
