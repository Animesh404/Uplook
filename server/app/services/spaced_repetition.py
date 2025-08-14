from datetime import datetime, timedelta
import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.db.models import PlanCard, ReviewResponseEnum


class SpacedRepetitionService:

    @staticmethod
    def calculate_next_review(card: PlanCard, response: ReviewResponseEnum) -> Dict[str, Any]:
        """Enhanced SM-2 style algorithm adapted for mobile review flows."""

        if response == ReviewResponseEnum.AGAIN:
            new_ease = max(1.3, card.ease_factor - 0.2)
            new_interval = 0  # review again right away
            new_repetitions = 0

        elif response == ReviewResponseEnum.HARD:
            new_ease = max(1.3, card.ease_factor - 0.15)
            new_repetitions = max(0, card.repetitions)
            if card.repetitions == 0:
                new_interval = 1
            elif card.repetitions == 1:
                new_interval = 6
            else:
                new_interval = math.ceil(card.interval_days * new_ease * 0.8)

        elif response == ReviewResponseEnum.GOOD:
            new_ease = card.ease_factor
            new_repetitions = card.repetitions + 1
            if card.repetitions == 0:
                new_interval = 1
            elif card.repetitions == 1:
                new_interval = 6
            else:
                new_interval = math.ceil(card.interval_days * new_ease)

        else:  # EASY
            new_ease = card.ease_factor + 0.15
            new_repetitions = card.repetitions + 1
            if card.repetitions == 0:
                new_interval = 4
            elif card.repetitions == 1:
                new_interval = 6
            else:
                new_interval = math.ceil(card.interval_days * new_ease * 1.3)

        next_review_date = datetime.now() + timedelta(days=new_interval)

        return {
            "ease_factor": new_ease,
            "interval_days": new_interval,
            "repetitions": new_repetitions,
            "next_review_date": next_review_date,
            "is_new": False,
            "last_reviewed_at": datetime.now(),
            "times_reviewed": (card.times_reviewed or 0) + 1,
        }

    @staticmethod
    def get_due_cards(db: Session, plan_id: int, limit: int = 50) -> List[PlanCard]:
        now = datetime.now()
        new_cards = db.query(PlanCard).filter(
            PlanCard.plan_id == plan_id,
            PlanCard.is_new == True
        ).limit(10).all()

        due_cards = db.query(PlanCard).filter(
            PlanCard.plan_id == plan_id,
            PlanCard.is_new == False,
            PlanCard.next_review_date != None,
            PlanCard.next_review_date <= now,
        ).limit(max(0, limit - len(new_cards))).all()

        return new_cards + due_cards

    @staticmethod
    def get_user_learning_stats(db: Session, user_id: int, days: int = 30) -> Dict[str, Any]:
        # TODO: implement learning analytics aggregations
        return {"days": days, "user_id": user_id}


