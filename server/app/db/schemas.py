from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr

from app.db.models import CategoryEnum, ContentTypeEnum, BadgeTypeEnum, UserRoleEnum


# Base schemas
class UserBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    email: EmailStr


class UserCreate(UserBase):
    clerk_user_id: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None


class User(UserBase):
    id: int
    clerk_user_id: str
    onboarded: bool
    role: UserRoleEnum
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Onboarding schemas
class OnboardingData(BaseModel):
    fullName: str
    age: int
    email: EmailStr
    goals: List[str]
    reminderTimes: List[str]  # Frontend sends: ["morning", "evening"]


# Goal schemas
class GoalBase(BaseModel):
    name: str


class Goal(GoalBase):
    id: int

    class Config:
        from_attributes = True


# User Settings schemas
class UserSettingsBase(BaseModel):
    reminder_times: Dict[str, bool]


class UserSettingsCreate(UserSettingsBase):
    user_id: int


class UserSettings(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# Content schemas
class ContentBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentTypeEnum
    category: CategoryEnum
    url: str
    thumbnail_url: Optional[str] = None


class ContentCreate(ContentBase):
    pass


class Content(ContentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Activity Log schemas
class ActivityLogBase(BaseModel):
    content_id: int


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLog(ActivityLogBase):
    id: int
    user_id: int
    completed_at: datetime

    class Config:
        from_attributes = True


# Journal Entry schemas
class JournalEntryBase(BaseModel):
    entry_text: str


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntry(JournalEntryBase):
    id: int
    user_id: int
    sentiment_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Mood Log schemas
class MoodLogBase(BaseModel):
    raw_sensor_data: Dict[str, Any]


class MoodLogCreate(MoodLogBase):
    pass


class MoodLog(MoodLogBase):
    id: int
    user_id: int
    timestamp: datetime
    calculated_mood_score: Optional[float] = None

    class Config:
        from_attributes = True


# Chat Message schemas
class ChatMessageBase(BaseModel):
    chat_room: str
    message: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessage(ChatMessageBase):
    id: int
    sender_clerk_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


# Response schemas
class HomeAgenda(BaseModel):
    daily_wrap_up: Dict[str, Any]
    todays_agenda: List[Content]
    progress_summary: Dict[str, Any]


class AIAnalysis(BaseModel):
    sentiment_trends: List[Dict[str, Any]]
    mood_trends: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[str]


class Recommendation(BaseModel):
    content: Content
    reason: str
    priority: int


# Badge schemas
class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    badge_type: BadgeTypeEnum
    icon_url: Optional[str] = None
    requirement_value: Optional[int] = None


class BadgeCreate(BadgeBase):
    pass


class Badge(BadgeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User Badge schemas
class UserBadgeBase(BaseModel):
    progress: int = 0
    is_completed: bool = False


class UserBadgeCreate(UserBadgeBase):
    user_id: int
    badge_id: int


class UserBadge(UserBadgeBase):
    id: int
    user_id: int
    badge_id: int
    earned_at: datetime
    badge: Badge

    class Config:
        from_attributes = True


# Streak schemas
class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime]
    streak_percentage: float  # Progress towards next milestone


class UserWithBadges(User):
    user_badges: List[UserBadge] = []
