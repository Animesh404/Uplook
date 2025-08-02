from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.database import get_db
from app.db.models import CategoryEnum, Content, ContentTypeEnum, User
from app.db.schemas import Content as ContentSchema
from app.db.schemas import ContentCreate

router = APIRouter()


@router.get("/explore", response_model=List[ContentSchema])
async def get_explore_content(
    category: Optional[CategoryEnum] = Query(None, description="Filter by category"),
    content_type: Optional[ContentTypeEnum] = Query(
        None, description="Filter by content type"
    ),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get content for the Explore tab with filtering"""

    query = db.query(Content)

    if category:
        query = query.filter(Content.category == category)

    if content_type:
        query = query.filter(Content.content_type == content_type)

    content_items = query.offset(offset).limit(limit).all()

    return content_items


@router.get("/library", response_model=List[ContentSchema])
async def get_library_content(
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get learning modules for the Library tab"""

    content_items = (
        db.query(Content)
        .filter(Content.content_type == ContentTypeEnum.LEARNING_MODULE)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return content_items


@router.get("/{content_id}", response_model=ContentSchema)
async def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get specific content by ID"""

    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Content not found"
        )

    return content


@router.post("/", response_model=ContentSchema)
async def create_content(content_data: ContentCreate, db: Session = Depends(get_db)):
    """Create new content (admin function)"""

    content = Content(
        title=content_data.title,
        description=content_data.description,
        content_type=content_data.content_type,
        category=content_data.category,
        url=content_data.url,
        thumbnail_url=content_data.thumbnail_url,
    )

    db.add(content)
    db.commit()
    db.refresh(content)

    return content


@router.get("/categories/", response_model=List[str])
async def get_categories():
    """Get all available content categories"""
    return [category.value for category in CategoryEnum]


@router.get("/types/", response_model=List[str])
async def get_content_types():
    """Get all available content types"""
    return [content_type.value for content_type in ContentTypeEnum]
