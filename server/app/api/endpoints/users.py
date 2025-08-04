from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models import Goal, User, UserGoal, UserSettings
from app.db.schemas import Goal as GoalSchema
from app.db.schemas import OnboardingData
from app.db.schemas import User as UserSchema
from app.db.schemas import UserSettings as UserSettingsSchema
from app.db.schemas import UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile"""

    # Update user fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.age is not None:
        current_user.age = user_update.age

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/complete-onboarding", response_model=UserSchema)
async def complete_onboarding_simple(
    onboarding_data: OnboardingData,
    db: Session = Depends(get_db),
):
    """Complete user onboarding process (simplified for testing)"""
    
    # For now, create a user without Clerk authentication
    # TODO: Add proper Clerk authentication when webhook is working
    
    # Check if user exists by email
    existing_user = db.query(User).filter(User.email == onboarding_data.email).first()
    
    if existing_user:
        # Update existing user
        existing_user.full_name = onboarding_data.fullName
        existing_user.age = onboarding_data.age
        existing_user.onboarded = True
        current_user = existing_user
    else:
        # Create new user
        current_user = User(
            email=onboarding_data.email,
            full_name=onboarding_data.fullName,
            age=onboarding_data.age,
            onboarded=True,
            clerk_user_id=f"temp_{onboarding_data.email}"  # Temporary ID
        )
        db.add(current_user)
        db.commit()
        db.refresh(current_user)

    # Handle user goals (same as original)
    # First, remove existing goals
    db.query(UserGoal).filter(UserGoal.user_id == current_user.id).delete()

    # Add new goals
    for goal_name in onboarding_data.goals:
        # Find or create goal
        goal = db.query(Goal).filter(Goal.name == goal_name).first()
        if not goal:
            goal = Goal(name=goal_name)
            db.add(goal)
            db.commit()
            db.refresh(goal)

        # Create user-goal relationship
        user_goal = UserGoal(user_id=current_user.id, goal_id=goal.id)
        db.add(user_goal)

    # Handle user settings
    user_settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if user_settings:
        user_settings.reminder_times = onboarding_data.reminderTimes
    else:
        user_settings = UserSettings(
            user_id=current_user.id, reminder_times=onboarding_data.reminderTimes
        )
        db.add(user_settings)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/me/onboard", response_model=UserSchema)
async def onboard_user(
    onboarding_data: OnboardingData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Complete user onboarding process (with Clerk authentication)"""

    # Update user basic info
    current_user.full_name = onboarding_data.full_name
    current_user.age = onboarding_data.age
    current_user.email = onboarding_data.email
    current_user.onboarded = True

    # Handle user goals
    # First, remove existing goals
    db.query(UserGoal).filter(UserGoal.user_id == current_user.id).delete()

    # Add new goals
    for goal_name in onboarding_data.goals:
        # Find or create goal
        goal = db.query(Goal).filter(Goal.name == goal_name).first()
        if not goal:
            goal = Goal(name=goal_name)
            db.add(goal)
            db.commit()
            db.refresh(goal)

        # Create user-goal relationship
        user_goal = UserGoal(user_id=current_user.id, goal_id=goal.id)
        db.add(user_goal)

    # Handle user settings
    user_settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if user_settings:
        user_settings.reminder_times = onboarding_data.reminderTimes
    else:
        user_settings = UserSettings(
            user_id=current_user.id, reminder_times=onboarding_data.reminderTimes
        )
        db.add(user_settings)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.get("/me/settings", response_model=UserSettingsSchema)
async def get_user_settings(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if not settings:
        # Create default settings if none exist
        settings = UserSettings(
            user_id=current_user.id,
            reminder_times={"morning": True, "noon": False, "evening": False},
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/me/settings", response_model=UserSettingsSchema)
async def update_user_settings(
    settings_update: UserSettingsSchema,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current user's settings"""

    settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if not settings:
        settings = UserSettings(
            user_id=current_user.id, reminder_times=settings_update.reminder_times
        )
        db.add(settings)
    else:
        settings.reminder_times = settings_update.reminder_times

    db.commit()
    db.refresh(settings)

    return settings


@router.get("/me/goals", response_model=List[GoalSchema])
async def get_user_goals(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's goals"""

    user_goals = (
        db.query(UserGoal).join(Goal).filter(UserGoal.user_id == current_user.id).all()
    )

    return [user_goal.goal for user_goal in user_goals]


@router.get("/goals", response_model=List[GoalSchema])
async def get_available_goals(db: Session = Depends(get_db)):
    """Get all available goals"""

    goals = db.query(Goal).all()
    return goals


@router.post("/goals", response_model=GoalSchema)
async def create_goal(goal_name: str, db: Session = Depends(get_db)):
    """Create a new goal (admin function)"""

    # Check if goal already exists
    existing_goal = db.query(Goal).filter(Goal.name == goal_name).first()
    if existing_goal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Goal already exists"
        )

    goal = Goal(name=goal_name)
    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal
