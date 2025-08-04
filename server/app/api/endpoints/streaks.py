from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import ActivityLog, Badge, User, UserBadge, BadgeTypeEnum
from app.db.schemas import StreakInfo, UserBadge as UserBadgeSchema, Badge as BadgeSchema

router = APIRouter()


@router.get("/test")
async def test_streaks_endpoint():
    """Test endpoint to verify streaks API is working"""
    return {"message": "Streaks API is working!", "timestamp": datetime.utcnow().isoformat()}


@router.get("/mock-streak")
async def get_mock_streak():
    """Mock streak endpoint for testing without authentication"""
    return {
        "current_streak": 5,
        "longest_streak": 12,
        "last_activity_date": datetime.utcnow().isoformat(),
        "streak_percentage": 71.4
    }


@router.get("/mock-badges")
async def get_mock_badges():
    """Mock badges endpoint for testing without authentication"""
    return [
        {
            "id": 1,
            "name": "Weekly Warrior",
            "description": "Complete activities for 7 consecutive days",
            "badge_type": "weekly_streak",
            "earned_at": datetime.utcnow().isoformat(),
            "is_completed": False
        },
        {
            "id": 2,
            "name": "Getting Started",
            "description": "Complete your first activity",
            "badge_type": "first_activity",
            "earned_at": datetime.utcnow().isoformat(),
            "is_completed": True
        }
    ]


@router.get("/streak", response_model=StreakInfo)
async def get_user_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's streak information"""
    streak_info = calculate_streak_info(current_user, db)
    return streak_info


@router.post("/activity")
async def log_activity(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log an activity and update streak"""
    # Create activity log
    activity_log = ActivityLog(
        user_id=current_user.id,
        content_id=content_id,
        completed_at=datetime.utcnow()
    )
    db.add(activity_log)
    
    # Update user streak
    update_user_streak(current_user, db)
    
    # Check and award badges
    check_and_award_badges(current_user, db)
    
    db.commit()
    
    return {"message": "Activity logged successfully", "streak": current_user.current_streak}


@router.get("/badges", response_model=List[UserBadgeSchema])
async def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all badges for the current user"""
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    return user_badges


@router.get("/available-badges", response_model=List[BadgeSchema])
async def get_available_badges(db: Session = Depends(get_db)):
    """Get all available badges"""
    badges = db.query(Badge).all()
    return badges


def calculate_streak_info(user: User, db: Session) -> StreakInfo:
    """Calculate streak information for a user"""
    today = datetime.utcnow().date()
    
    if not user.last_activity_date:
        return StreakInfo(
            current_streak=0,
            longest_streak=user.longest_streak,
            last_activity_date=None,
            streak_percentage=0.0
        )
    
    last_activity_date = user.last_activity_date.date()
    days_since_last_activity = (today - last_activity_date).days
    
    # If last activity was today or yesterday, streak continues
    if days_since_last_activity <= 1:
        current_streak = user.current_streak
    else:
        # Streak is broken
        current_streak = 0
        user.current_streak = 0
        db.commit()
    
    # Calculate percentage towards next milestone (7 days for weekly badge)
    streak_percentage = min((current_streak % 7) / 7.0 * 100, 100.0)
    
    return StreakInfo(
        current_streak=current_streak,
        longest_streak=user.longest_streak,
        last_activity_date=user.last_activity_date,
        streak_percentage=streak_percentage
    )


def update_user_streak(user: User, db: Session):
    """Update user's streak based on activity"""
    today = datetime.utcnow().date()
    
    if not user.last_activity_date:
        # First activity
        user.current_streak = 1
        user.last_activity_date = datetime.utcnow()
    else:
        last_activity_date = user.last_activity_date.date()
        days_since_last_activity = (today - last_activity_date).days
        
        if days_since_last_activity == 0:
            # Already logged activity today, no change to streak
            return
        elif days_since_last_activity == 1:
            # Consecutive day, increment streak
            user.current_streak += 1
            user.last_activity_date = datetime.utcnow()
        else:
            # Streak broken, reset to 1
            user.current_streak = 1
            user.last_activity_date = datetime.utcnow()
    
    # Update longest streak if current is longer
    if user.current_streak > user.longest_streak:
        user.longest_streak = user.current_streak


def check_and_award_badges(user: User, db: Session):
    """Check if user qualifies for any badges and award them"""
    current_streak = user.current_streak
    
    # Weekly streak badge (7 days)
    if current_streak >= 7:
        award_badge_if_not_exists(user, BadgeTypeEnum.WEEKLY_STREAK, db)
    
    # Monthly streak badge (30 days)
    if current_streak >= 30:
        award_badge_if_not_exists(user, BadgeTypeEnum.MONTHLY_STREAK, db)
    
    # Yearly streak badge (365 days)
    if current_streak >= 365:
        award_badge_if_not_exists(user, BadgeTypeEnum.YEARLY_STREAK, db)


def award_badge_if_not_exists(user: User, badge_type: BadgeTypeEnum, db: Session):
    """Award a badge to user if they don't already have it"""
    # Find the badge
    badge = db.query(Badge).filter(Badge.badge_type == badge_type).first()
    if not badge:
        return
    
    # Check if user already has this badge
    existing_badge = db.query(UserBadge).filter(
        UserBadge.user_id == user.id,
        UserBadge.badge_id == badge.id,
        UserBadge.is_completed == True
    ).first()
    
    if not existing_badge:
        # Award the badge
        user_badge = UserBadge(
            user_id=user.id,
            badge_id=badge.id,
            progress=badge.requirement_value or 0,
            is_completed=True,
            earned_at=datetime.utcnow()
        )
        db.add(user_badge)


def initialize_default_badges(db: Session):
    """Initialize default badges in the database"""
    default_badges = [
        {
            "name": "Weekly Warrior",
            "description": "Complete activities for 7 consecutive days",
            "badge_type": BadgeTypeEnum.WEEKLY_STREAK,
            "requirement_value": 7
        },
        {
            "name": "Monthly Master",
            "description": "Complete activities for 30 consecutive days",
            "badge_type": BadgeTypeEnum.MONTHLY_STREAK,
            "requirement_value": 30
        },
        {
            "name": "Yearly Champion",
            "description": "Complete activities for 365 consecutive days",
            "badge_type": BadgeTypeEnum.YEARLY_STREAK,
            "requirement_value": 365
        },
        {
            "name": "Meditation Master",
            "description": "Complete 50 meditation sessions",
            "badge_type": BadgeTypeEnum.MEDITATION_MASTER,
            "requirement_value": 50
        },
        {
            "name": "Fitness Champion",
            "description": "Complete 100 exercise activities",
            "badge_type": BadgeTypeEnum.FITNESS_CHAMPION,
            "requirement_value": 100
        },
        {
            "name": "Sleep Expert",
            "description": "Complete 30 sleep-related activities",
            "badge_type": BadgeTypeEnum.SLEEP_EXPERT,
            "requirement_value": 30
        },
        {
            "name": "Stress Warrior",
            "description": "Complete 25 stress management activities",
            "badge_type": BadgeTypeEnum.STRESS_WARRIOR,
            "requirement_value": 25
        }
    ]
    
    for badge_data in default_badges:
        existing_badge = db.query(Badge).filter(Badge.badge_type == badge_data["badge_type"]).first()
        if not existing_badge:
            badge = Badge(**badge_data)
            db.add(badge)
    
    db.commit()