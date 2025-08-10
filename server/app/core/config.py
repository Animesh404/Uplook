from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "your_database_url_here"

    # Clerk Configuration
    clerk_secret_key: str = "your_clerk_secret_key_here"
    clerk_webhook_secret: str = "your_clerk_webhook_secret_here"
    clerk_jwt_issuer: str = "your_clerk_jwt_issuer_here"
    clerk_jwt_audience: str = "authenticated"
    # Optional: set this to a PEM-encoded RSA public key to verify JWTs without JWKS
    clerk_jwt_public_key_pem: str = ""

    # AWS Configuration
    aws_access_key_id: str = "your_aws_access_key_id"
    aws_secret_access_key: str = "your_aws_secret_access_key"
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "uplook-storage"

    # Redis Configuration (for Celery)
    redis_url: str = "redis://localhost:6379/0"

    # Application Configuration
    secret_key: str = "your_secret_key_here"
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
