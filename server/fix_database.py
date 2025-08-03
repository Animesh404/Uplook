#!/usr/bin/env python3
"""
Quick fix to add missing columns to the users table
"""

from sqlalchemy import text, create_engine
from app.core.config import settings

def fix_database():
    """Add missing columns to users table"""
    
    # Create synchronous engine
    sync_engine = create_engine(settings.database_url.replace('+asyncpg', ''))
    
    with sync_engine.begin() as conn:
        try:
            # Add role column (using string instead of enum for simplicity)
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'"))
            print("✅ Added role column")
            
            # Add streak columns
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0"))
            print("✅ Added current_streak column")
            
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0"))
            print("✅ Added longest_streak column")
            
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP"))
            print("✅ Added last_activity_date column")
            
            print("\n🎉 Database columns added successfully!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    fix_database()