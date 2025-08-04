#!/bin/bash

echo "🚀 Setting up Clerk Authentication for Uplook FastAPI Backend"
echo "=============================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/uplook_db

# Application Configuration
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
DEBUG=true

# AWS Configuration (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=uplook-storage

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Update the .env file with your actual Clerk keys"
echo "2. Start your FastAPI server: python main.py"
echo "3. Configure webhook in Clerk Dashboard:"
echo "   - URL: http://localhost:8000/auth/webhook"
echo "   - Events: user.created, user.updated, user.deleted"
echo ""
echo "🔗 Clerk Dashboard: https://dashboard.clerk.com"
echo "📚 Setup Guide: ../CLERK_SETUP.md"
echo ""
echo "✨ Setup complete! Happy coding!" 