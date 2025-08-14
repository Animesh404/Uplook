from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models import User
from app.services.recommendation_service import recommendation_service

router = APIRouter()


@router.get("/agenda")
async def get_user_agenda(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get user's personalized daily agenda"""
    agenda = recommendation_service.get_daily_agenda(db, current_user.id)
    return agenda


@router.post("/activity/{content_id}/complete")
async def complete_activity(
    content_id: int,
    plan_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark an activity/content as completed"""
    result = recommendation_service.mark_content_completed(db, current_user.id, content_id, plan_id)
    return result


@router.post("/create-user-plans")
async def create_user_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create personalized plans for user based on their goals"""
    result = recommendation_service.create_user_plans(db, current_user.id)
    return result


@router.get("/test-agenda/{user_id}")
async def get_test_agenda(
    user_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Test endpoint to get user's personalized daily agenda without auth"""
    agenda = recommendation_service.get_daily_agenda(db, user_id)
    return agenda