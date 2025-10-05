# server/scripts/add_content.py

import sys
from pathlib import Path

# Add the server directory to Python path
server_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(server_dir))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Content, ContentTypeEnum, CategoryEnum
from datetime import datetime

# List of mock contents to add
mock_contents = [
    {
        "title": "Morning Meditation",
        "description": "Start your day with a peaceful 10-minute guided meditation session.",
        "content_type": ContentTypeEnum.MEDITATION,
        "category": CategoryEnum.ANXIETY,
        "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "thumbnail_url": "https://example.com/thumb1.jpg",
    },
    {
        "title": "Gratitude Journal",
        "description": "Reflect on what you're grateful for today.",
        "content_type": ContentTypeEnum.LEARNING_MODULE,
        "category": CategoryEnum.SELF_CONFIDENCE,
        "url": "https://example.com/journal",
    },
    {
        "title": "Relaxing Sleep Music",
        "description": "Unwind with calming instrumental music designed to help you fall asleep.",
        "content_type": ContentTypeEnum.MUSIC,
        "category": CategoryEnum.SLEEP,
        "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
]

def add_content(db: Session):
    for item in mock_contents:
        # Check if content already exists by title
        existing = db.query(Content).filter(Content.title == item["title"]).first()
        if existing:
            print(f"Content already exists: {item['title']}")
            continue

        content = Content(
            title=item["title"],
            description=item.get("description"),
            content_type=item["content_type"],
            category=item["category"],
            url=item["url"],
            thumbnail_url=item.get("thumbnail_url"),
            created_at=datetime.utcnow()
        )
        db.add(content)
        print(f"Added content: {item['title']}")
    db.commit()
    print("All content added successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        add_content(db)
    finally:
        db.close()