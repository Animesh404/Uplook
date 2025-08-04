from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models import User
from app.db.schemas import HomeAgenda
from app.services.recommendation_service import recommendation_service

router = APIRouter()


@router.get("/agenda", response_model=HomeAgenda)
async def get_home_agenda(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get personalized home screen agenda"""

    agenda_data = recommendation_service.get_daily_agenda(db, current_user.id)

    return HomeAgenda(
        daily_wrap_up=agenda_data.get("daily_wrap_up", {}),
        todays_agenda=agenda_data.get("todays_agenda", []),
        progress_summary=agenda_data.get("progress_summary", {}),
    )
