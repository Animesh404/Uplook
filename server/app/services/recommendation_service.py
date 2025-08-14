import random
from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.db.models import (ActivityLog, CategoryEnum, Content, ContentTypeEnum,
                           Goal, JournalEntry, User, UserGoal)
from app.services.ai_service import ai_service


class RecommendationService:
    def __init__(self):
        self.category_mapping = {
            "Reduce stress": CategoryEnum.ANXIETY,
            "Improve sleep": CategoryEnum.SLEEP,
            "Self-improvement": CategoryEnum.SELF_CONFIDENCE,
            "Be more mindful": CategoryEnum.ANXIETY,
            "Feel better": CategoryEnum.SELF_CONFIDENCE,
        }

    def generate_recommendations(
        self, db: Session, user_id: int
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on user data"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Get user goals
        user_goals = (
            db.query(UserGoal).join(Goal).filter(UserGoal.user_id == user_id).all()
        )
        goal_categories = [
            self.category_mapping.get(goal.goal.name, CategoryEnum.SELF_CONFIDENCE)
            for goal in user_goals
        ]

        # Get recent activity to avoid repetition
        recent_activity = (
            db.query(ActivityLog)
            .filter(
                ActivityLog.user_id == user_id,
                ActivityLog.completed_at >= datetime.now() - timedelta(days=7),
            )
            .all()
        )
        completed_content_ids = [log.content_id for log in recent_activity]

        # Get wellness score to determine recommendation priority
        wellness_data = ai_service.calculate_wellness_score(db, user_id)
        wellness_score = wellness_data["overall_score"]

        recommendations = []

        # Priority 1: Address low wellness areas
        if wellness_score < 50:
            recommendations.extend(
                self._get_urgent_recommendations(
                    db, user_id, goal_categories, completed_content_ids
                )
            )

        # Priority 2: Goal-based recommendations
        recommendations.extend(
            self._get_goal_based_recommendations(
                db, goal_categories, completed_content_ids
            )
        )

        # Priority 3: Trending/popular content
        recommendations.extend(
            self._get_popular_recommendations(db, completed_content_ids)
        )

        # Priority 4: Exploration recommendations
        recommendations.extend(
            self._get_exploration_recommendations(db, completed_content_ids)
        )

        # Remove duplicates and limit to 10 recommendations
        seen_ids = set()
        unique_recommendations = []
        for rec in recommendations:
            # rec is a dictionary with "content", "reason", and "priority" keys
            content = rec["content"]
            content_id = content.id  # content is a SQLAlchemy Content object
                
            if content_id and content_id not in seen_ids:
                seen_ids.add(content_id)
                unique_recommendations.append(rec)
                if len(unique_recommendations) >= 10:
                    break

        return unique_recommendations

    def _get_urgent_recommendations(
        self,
        db: Session,
        user_id: int,
        goal_categories: List[CategoryEnum],
        completed_ids: List[int],
    ) -> List[Dict[str, Any]]:
        """Get urgent recommendations for users with low wellness scores"""
        recommendations = []

        # Get recent mood and sentiment data
        sentiment_trends = ai_service.get_sentiment_trends(db, user_id, 7)
        mood_trends = ai_service.get_mood_trends(db, user_id, 7)

        # Recommend stress-reduction content if mood is low
        if mood_trends and any(t["mood_score"] < 0.4 for t in mood_trends[-3:]):
            stress_content = (
                db.query(Content)
                .filter(
                    and_(
                        Content.category == CategoryEnum.ANXIETY,
                        Content.content_type.in_(
                            [ContentTypeEnum.MEDITATION, ContentTypeEnum.MUSIC]
                        ),
                        ~Content.id.in_(completed_ids),
                    )
                )
                .limit(2)
                .all()
            )

            for content in stress_content:
                recommendations.append(
                    {
                        "content": content,
                        "reason": (
                            "Your recent biometric data suggests elevated stress levels"
                        ),
                        "priority": 1,
                    }
                )

        # Recommend sleep content if mentioned in journals
        if sentiment_trends:
            recent_entries = (
                db.query(JournalEntry)
                .filter(
                    JournalEntry.user_id == user_id,
                    JournalEntry.created_at >= datetime.now() - timedelta(days=7),
                )
                .all()
            )

            sleep_keywords = ["sleep", "tired", "exhausted", "insomnia", "rest"]
            if any(
                any(keyword in entry.entry_text.lower() for keyword in sleep_keywords)
                for entry in recent_entries
            ):
                sleep_content = (
                    db.query(Content)
                    .filter(
                        and_(
                            Content.category == CategoryEnum.SLEEP,
                            ~Content.id.in_(completed_ids),
                        )
                    )
                    .limit(2)
                    .all()
                )

                for content in sleep_content:
                    recommendations.append(
                        {
                            "content": content,
                            "reason": (
                                "Your journal entries suggest sleep-related concerns"
                            ),
                            "priority": 1,
                        }
                    )

        return recommendations

    def _get_goal_based_recommendations(
        self, db: Session, goal_categories: List[CategoryEnum], completed_ids: List[int]
    ) -> List[Dict[str, Any]]:
        """Get recommendations based on user goals"""
        recommendations = []

        for category in goal_categories:
            content_items = (
                db.query(Content)
                .filter(
                    and_(Content.category == category, ~Content.id.in_(completed_ids))
                )
                .limit(3)
                .all()
            )

            for content in content_items:
                recommendations.append(
                    {
                        "content": content,
                        "reason": (
                            f'Recommended based on your goal: '
                            f'{category.value.replace("_", " ").title()}'
                        ),
                        "priority": 2,
                    }
                )

        return recommendations

    def _get_popular_recommendations(
        self, db: Session, completed_ids: List[int]
    ) -> List[Dict[str, Any]]:
        """Get popular content recommendations"""
        # Get most completed content in the last 30 days
        popular_content = (
            db.query(Content)
            .join(ActivityLog)
            .filter(
                and_(
                    ActivityLog.completed_at >= datetime.now() - timedelta(days=30),
                    ~Content.id.in_(completed_ids),
                )
            )
            .group_by(Content.id)
            .order_by(func.count(ActivityLog.id).desc())
            .limit(3)
            .all()
        )

        recommendations = []
        for content in popular_content:
            recommendations.append(
                {
                    "content": content,
                    "reason": "Popular among other users",
                    "priority": 3,
                }
            )

        return recommendations

    def _get_exploration_recommendations(
        self, db: Session, completed_ids: List[int]
    ) -> List[Dict[str, Any]]:
        """Get exploration recommendations for content discovery"""
        # Get random content from different categories
        all_categories = list(CategoryEnum)
        random.shuffle(all_categories)

        recommendations = []
        for category in all_categories[:2]:  # Pick 2 random categories
            content_items = (
                db.query(Content)
                .filter(
                    and_(Content.category == category, ~Content.id.in_(completed_ids))
                )
                .limit(2)
                .all()
            )

            for content in content_items:
                recommendations.append(
                    {
                        "content": content,
                        "reason": (
                            f'Explore {category.value.replace("_", " ").title()} '
                            f'content'
                        ),
                        "priority": 4,
                    }
                )

        return recommendations

    def get_daily_agenda(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Generate daily agenda for the home screen"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        # Get wellness score
        wellness_data = ai_service.calculate_wellness_score(db, user_id)

        # Get recommended content for today
        recommendations = self.generate_recommendations(db, user_id)
        todays_content = recommendations[:4]  # Limit to 4 items for today's agenda

        # Get recent activity for progress tracking
        recent_activity = (
            db.query(ActivityLog)
            .filter(
                ActivityLog.user_id == user_id,
                ActivityLog.completed_at >= datetime.now() - timedelta(days=7),
            )
            .count()
        )

        return {
            "daily_wrap_up": {
                "wellness_score": wellness_data["overall_score"],
                "trend": wellness_data["trend"],
                "completed_activities_week": recent_activity,
            },
            "todays_agenda": [
                {
                    "id": item["content"].id,
                    "title": item["content"].title,
                    "description": item["content"].description,
                    "content_type": item["content"].content_type.value,
                    "category": item["content"].category.value,
                    "url": item["content"].url,
                    "thumbnail_url": item["content"].thumbnail_url,
                    "reason": item["reason"],
                }
                for item in todays_content
            ],
            "progress_summary": {
                "weekly_activities": recent_activity,
                "wellness_trend": wellness_data["trend"],
                "next_milestone": self._get_next_milestone(recent_activity),
            },
        }

    def _get_next_milestone(self, completed_activities: int) -> str:
        """Get next milestone message"""
        if completed_activities < 5:
            return (
                f"Complete {5 - completed_activities} more activities "
                f"to reach your weekly goal!"
            )
        elif completed_activities < 10:
            return (
                f"Great progress! {10 - completed_activities} more activities "
                f"to achieve your stretch goal!"
            )
        else:
            return "Excellent work! You've exceeded your weekly goals!"

    def mark_content_completed(self, db: Session, user_id: int, content_id: int, plan_id: int = None) -> Dict[str, Any]:
        """Mark content as completed and log activity"""
        try:
            # Log the activity - ActivityLog model doesn't have plan_id field
            activity_log = ActivityLog(
                user_id=user_id,
                content_id=content_id,
                completed_at=datetime.now(),
            )
            db.add(activity_log)
            db.commit()
            
            return {"success": True, "message": "Activity logged successfully"}
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"Failed to log activity: {str(e)}"}

    def create_user_plans(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Create initial user plans based on goals (for compatibility with existing flow)"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "message": "User not found"}
            
            # Get user goals
            user_goals = db.query(UserGoal).join(Goal).filter(UserGoal.user_id == user_id).all()
            goal_names = [ug.goal.name for ug in user_goals]
            
            if not goal_names:
                return {"success": True, "message": "No goals to create plans for", "plans": []}
            
            # For now, just return success - the recommendation service handles content dynamically
            return {
                "success": True, 
                "message": f"User plans initialized for {len(goal_names)} goals",
                "plans": [{"name": goal, "status": "active"} for goal in goal_names]
            }
        except Exception as e:
            return {"success": False, "message": f"Failed to create user plans: {str(e)}"}


# Global instance
recommendation_service = RecommendationService()
