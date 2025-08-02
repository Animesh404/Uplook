import enum

from sqlalchemy import (JSON, Boolean, Column, DateTime, Enum, Float,
                        ForeignKey, Integer, String, Text)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


class ContentTypeEnum(enum.Enum):
    VIDEO = "video"
    MUSIC = "music"
    MEDITATION = "meditation"
    QUIZ = "quiz"
    ARTICLE = "article"
    LEARNING_MODULE = "learning_module"


class CategoryEnum(enum.Enum):
    SLEEP = "sleep"
    ANXIETY = "anxiety"
    SELF_CONFIDENCE = "self_confidence"
    WORK = "work"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    email = Column(String, unique=True, nullable=False)
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    goals = relationship("UserGoal", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    activity_logs = relationship("ActivityLog", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    mood_logs = relationship("MoodLog", back_populates="user")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    # Relationships
    user_goals = relationship("UserGoal", back_populates="goal")


class UserGoal(Base):
    __tablename__ = "user_goals"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), primary_key=True)

    # Relationships
    user = relationship("User", back_populates="goals")
    goal = relationship("Goal", back_populates="user_goals")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    reminder_times = Column(
        JSON, default={"morning": True, "noon": False, "evening": False}
    )

    # Relationships
    user = relationship("User", back_populates="settings")


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentTypeEnum), nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    activity_logs = relationship("ActivityLog", back_populates="content")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("content.id"), nullable=False)
    completed_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="activity_logs")
    content = relationship("Content", back_populates="activity_logs")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    entry_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="journal_entries")


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    raw_sensor_data = Column(JSON, nullable=False)
    calculated_mood_score = Column(Float, nullable=True)

    # Relationships
    user = relationship("User", back_populates="mood_logs")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_room = Column(String, nullable=False, index=True)
    sender_clerk_id = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())
