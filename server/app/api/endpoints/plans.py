from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Plan, PlanCard, ReviewSession, CardReview, ReviewResponseEnum
from app.services.spaced_repetition import SpacedRepetitionService
from app.core.security import get_current_active_user

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("/")
async def list_plans(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    """List current user's plans with simple summaries."""
    plans = db.query(Plan).filter(Plan.user_id == current_user.id).all()
    results = []
    for p in plans:
        total_cards = db.query(PlanCard).filter(PlanCard.plan_id == p.id).count()
        due_now = db.query(PlanCard).filter(PlanCard.plan_id == p.id, PlanCard.is_new == False, PlanCard.next_review_date != None).count()
        reviewed = db.query(PlanCard).filter(PlanCard.plan_id == p.id, PlanCard.times_reviewed > 0).count()
        completion = 0
        if total_cards:
            completion = int(min(100, round((reviewed / total_cards) * 100)))
        results.append({
            "id": p.id,
            "title": p.title,
            "category": p.category.value if p.category else None,
            "status": p.status.value if p.status else None,
            "cards_due": due_now,
            "total_cards": total_cards,
            "completion_percentage": completion,
        })
    return results


@router.post("/", response_model=Dict[str, Any])
async def create_plan(plan_data: Dict[str, Any], db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    plan = Plan(
        user_id=current_user.id,
        title=plan_data.get("title", "My Plan"),
        description=plan_data.get("description"),
        category=plan_data.get("category"),
        target_daily_reviews=plan_data.get("target_daily_reviews", 20),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    # Optional initial cards creation
    cards = plan_data.get("cards") or []
    for c in cards:
        card = PlanCard(
            plan_id=plan.id,
            content_id=c.get("content_id"),
            front_text=c.get("front_text"),
            back_text=c.get("back_text"),
            front_image_url=c.get("front_image_url"),
            back_image_url=c.get("back_image_url"),
            audio_url=c.get("audio_url"),
            difficulty=c.get("difficulty"),
            tags=c.get("tags") or [],
            is_new=True,
        )
        db.add(card)
    if cards:
        db.commit()
    return {"id": plan.id, "title": plan.title}


@router.get("/{plan_id}/due-cards")
async def get_due_cards(plan_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    cards = SpacedRepetitionService.get_due_cards(db, plan_id)
    # Serialize minimal card fields
    result = [
        {
            "id": c.id,
            "front_text": c.front_text,
            "back_text": c.back_text,
            "front_image_url": c.front_image_url,
            "difficulty": c.difficulty.value if c.difficulty else None,
        }
        for c in cards
    ]
    return {"cards": result, "total_due": len(result)}


@router.post("/review-session")
async def start_review_session(session_data: Dict[str, Any], db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    plan_id = session_data.get("plan_id")
    if not plan_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="plan_id required")
    session = ReviewSession(user_id=current_user.id, plan_id=plan_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id}


@router.post("/review-session/{session_id}/review")
async def submit_card_review(session_id: int, review_data: Dict[str, Any], db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    card_id = review_data.get("card_id")
    response_str = review_data.get("response")
    if card_id is None or response_str is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="card_id and response required")

    card = db.query(PlanCard).filter(PlanCard.id == card_id).first()
    session = db.query(ReviewSession).filter(ReviewSession.id == session_id).first()
    if not card or not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card or session not found")

    try:
        response_enum = ReviewResponseEnum(response_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid response value")

    sr_data = SpacedRepetitionService.calculate_next_review(card, response_enum)
    for key, value in sr_data.items():
        setattr(card, key, value)

    review = CardReview(
        session_id=session_id,
        card_id=card_id,
        response=response_enum,
        response_time_seconds=review_data.get("response_time_seconds", 0),
        was_correct=review_data.get("was_correct", True),
        confidence_level=review_data.get("confidence_level"),
        previous_ease_factor=card.ease_factor,
        previous_interval=card.interval_days,
    )
    db.add(review)
    db.commit()

    return {"success": True, "next_review_date": sr_data["next_review_date"].isoformat()}


@router.get("/{plan_id}/analytics")
async def get_plan_analytics(plan_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    # Placeholder analytics response
    total_cards = db.query(PlanCard).filter(PlanCard.plan_id == plan_id).count()
    due_now = db.query(PlanCard).filter(PlanCard.plan_id == plan_id, PlanCard.is_new == False, PlanCard.next_review_date != None).count()
    return {"total_cards": total_cards, "due_now": due_now}


