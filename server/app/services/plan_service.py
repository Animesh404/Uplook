from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.models import (
    User, Plan, PlanCard, Content, CategoryEnum, ContentTypeEnum, 
    PlanStatusEnum, Goal, UserGoal
)


class PlanService:
    """Service for managing personalized learning plans"""
    
    # Goal-to-content mapping templates
    GOAL_CONTENT_TEMPLATES = {
        "Meditation": {
            "category": CategoryEnum.ANXIETY,
            "content_types": [ContentTypeEnum.MEDITATION, ContentTypeEnum.VIDEO],
            "daily_target": 3,
            "description": "Daily meditation practice for mindfulness and inner peace"
        },
        "Exercise": {
            "category": CategoryEnum.WORK,
            "content_types": [ContentTypeEnum.VIDEO, ContentTypeEnum.LEARNING_MODULE],
            "daily_target": 2,
            "description": "Physical wellness and movement activities"
        },
        "Sleep": {
            "category": CategoryEnum.SLEEP,
            "content_types": [ContentTypeEnum.MUSIC, ContentTypeEnum.MEDITATION],
            "daily_target": 4,
            "description": "Improve sleep quality and bedtime routines"
        },
        "Stress Management": {
            "category": CategoryEnum.ANXIETY,
            "content_types": [ContentTypeEnum.VIDEO, ContentTypeEnum.MEDITATION],
            "daily_target": 3,
            "description": "Learn techniques to manage and reduce stress"
        },
        "Gratitude": {
            "category": CategoryEnum.SELF_CONFIDENCE,
            "content_types": [ContentTypeEnum.LEARNING_MODULE, ContentTypeEnum.ARTICLE],
            "daily_target": 2,
            "description": "Cultivate gratitude and positive mindset"
        },
        "Self-confidence": {
            "category": CategoryEnum.SELF_CONFIDENCE,
            "content_types": [ContentTypeEnum.VIDEO, ContentTypeEnum.LEARNING_MODULE],
            "daily_target": 3,
            "description": "Build self-esteem and confidence"
        }
    }
    
    @classmethod
    async def create_plans_for_user(cls, db: Session, user: User) -> List[Plan]:
        """Create personalized plans based on user's goals"""
        plans = []
        
        # Get user's goals
        user_goals = db.query(UserGoal).join(Goal).filter(UserGoal.user_id == user.id).all()
        goal_names = [ug.goal.name for ug in user_goals]
        
        for goal_name in goal_names:
            if goal_name in cls.GOAL_CONTENT_TEMPLATES:
                template = cls.GOAL_CONTENT_TEMPLATES[goal_name]
                
                # Create plan
                plan = Plan(
                    user_id=user.id,
                    title=f"{goal_name} Journey",
                    description=template["description"],
                    category=template["category"],
                    target_daily_reviews=template["daily_target"],
                    estimated_completion_days=30,
                    status=PlanStatusEnum.ACTIVE
                )
                db.add(plan)
                db.commit()
                db.refresh(plan)
                
                # Find relevant content
                content_items = db.query(Content).filter(
                    Content.category == template["category"],
                    Content.content_type.in_(template["content_types"])
                ).limit(20).all()  # Limit to 20 items per plan
                
                # Create plan-content mappings
                for idx, content in enumerate(content_items):
                    plan_card = PlanCard(
                        plan_id=plan.id,
                        content_id=content.id,
                        # Remove flashcard fields - they're nullable
                        # Use spaced repetition for content scheduling
                        is_new=True,
                        next_review_date=datetime.now() + timedelta(days=idx // template["daily_target"])
                    )
                    db.add(plan_card)
                
                plans.append(plan)
        
        db.commit()
        return plans
    
    @classmethod
    async def get_user_agenda(cls, db: Session, user: User, target_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get personalized agenda for a specific date"""
        if not target_date:
            target_date = datetime.now().date()
        
        # Get active plans
        active_plans = db.query(Plan).filter(
            Plan.user_id == user.id,
            Plan.status == PlanStatusEnum.ACTIVE
        ).all()
        
        agenda = {
            "date": target_date.strftime("%d-%m-%Y"),
            "greeting": cls._get_greeting(),
            "user_name": user.full_name.split()[0] if user.full_name else "there",
            "daily_activities": [],
            "suggested_content": []
        }
        
        # If user has no plans, create them first
        if not active_plans:
            print(f"No active plans found for user {user.id}, creating plans...")
            active_plans = await cls.create_plans_for_user(db, user)
        
        for plan in active_plans:
            # Get content from plan cards (both new and due for review)
            today_start = datetime.combine(target_date, datetime.min.time())
            today_end = today_start + timedelta(days=1)
            
            # Get new cards that haven't been reviewed yet
            new_cards = db.query(PlanCard).join(Content).filter(
                PlanCard.plan_id == plan.id,
                PlanCard.is_new == True
            ).limit(plan.target_daily_reviews // 2).all()
            
            # Get cards due for review today
            due_cards = db.query(PlanCard).join(Content).filter(
                PlanCard.plan_id == plan.id,
                PlanCard.next_review_date <= today_end,
                PlanCard.is_new == False
            ).limit(plan.target_daily_reviews // 2).all()
            
            all_cards = new_cards + due_cards
            
            for plan_card in all_cards:
                content = plan_card.content
                activity = {
                    "id": content.id,
                    "title": content.title,
                    "description": content.description,
                    "type": content.content_type.value,
                    "category": content.category.value,
                    "url": content.url,
                    "thumbnail_url": content.thumbnail_url,
                    "plan_id": plan.id,
                    "plan_title": plan.title,
                    "is_new": plan_card.is_new,
                    "times_reviewed": plan_card.times_reviewed
                }
                agenda["daily_activities"].append(activity)
        
        # If still no activities, add some general content based on user goals
        if not agenda["daily_activities"]:
            user_goals = db.query(UserGoal).join(Goal).filter(UserGoal.user_id == user.id).all()
            goal_names = [ug.goal.name for ug in user_goals]
            
            # Get content that matches user's goals
            suggested_categories = []
            for goal_name in goal_names:
                if goal_name in cls.GOAL_CONTENT_TEMPLATES:
                    suggested_categories.append(cls.GOAL_CONTENT_TEMPLATES[goal_name]["category"])
            
            if suggested_categories:
                fallback_content = db.query(Content).filter(
                    Content.category.in_(suggested_categories)
                ).limit(4).all()
                
                for content in fallback_content:
                    activity = {
                        "id": content.id,
                        "title": content.title,
                        "description": content.description,
                        "type": content.content_type.value,
                        "category": content.category.value,
                        "url": content.url,
                        "thumbnail_url": content.thumbnail_url,
                        "plan_id": None,
                        "plan_title": "General Recommendation"
                    }
                    agenda["daily_activities"].append(activity)
        
        # Get additional suggested content based on user goals
        user_goals = db.query(UserGoal).join(Goal).filter(UserGoal.user_id == user.id).all()
        goal_categories = [cls.GOAL_CONTENT_TEMPLATES.get(ug.goal.name, {}).get("category") for ug in user_goals]
        goal_categories = [cat for cat in goal_categories if cat]
        
        if goal_categories:
            # Exclude content already in daily activities
            existing_content_ids = [activity["id"] for activity in agenda["daily_activities"]]
            suggested = db.query(Content).filter(
                Content.category.in_(goal_categories),
                ~Content.id.in_(existing_content_ids) if existing_content_ids else True
            ).order_by(func.random()).limit(6).all()
            
            for content in suggested:
                suggestion = {
                    "id": content.id,
                    "title": content.title,
                    "description": content.description,
                    "type": content.content_type.value,
                    "category": content.category.value,
                    "url": content.url,
                    "thumbnail_url": content.thumbnail_url
                }
                agenda["suggested_content"].append(suggestion)
        
        return agenda
    
    @classmethod
    def _get_greeting(cls) -> str:
        """Get time-based greeting"""
        hour = datetime.now().hour
        if hour < 12:
            return "Good morning"
        elif hour < 17:
            return "Good afternoon"
        return "Good evening"
    
    @classmethod
    async def mark_content_completed(cls, db: Session, user: User, content_id: int, plan_id: Optional[int] = None):
        """Mark content as completed and update spaced repetition schedule"""
        # Log activity
        from app.db.models import ActivityLog
        activity = ActivityLog(
            user_id=user.id,
            content_id=content_id
        )
        db.add(activity)
        
        # Update plan card if part of a plan
        if plan_id:
            plan_card = db.query(PlanCard).filter(
                PlanCard.plan_id == plan_id,
                PlanCard.content_id == content_id
            ).first()
            
            if plan_card:
                # Simple spaced repetition: mark as completed, schedule for review in 3 days
                plan_card.is_new = False
                plan_card.times_reviewed += 1
                plan_card.last_reviewed_at = datetime.now()
                plan_card.next_review_date = datetime.now() + timedelta(days=3)
        
        # Update user streak
        today = datetime.now().date()
        if user.last_activity_date and user.last_activity_date.date() == today - timedelta(days=1):
            user.current_streak += 1
        elif not user.last_activity_date or user.last_activity_date.date() != today:
            user.current_streak = 1
        
        user.last_activity_date = datetime.now()
        user.longest_streak = max(user.longest_streak, user.current_streak)
        
        db.commit()
