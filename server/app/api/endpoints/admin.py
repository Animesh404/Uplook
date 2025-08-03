from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.db.models import Content, User, UserRoleEnum, Badge
from app.db.schemas import (
    Content as ContentSchema, 
    ContentCreate, 
    Badge as BadgeSchema, 
    BadgeCreate,
    User as UserSchema
)

router = APIRouter()


@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).all()
    return users


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: UserRoleEnum,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    
    return {"message": f"User role updated to {role.value}"}


@router.get("/content", response_model=List[ContentSchema])
async def get_all_content(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all content (admin only)"""
    content = db.query(Content).all()
    return content


@router.post("/content", response_model=ContentSchema)
async def create_content(
    content_data: ContentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new content (admin only)"""
    content = Content(**content_data.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.put("/content/{content_id}", response_model=ContentSchema)
async def update_content(
    content_id: int,
    content_data: ContentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update content (admin only)"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    for field, value in content_data.dict().items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    return content


@router.delete("/content/{content_id}")
async def delete_content(
    content_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete content (admin only)"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    
    return {"message": "Content deleted successfully"}


@router.post("/upload-video")
async def upload_video(
    title: str,
    description: str,
    category: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Upload video content (admin only)"""
    # In a real implementation, you would:
    # 1. Validate file type
    # 2. Upload to cloud storage (AWS S3, etc.)
    # 3. Get the URL from cloud storage
    # 4. Create content record
    
    # For now, we'll simulate the upload
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Simulate upload URL (in real app, this would be from cloud storage)
    video_url = f"https://storage.example.com/videos/{file.filename}"
    
    content = Content(
        title=title,
        description=description,
        content_type="video",
        category=category,
        url=video_url,
        thumbnail_url=f"https://storage.example.com/thumbnails/{file.filename}.jpg"
    )
    
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return {"message": "Video uploaded successfully", "content": content}


@router.get("/badges", response_model=List[BadgeSchema])
async def get_all_badges(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all badges (admin only)"""
    badges = db.query(Badge).all()
    return badges


@router.post("/badges", response_model=BadgeSchema)
async def create_badge(
    badge_data: BadgeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new badge (admin only)"""
    badge = Badge(**badge_data.dict())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge


@router.delete("/badges/{badge_id}")
async def delete_badge(
    badge_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete badge (admin only)"""
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    
    db.delete(badge)
    db.commit()
    
    return {"message": "Badge deleted successfully"}


@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get admin analytics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.last_activity_date.isnot(None)).count()
    total_content = db.query(Content).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_content": total_content,
        "user_engagement": (active_users / total_users * 100) if total_users > 0 else 0
    }