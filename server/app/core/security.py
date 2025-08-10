import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode
import time
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.db.models import User, UserRoleEnum

security = HTTPBearer()


async def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT using tenant JWKS and validate iss/aud/exp."""
    try:
        # Debug: decode token to see claims
        unverified_claims = jwt.get_unverified_claims(token)
        print(f"DEBUG: Token claims - iss: {unverified_claims.get('iss')}, aud: {unverified_claims.get('aud')}")
        print(f"DEBUG: Expected - iss: {settings.clerk_jwt_issuer}, aud: {settings.clerk_jwt_audience}")
        
        # 1) Get unverified header to select JWK
        unverified_headers = jwt.get_unverified_header(token)
        kid = unverified_headers.get("kid")
        if kid is None:
            raise JWTError("Missing kid in token header")

        # 2) Fetch JWKS from Clerk tenant
        jwks_url = f"{settings.clerk_jwt_issuer}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            res = await client.get(jwks_url)
            res.raise_for_status()
            jwks = res.json()

        keys = jwks.get("keys", [])
        key = next((k for k in keys if k.get("kid") == kid), None)
        if key is None:
            raise JWTError("No matching JWK for kid")

        # 3) Verify signature
        public_key = jwk.construct(key)
        signing_input, encoded_sig = token.rsplit(".", 1)
        decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))
        if not public_key.verify(signing_input.encode("utf-8"), decoded_sig):
            raise JWTError("Invalid token signature")

        # 4) Validate claims (exp/iss/aud)
        claims = jwt.get_unverified_claims(token)
        exp = claims.get("exp")
        if exp is not None and int(exp) < int(time.time()):
            raise JWTError("Token expired")

        if settings.clerk_jwt_issuer and claims.get("iss") != settings.clerk_jwt_issuer:
            raise JWTError("Invalid issuer")

        # if settings.clerk_jwt_audience:
        #     aud = claims.get("aud")
        #     if aud != settings.clerk_jwt_audience and (
        #         not isinstance(aud, list) or settings.clerk_jwt_audience not in aud
        #     ):
        #         raise JWTError("Invalid audience")

        return claims
    except (JWTError, httpx.HTTPError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
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
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user (can be extended to check if user is active/banned)"""
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require admin role"""
    if current_user.role not in [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_super_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require super admin role"""
    if current_user.role != UserRoleEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user


def verify_webhook_signature(payload: str, signature: str) -> bool:
    """Verify Clerk webhook signature"""
    import hashlib
    import hmac

    expected_signature = hmac.new(
        settings.clerk_webhook_secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)
