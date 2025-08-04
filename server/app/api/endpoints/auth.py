import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import verify_webhook_signature
from app.db.database import get_db
from app.db.models import User
from app.db.schemas import UserCreate

router = APIRouter()


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Clerk webhooks for user creation and updates"""

    # Get the raw body and signature
    body = await request.body()
    signature = request.headers.get("svix-signature", "")

    # Verify webhook signature (temporarily disabled for testing)
    # TODO: Re-enable webhook signature verification in production
    # if not verify_webhook_signature(body.decode(), signature):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature"
    #     )

    try:
        payload = json.loads(body)
        event_type = payload.get("type")
        data = payload.get("data", {})

        if event_type == "user.created":
            # Create new user in database
            user_data = UserCreate(
                clerk_user_id=data.get("id"),
                email=data.get("email_addresses", [{}])[0].get("email_address"),
                full_name=(
                    f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
                ),
            )

            # Check if user already exists
            existing_user = (
                db.query(User)
                .filter(User.clerk_user_id == user_data.clerk_user_id)
                .first()
            )

            if not existing_user:
                db_user = User(
                    clerk_user_id=user_data.clerk_user_id,
                    email=user_data.email,
                    full_name=user_data.full_name if user_data.full_name else None,
                )
                db.add(db_user)
                db.commit()
                db.refresh(db_user)

                return {"message": "User created successfully", "user_id": db_user.id}
            else:
                return {"message": "User already exists", "user_id": existing_user.id}

        elif event_type == "user.updated":
            # Update existing user
            user = db.query(User).filter(User.clerk_user_id == data.get("id")).first()
            if user:
                user.email = data.get("email_addresses", [{}])[0].get("email_address")
                first_name = data.get("first_name", "")
                last_name = data.get("last_name", "")
                user.full_name = f"{first_name} {last_name}".strip()
                db.commit()
                return {"message": "User updated successfully", "user_id": user.id}
            else:
                return {"message": "User not found", "user_id": None}

        elif event_type == "user.deleted":
            # Handle user deletion (optional - you might want to soft delete)
            user = db.query(User).filter(User.clerk_user_id == data.get("id")).first()
            if user:
                db.delete(user)
                db.commit()
                return {"message": "User deleted successfully"}
            else:
                return {"message": "User not found"}

        else:
            return {"message": f"Unhandled event type: {event_type}"}

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.get("/verify")
async def verify_auth():
    """Simple endpoint to verify authentication is working"""
    return {"message": "Authentication service is working"}
