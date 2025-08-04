from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database Configuration
    database_url: str = "postgresql://username:password@localhost:5432/uplook_db"

    # Clerk Configuration
    clerk_secret_key: str = "your_clerk_secret_key_here"
    clerk_webhook_secret: str = "your_clerk_webhook_secret_here"

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
