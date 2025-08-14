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


class BadgeTypeEnum(enum.Enum):
    WEEKLY_STREAK = "weekly_streak"
    MONTHLY_STREAK = "monthly_streak"
    YEARLY_STREAK = "yearly_streak"
    MEDITATION_MASTER = "meditation_master"
    FITNESS_CHAMPION = "fitness_champion"
    SLEEP_EXPERT = "sleep_expert"
    STRESS_WARRIOR = "stress_warrior"


class UserRoleEnum(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class PlanStatusEnum(enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class CardDifficultyEnum(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ReviewResponseEnum(enum.Enum):
    AGAIN = "again"
    HARD = "hard"
    GOOD = "good"
    EASY = "easy"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    email = Column(String, unique=True, nullable=False)
    onboarded = Column(Boolean, default=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.USER)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    goals = relationship("UserGoal", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    activity_logs = relationship("ActivityLog", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    mood_logs = relationship("MoodLog", back_populates="user")
    user_badges = relationship("UserBadge", back_populates="user")
    plans = relationship("Plan", back_populates="user")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    # Relationships
    user_goals = relationship("UserGoal", back_populates="goal")


class UserGoal(Base):
    __tablename__ = "user_goals"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), primary_key=True)

    # Relationships
    user = relationship("User", back_populates="goals")
    goal = relationship("Goal", back_populates="user_goals")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
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
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(Integer, ForeignKey("content.id", ondelete="CASCADE"), nullable=False)
    completed_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="activity_logs")
    content = relationship("Content", back_populates="activity_logs")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(CategoryEnum), nullable=False)
    status = Column(Enum(PlanStatusEnum), default=PlanStatusEnum.ACTIVE)
    target_daily_reviews = Column(Integer, default=20)
    estimated_completion_days = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
    last_reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="plans")
    cards = relationship("PlanCard", back_populates="plan")
    sessions = relationship("ReviewSession", back_populates="plan")


class PlanCard(Base):
    __tablename__ = "plan_cards"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    content_id = Column(Integer, ForeignKey("content.id", ondelete="CASCADE"), nullable=True)

    # Card content (custom flashcards)
    front_text = Column(Text, nullable=True)
    back_text = Column(Text, nullable=True)
    front_image_url = Column(String, nullable=True)
    back_image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)

    # Spaced repetition data
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)
    next_review_date = Column(DateTime, nullable=True)
    last_reviewed_at = Column(DateTime, nullable=True)

    # Additional metadata
    difficulty = Column(Enum(CardDifficultyEnum), default=CardDifficultyEnum.MEDIUM)
    tags = Column(JSON, default=list)
    is_new = Column(Boolean, default=True)
    times_reviewed = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    average_response_time = Column(Float, nullable=True)

    created_at = Column(DateTime, default=func.now())

    # Relationships
    plan = relationship("Plan", back_populates="cards")
    content = relationship("Content")
    reviews = relationship("CardReview", back_populates="card")


class ReviewSession(Base):
    __tablename__ = "review_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)

    started_at = Column(DateTime, default=func.now())
    ended_at = Column(DateTime, nullable=True)
    total_cards_reviewed = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    session_duration_seconds = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User")
    plan = relationship("Plan", back_populates="sessions")
    reviews = relationship("CardReview", back_populates="session")


class CardReview(Base):
    __tablename__ = "card_reviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("review_sessions.id", ondelete="CASCADE"), nullable=False)
    card_id = Column(Integer, ForeignKey("plan_cards.id", ondelete="CASCADE"), nullable=False)

    response = Column(Enum(ReviewResponseEnum), nullable=False)
    response_time_seconds = Column(Float, nullable=False)
    was_correct = Column(Boolean, nullable=False)
    confidence_level = Column(Integer, nullable=True)

    previous_ease_factor = Column(Float, nullable=True)
    previous_interval = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=func.now())

    # Relationships
    session = relationship("ReviewSession", back_populates="reviews")
    card = relationship("PlanCard", back_populates="reviews")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entry_text = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="journal_entries")


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
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


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    badge_type = Column(Enum(BadgeTypeEnum), nullable=False)
    icon_url = Column(String, nullable=True)
    requirement_value = Column(Integer, nullable=True)  # e.g., 7 for weekly streak
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, default=func.now())
    progress = Column(Integer, default=0)  # Current progress towards badge
    is_completed = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")
