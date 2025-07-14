from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import User, MoodLog
from app.db.schemas import (
    MoodLogCreate,
    MoodLog as MoodLogSchema,
    AIAnalysis,
    Recommendation
)
from app.core.security import get_current_active_user
from app.services.ai_service import ai_service
from app.services.recommendation_service import recommendation_service

router = APIRouter()


def analyze_wearable_data_background(db: Session, mood_log_id: int):
    """Background task to analyze wearable data"""
    mood_log = db.query(MoodLog).filter(MoodLog.id == mood_log_id).first()
    if mood_log:
        mood_score = ai_service.analyze_wearable_data(mood_log.raw_sensor_data)
        mood_log.calculated_mood_score = mood_score
        db.commit()


@router.post("/smartwatch-sync", response_model=MoodLogSchema)
async def sync_smartwatch_data(
    mood_data: MoodLogCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sync smartwatch/fitness band data"""
    
    mood_log = MoodLog(
        user_id=current_user.id,
        raw_sensor_data=mood_data.raw_sensor_data
    )
    
    db.add(mood_log)
    db.commit()
    db.refresh(mood_log)
    
    # Add background task to analyze the data
    background_tasks.add_task(
        analyze_wearable_data_background,
        db,
        mood_log.id
    )
    
    return mood_log


@router.get("/analysis", response_model=AIAnalysis)
async def get_ai_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis overview"""
    
    # Get trends
    sentiment_trends = ai_service.get_sentiment_trends(db, current_user.id)
    mood_trends = ai_service.get_mood_trends(db, current_user.id)
    
    # Get insights
    insights = ai_service.generate_insights(db, current_user.id)
    
    # Get recommendations
    recommendations = recommendation_service.generate_recommendations(db, current_user.id)
    recommendation_strings = [rec['reason'] for rec in recommendations[:5]]
    
    return AIAnalysis(
        sentiment_trends=sentiment_trends,
        mood_trends=mood_trends,
        insights=insights,
        recommendations=recommendation_strings
    )


@router.get("/recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get personalized wellness recommendations"""
    
    recommendations = recommendation_service.generate_recommendations(db, current_user.id)
    
    return {
        "recommendations": recommendations,
        "total_count": len(recommendations)
    }


@router.get("/wellness-score")
async def get_wellness_score(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current wellness score"""
    
    wellness_data = ai_service.calculate_wellness_score(db, current_user.id)
    
    return wellness_data


@router.get("/insights")
async def get_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights"""
    
    insights = ai_service.generate_insights(db, current_user.id)
    
    return {
        "insights": insights,
        "generated_at": "2024-01-01T00:00:00Z"  # You can use datetime.now()
    }


@router.get("/trends/sentiment")
async def get_sentiment_trends(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get sentiment trends over time"""
    
    trends = ai_service.get_sentiment_trends(db, current_user.id, days)
    
    return {
        "trends": trends,
        "period_days": days
    }


@router.get("/trends/mood")
async def get_mood_trends(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get mood trends over time"""
    
    trends = ai_service.get_mood_trends(db, current_user.id, days)
    
    return {
        "trends": trends,
        "period_days": days
    } 