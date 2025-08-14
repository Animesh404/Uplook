#!/usr/bin/env python3
"""
Seed script to populate the database with initial content for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal
from app.db.models import Base, Content, ContentTypeEnum, CategoryEnum

def create_sample_content(db: Session):
    """Create sample content for testing"""
    
    sample_contents = [
        {
            "title": "Morning Meditation",
            "description": "Start your day with a peaceful 10-minute guided meditation session. Focus on breathing and mindfulness to set a positive tone for your day.",
            "content_type": ContentTypeEnum.MEDITATION,
            "category": CategoryEnum.ANXIETY,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        },
        {
            "title": "Evening Wind Down",
            "description": "Relaxing meditation to help you unwind and prepare for restful sleep.",
            "content_type": ContentTypeEnum.MEDITATION,
            "category": CategoryEnum.SLEEP,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
        },
        {
            "title": "Confidence Building Workshop",
            "description": "Interactive video workshop to help build self-confidence and overcome self-doubt.",
            "content_type": ContentTypeEnum.VIDEO,
            "category": CategoryEnum.SELF_CONFIDENCE,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
        },
        {
            "title": "Productivity Techniques",
            "description": "Learn effective techniques to boost your productivity and manage your time better at work.",
            "content_type": ContentTypeEnum.VIDEO,
            "category": CategoryEnum.WORK,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
        },
        {
            "title": "Sleep Sounds: Ocean Waves",
            "description": "Calming ocean wave sounds to help you fall asleep and stay asleep throughout the night.",
            "content_type": ContentTypeEnum.MUSIC,
            "category": CategoryEnum.SLEEP,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        },
        {
            "title": "Anxiety Relief Music",
            "description": "Soothing instrumental music designed to reduce anxiety and promote relaxation.",
            "content_type": ContentTypeEnum.MUSIC,
            "category": CategoryEnum.ANXIETY,
            "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
        },
        {
            "title": "Gratitude Practice Guide",
            "description": "Learn how to cultivate gratitude and develop a more positive mindset through daily practices.",
            "content_type": ContentTypeEnum.LEARNING_MODULE,
            "category": CategoryEnum.SELF_CONFIDENCE,
            "url": "https://example.com/gratitude-guide",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg"
        },
        {
            "title": "Stress Management Quiz",
            "description": "Test your knowledge about stress management techniques and learn new strategies.",
            "content_type": ContentTypeEnum.QUIZ,
            "category": CategoryEnum.ANXIETY,
            "url": "https://example.com/stress-quiz",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg"
        },
        {
            "title": "The Science of Sleep",
            "description": "Comprehensive article about sleep cycles, importance of sleep, and tips for better sleep hygiene.",
            "content_type": ContentTypeEnum.ARTICLE,
            "category": CategoryEnum.SLEEP,
            "url": "https://example.com/sleep-science",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        },
        {
            "title": "Building Resilience at Work",
            "description": "Article about developing mental resilience and coping strategies for workplace challenges.",
            "content_type": ContentTypeEnum.ARTICLE,
            "category": CategoryEnum.WORK,
            "url": "https://example.com/work-resilience",
            "thumbnail_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
        }
    ]
    
    # Check if content already exists
    existing_content = db.query(Content).first()
    if existing_content:
        print("Content already exists, skipping seed...")
        return
    
    # Create content
    for content_data in sample_contents:
        content = Content(**content_data)
        db.add(content)
    
    db.commit()
    print(f"Successfully created {len(sample_contents)} content items!")

def main():
    """Main function to seed the database"""
    print("Starting database seeding...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        create_sample_content(db)
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
