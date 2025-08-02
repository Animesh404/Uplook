from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr

from app.db.models import CategoryEnum, ContentTypeEnum


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
    created_at: datetime

    class Config:
        from_attributes = True


# Onboarding schemas
class OnboardingData(BaseModel):
    full_name: str
    age: int
    email: EmailStr
    goals: List[str]
    reminder_times: Dict[str, bool]


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
