from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import httpx
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User
from typing import Optional

security = HTTPBearer()


async def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT token"""
    try:
        # Get Clerk's public key to verify the token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {settings.clerk_secret_key}"}
            )
            jwks = response.json()
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience="your-app-audience",  # Replace with your actual audience
            issuer="https://your-app.clerk.accounts.dev"  # Replace with your actual issuer
        )
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = await verify_clerk_token(token)
    
    clerk_user_id = payload.get("sub")
    if clerk_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (can be extended to check if user is active/banned)"""
    return current_user


def verify_webhook_signature(payload: str, signature: str) -> bool:
    """Verify Clerk webhook signature"""
    import hmac
    import hashlib
    
    expected_signature = hmac.new(
        settings.clerk_webhook_secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature) 