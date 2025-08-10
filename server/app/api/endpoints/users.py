from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user, verify_clerk_token
from app.db.database import get_db
from app.db.models import Goal, User, UserGoal, UserSettings
from app.db.schemas import Goal as GoalSchema
from app.db.schemas import OnboardingData
from app.db.schemas import User as UserSchema
from app.db.schemas import UserSettings as UserSettingsSchema
from app.db.schemas import UserUpdate

router = APIRouter()
bearer_security = HTTPBearer()


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
    credentials: HTTPAuthorizationCredentials = Depends(bearer_security),
    db: Session = Depends(get_db),
):
    """Complete user onboarding using Clerk auth (creates or updates the DB user)."""

    # Verify Clerk token and extract subject (Clerk user ID)
    token = credentials.credentials
    claims = await verify_clerk_token(token)
    clerk_user_id = claims.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Prefer email from claims; fallback to form
    email_from_token = claims.get("email")
    user_email = email_from_token or onboarding_data.email
    if not user_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

    # Find existing user by clerk_user_id; if not found, create
    current_user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if current_user is None:
        # Check if an existing row with the same email exists (from older flow). Migrate it.
        existing_by_email = db.query(User).filter(User.email == user_email).first()
        if existing_by_email:
            current_user = existing_by_email
            current_user.clerk_user_id = clerk_user_id
        else:
            current_user = User(
                clerk_user_id=clerk_user_id,
                email=user_email,
                full_name=onboarding_data.fullName,
                age=onboarding_data.age,
                onboarded=True,
            )
            db.add(current_user)

    # Update user basic fields
    current_user.full_name = onboarding_data.fullName
    current_user.age = onboarding_data.age
    current_user.email = user_email
    current_user.onboarded = True

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

    # Handle user settings - convert array to dictionary format
    reminder_times_dict = {
        "morning": "morning" in onboarding_data.reminderTimes,
        "noon": "noon" in onboarding_data.reminderTimes,
        "evening": "evening" in onboarding_data.reminderTimes,
    }
    
    user_settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if user_settings:
        user_settings.reminder_times = reminder_times_dict
    else:
        user_settings = UserSettings(
            user_id=current_user.id, reminder_times=reminder_times_dict
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

    # Handle user settings - convert array to dictionary format
    reminder_times_dict = {
        "morning": "morning" in onboarding_data.reminderTimes,
        "noon": "noon" in onboarding_data.reminderTimes,
        "evening": "evening" in onboarding_data.reminderTimes,
    }
    
    user_settings = (
        db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    )

    if user_settings:
        user_settings.reminder_times = reminder_times_dict
    else:
        user_settings = UserSettings(
            user_id=current_user.id, reminder_times=reminder_times_dict
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
