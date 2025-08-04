from datetime import datetime, timedelta
from typing import Any, Dict, List

import numpy as np
from sqlalchemy.orm import Session
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from app.db.models import JournalEntry, MoodLog


class AIService:
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def analyze_journal_sentiment(self, text: str) -> float:
        """
        Analyze sentiment of journal entry text
        Returns: float between -1.0 (negative) and 1.0 (positive)
        """
        scores = self.sentiment_analyzer.polarity_scores(text)
        # Use compound score which ranges from -1 to 1
        return scores["compound"]

    def analyze_wearable_data(self, raw_data: Dict[str, Any]) -> float:
        """
        Analyze raw wearable data to calculate mood score
        Returns: float between 0.0 (poor mood) and 1.0 (excellent mood)
        """
        try:
            # Extract relevant metrics
            heart_rate = raw_data.get("heart_rate", 70)
            hrv = raw_data.get("hrv", 50)  # Heart Rate Variability
            stress_level = raw_data.get("stress_level", 50)
            sleep_quality = raw_data.get("sleep_quality", 70)
            activity_level = raw_data.get("activity_level", 50)

            # Normalize values (these are example ranges, adjust based on real data)
            heart_rate_norm = self._normalize_heart_rate(heart_rate)
            hrv_norm = self._normalize_hrv(hrv)
            stress_norm = (100 - stress_level) / 100  # Invert stress (lower is better)
            sleep_norm = sleep_quality / 100
            activity_norm = min(activity_level / 100, 1.0)

            # Weighted average for mood score
            mood_score = (
                heart_rate_norm * 0.2
                + hrv_norm * 0.3
                + stress_norm * 0.25
                + sleep_norm * 0.15
                + activity_norm * 0.1
            )

            return max(0.0, min(1.0, mood_score))

        except Exception as e:
            print(f"Error analyzing wearable data: {e}")
            return 0.5  # Default neutral mood

    def _normalize_heart_rate(self, hr: float) -> float:
        """Normalize heart rate (60-100 is ideal range)"""
        if 60 <= hr <= 100:
            return 1.0
        elif hr < 60:
            return max(0.0, 0.5 + (hr - 40) / 40)
        else:
            return max(0.0, 1.0 - (hr - 100) / 50)

    def _normalize_hrv(self, hrv: float) -> float:
        """Normalize HRV (higher is generally better)"""
        return min(1.0, hrv / 100)

    def get_sentiment_trends(
        self, db: Session, user_id: int, days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get sentiment trends for the last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)

        entries = (
            db.query(JournalEntry)
            .filter(
                JournalEntry.user_id == user_id,
                JournalEntry.created_at >= cutoff_date,
                JournalEntry.sentiment_score.isnot(None),
            )
            .order_by(JournalEntry.created_at)
            .all()
        )

        trends = []
        for entry in entries:
            trends.append(
                {
                    "date": entry.created_at.date().isoformat(),
                    "sentiment_score": entry.sentiment_score,
                    "entry_length": len(entry.entry_text),
                }
            )

        return trends

    def get_mood_trends(
        self, db: Session, user_id: int, days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get mood trends for the last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)

        mood_logs = (
            db.query(MoodLog)
            .filter(
                MoodLog.user_id == user_id,
                MoodLog.timestamp >= cutoff_date,
                MoodLog.calculated_mood_score.isnot(None),
            )
            .order_by(MoodLog.timestamp)
            .all()
        )

        trends = []
        for log in mood_logs:
            trends.append(
                {
                    "date": log.timestamp.date().isoformat(),
                    "mood_score": log.calculated_mood_score,
                    "timestamp": log.timestamp.isoformat(),
                }
            )

        return trends

    def generate_insights(self, db: Session, user_id: int) -> List[str]:
        """Generate AI insights based on user data"""
        insights = []

        # Get recent sentiment and mood data
        sentiment_trends = self.get_sentiment_trends(db, user_id, 7)
        mood_trends = self.get_mood_trends(db, user_id, 7)

        if sentiment_trends:
            sentiment_scores = [t["sentiment_score"] for t in sentiment_trends]
            avg_sentiment = np.mean(sentiment_scores)
            if avg_sentiment > 0.3:
                insights.append(
                    "Your journal entries show a positive emotional trend this week!"
                )
            elif avg_sentiment < -0.3:
                insights.append(
                    "Your recent journal entries suggest some challenges. "
                    "Consider focusing on stress-reduction activities."
                )
            else:
                insights.append(
                    "Your emotional state appears balanced based on "
                    "your journal entries."
                )

        if mood_trends:
            avg_mood = np.mean([t["mood_score"] for t in mood_trends])
            if avg_mood > 0.7:
                insights.append(
                    "Your wearable data indicates excellent overall wellness!"
                )
            elif avg_mood < 0.4:
                insights.append(
                    "Your biometric data suggests elevated stress levels. "
                    "Consider meditation or relaxation exercises."
                )
            else:
                insights.append(
                    "Your biometric indicators show room for improvement "
                    "in stress management."
                )

        if not insights:
            insights.append(
                "Keep logging your activities to get personalized insights!"
            )

        return insights

    def calculate_wellness_score(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Calculate overall wellness score"""
        sentiment_trends = self.get_sentiment_trends(db, user_id, 7)
        mood_trends = self.get_mood_trends(db, user_id, 7)

        sentiment_score = 0.5  # Default neutral
        mood_score = 0.5

        if sentiment_trends:
            sentiment_scores = [t["sentiment_score"] for t in sentiment_trends]
            sentiment_score = (np.mean(sentiment_scores) + 1) / 2

        if mood_trends:
            mood_score = np.mean([t["mood_score"] for t in mood_trends])

        overall_score = (sentiment_score * 0.4 + mood_score * 0.6) * 100

        return {
            "overall_score": round(overall_score, 1),
            "sentiment_component": round(sentiment_score * 100, 1),
            "mood_component": round(mood_score * 100, 1),
            "trend": "improving" if overall_score > 60 else "needs_attention",
        }


# Global instance
ai_service = AIService()
