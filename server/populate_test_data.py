#!/usr/bin/env python3
"""
Script to populate the database with test content and data for the Uplook wellness app.
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.models import (
    Base, User, Goal, UserGoal, UserSettings, Content, 
    ActivityLog, JournalEntry, MoodLog, ChatMessage,
    ContentTypeEnum, CategoryEnum, BadgeTypeEnum, UserRoleEnum
)
from app.core.config import settings

def create_test_data():
    """Create test data for the database."""
    
    # Create database engine and session
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        print("🌱 Creating test data...")
        
        # Clear existing data (optional - remove in production)
        print("🧹 Clearing existing data...")
        db.query(UserGoal).delete()
        db.query(ActivityLog).delete()
        db.query(JournalEntry).delete()
        db.query(MoodLog).delete()
        db.query(ChatMessage).delete()
        db.query(UserSettings).delete()
        db.query(Content).delete()
        db.query(Goal).delete()
        db.query(User).delete()
        
        # Create Goals
        print("🎯 Creating goals...")
        goals_data = [
            "Meditation and Mindfulness",
            "Stress Management",
            "Better Sleep",
            "Exercise and Movement",
            "Anxiety Relief",
            "Self-Confidence Building",
            "Work-Life Balance",
            "Emotional Regulation",
            "Gratitude Practice",
            "Social Connection"
        ]
        
        goals = []
        for goal_name in goals_data:
            goal = Goal(name=goal_name)
            db.add(goal)
            goals.append(goal)
        
        db.commit()
        print(f"✅ Created {len(goals)} goals")
        
        # Create Test Users
        print("👥 Creating test users...")
        users_data = [
            {
                "clerk_user_id": "user_test_1",
                "full_name": "Sarah Johnson",
                "age": 28,
                "email": "sarah@example.com",
                "onboarded": True,
                "role": UserRoleEnum.USER
            },
            {
                "clerk_user_id": "user_test_2", 
                "full_name": "Mike Chen",
                "age": 34,
                "email": "mike@example.com",
                "onboarded": True,
                "role": UserRoleEnum.USER
            },
            {
                "clerk_user_id": "admin_test_1",
                "full_name": "Admin User",
                "age": 30,
                "email": "admin@example.com",
                "onboarded": True,
                "role": UserRoleEnum.ADMIN
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Create User Goals
        print("🎯 Assigning goals to users...")
        # Sarah - meditation and stress management
        user_goal_1 = UserGoal(user_id=users[0].id, goal_id=goals[0].id)
        user_goal_2 = UserGoal(user_id=users[0].id, goal_id=goals[1].id)
        
        # Mike - sleep and exercise
        user_goal_3 = UserGoal(user_id=users[1].id, goal_id=goals[2].id)
        user_goal_4 = UserGoal(user_id=users[1].id, goal_id=goals[3].id)
        
        db.add_all([user_goal_1, user_goal_2, user_goal_3, user_goal_4])
        db.commit()
        print("✅ Assigned goals to users")
        
        # Create User Settings
        print("⚙️ Creating user settings...")
        for user in users:
            settings_obj = UserSettings(
                user_id=user.id,
                reminder_times={
                    "morning": True,
                    "noon": False,
                    "evening": True
                }
            )
            db.add(settings_obj)
        
        db.commit()
        print("✅ Created user settings")
        
        # Create Content
        print("📚 Creating content...")
        content_data = [
            # Videos
            {
                "title": "Mindful Breathing Meditation",
                "description": "A 10-minute guided meditation focusing on breath awareness and present moment attention.",
                "content_type": ContentTypeEnum.VIDEO,
                "category": CategoryEnum.ANXIETY,
                "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
            },
            {
                "title": "Body Scan Relaxation",
                "description": "Progressive muscle relaxation technique to release tension and promote deep relaxation.",
                "content_type": ContentTypeEnum.VIDEO,
                "category": CategoryEnum.SLEEP,
                "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"
            },
            {
                "title": "Confidence Building Exercises",
                "description": "Practical exercises to build self-confidence and overcome self-doubt.",
                "content_type": ContentTypeEnum.VIDEO,
                "category": CategoryEnum.SELF_CONFIDENCE,
                "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"
            },
            
            # Learning Modules
            {
                "title": "Introduction to Mindfulness",
                "description": "Learn the fundamentals of mindfulness practice and how to incorporate it into daily life.",
                "content_type": ContentTypeEnum.LEARNING_MODULE,
                "category": CategoryEnum.ANXIETY,
                "url": "/learning/mindfulness-intro",
                "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
            },
            {
                "title": "Sleep Hygiene Essentials",
                "description": "Evidence-based strategies for improving sleep quality and establishing healthy sleep habits.",
                "content_type": ContentTypeEnum.LEARNING_MODULE,
                "category": CategoryEnum.SLEEP,
                "url": "/learning/sleep-hygiene",
                "thumbnail_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500"
            },
            {
                "title": "Workplace Stress Management",
                "description": "Practical techniques for managing stress and maintaining well-being in professional environments.",
                "content_type": ContentTypeEnum.LEARNING_MODULE,
                "category": CategoryEnum.WORK,
                "url": "/learning/workplace-stress",
                "thumbnail_url": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500"
            },
            
            # Quizzes
            {
                "title": "Mindfulness Assessment",
                "description": "Test your understanding of mindfulness concepts and practices.",
                "content_type": ContentTypeEnum.QUIZ,
                "category": CategoryEnum.ANXIETY,
                "url": "/quiz/mindfulness-assessment",
                "thumbnail_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500"
            },
            {
                "title": "Sleep Quality Quiz",
                "description": "Evaluate your sleep habits and identify areas for improvement.",
                "content_type": ContentTypeEnum.QUIZ,
                "category": CategoryEnum.SLEEP,
                "url": "/quiz/sleep-quality",
                "thumbnail_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500"
            },
            
            # Music & Meditation
            {
                "title": "Ocean Waves Relaxation",
                "description": "Soothing ocean sounds to help you relax, focus, and find inner peace.",
                "content_type": ContentTypeEnum.MUSIC,
                "category": CategoryEnum.SLEEP,
                "url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                "thumbnail_url": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500"
            },
            {
                "title": "Forest Sounds for Focus",
                "description": "Natural forest ambience to enhance concentration and reduce stress.",
                "content_type": ContentTypeEnum.MUSIC,
                "category": CategoryEnum.WORK,
                "url": "https://www.soundjay.com/nature/sounds/forest-with-small-river.wav",
                "thumbnail_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500"
            },
            {
                "title": "Loving-Kindness Meditation",
                "description": "A guided meditation to cultivate compassion and self-acceptance.",
                "content_type": ContentTypeEnum.MEDITATION,
                "category": CategoryEnum.SELF_CONFIDENCE,
                "url": "/meditation/loving-kindness",
                "thumbnail_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500"
            },
            
            # Articles
            {
                "title": "The Science of Gratitude",
                "description": "Research-backed insights on how gratitude practice can improve mental health and well-being.",
                "content_type": ContentTypeEnum.ARTICLE,
                "category": CategoryEnum.SELF_CONFIDENCE,
                "url": "/article/science-of-gratitude",
                "thumbnail_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500"
            }
        ]
        
        contents = []
        for content_item in content_data:
            content = Content(**content_item)
            db.add(content)
            contents.append(content)
        
        db.commit()
        print(f"✅ Created {len(contents)} content items")
        
        # Create Activity Logs
        print("📊 Creating activity logs...")
        for i, user in enumerate(users[:2]):  # Only for first 2 users
            for j in range(5):  # 5 activities per user
                activity = ActivityLog(
                    user_id=user.id,
                    content_id=contents[j % len(contents)].id,
                    completed_at=datetime.now() - timedelta(days=j)
                )
                db.add(activity)
        
        db.commit()
        print("✅ Created activity logs")
        
        # Create Journal Entries
        print("📝 Creating journal entries...")
        journal_entries_data = [
            {
                "user_id": users[0].id,
                "entry_text": "Today was a good day. I managed to complete my morning meditation and felt more centered throughout the day. The breathing exercises really helped when I felt stressed about the upcoming presentation.",
                "sentiment_score": 0.7,
                "created_at": datetime.now() - timedelta(days=1)
            },
            {
                "user_id": users[0].id,
                "entry_text": "Feeling anxious about tomorrow's meeting. Used the mindfulness techniques to ground myself. Grateful for these tools.",
                "sentiment_score": 0.2,
                "created_at": datetime.now() - timedelta(days=2)
            },
            {
                "user_id": users[1].id,
                "entry_text": "Had trouble sleeping again last night. Going to try the sleep meditation tonight. Hope it helps.",
                "sentiment_score": -0.3,
                "created_at": datetime.now() - timedelta(days=1)
            }
        ]
        
        for entry_data in journal_entries_data:
            entry = JournalEntry(**entry_data)
            db.add(entry)
        
        db.commit()
        print("✅ Created journal entries")
        
        # Create Mood Logs
        print("😊 Creating mood logs...")
        for i, user in enumerate(users[:2]):
            for j in range(7):  # 7 days of mood data
                mood_log = MoodLog(
                    user_id=user.id,
                    timestamp=datetime.now() - timedelta(days=j),
                    raw_sensor_data={
                        "mood_rating": (j % 5) + 1,  # 1-5 scale
                        "energy_level": (j % 4) + 2,  # 2-5 scale
                        "stress_level": 5 - (j % 4),  # Inverse for variety
                        "note": f"Day {j+1} mood entry" if j % 2 == 0 else None
                    },
                    calculated_mood_score=((j % 5) + 1) / 5.0  # Normalized 0-1
                )
                db.add(mood_log)
        
        db.commit()
        print("✅ Created mood logs")
        
        # Create Chat Messages
        print("💬 Creating chat messages...")
        chat_messages_data = [
            {
                "chat_room": "wellness-chat",
                "sender_clerk_id": "user_test_1",
                "message": "Hi, I'm feeling a bit anxious today.",
                "timestamp": datetime.now() - timedelta(minutes=30)
            },
            {
                "chat_room": "wellness-chat", 
                "sender_clerk_id": "coach_bot",
                "message": "I'm sorry to hear you're feeling anxious. Would you like to try a breathing exercise?",
                "timestamp": datetime.now() - timedelta(minutes=29)
            },
            {
                "chat_room": "wellness-chat",
                "sender_clerk_id": "user_test_1", 
                "message": "Yes, that would be helpful.",
                "timestamp": datetime.now() - timedelta(minutes=28)
            }
        ]
        
        for msg_data in chat_messages_data:
            message = ChatMessage(**msg_data)
            db.add(message)
        
        db.commit()
        print("✅ Created chat messages")
        
        print("\n🎉 Test data creation completed successfully!")
        print(f"📊 Summary:")
        print(f"   • {len(goals)} goals")
        print(f"   • {len(users)} users")
        print(f"   • {len(contents)} content items")
        print(f"   • 10 activity logs")
        print(f"   • 3 journal entries")
        print(f"   • 14 mood logs")
        print(f"   • 3 chat messages")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()