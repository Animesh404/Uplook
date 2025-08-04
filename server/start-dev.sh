#!/bin/bash

echo "🚀 Starting Uplook Development Environment"
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-local.sh first."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Check if ngrok is available
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   npm install -g ngrok"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    kill $FASTAPI_PID $NGROK_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📡 Starting FastAPI server with virtual environment..."
source venv/bin/activate
python3 main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

echo "🌐 Starting ngrok tunnel..."
echo "⚠️  Note: If this is your first time using ngrok, you may need to authenticate."
echo "   Visit: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "   Then run: ngrok config add-authtoken YOUR_TOKEN"
echo ""

ngrok http 8000 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start and get the URL
sleep 5

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4 | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. This might be due to:"
    echo "   1. ngrok authentication required"
    echo "   2. ngrok is still starting up"
    echo ""
    echo "🔧 To fix ngrok authentication:"
    echo "   1. Go to: https://dashboard.ngrok.com/signup"
    echo "   2. Sign up for a free account"
    echo "   3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   4. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "🔄 Retrying in 10 seconds..."
    sleep 10
    
    # Try again
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -z "$NGROK_URL" ]; then
        echo "❌ Still failed to get ngrok URL. Please check ngrok authentication."
        cleanup
    fi
fi

echo ""
echo "✅ Development environment started!"
echo "=================================="
echo "🌐 FastAPI Server: http://localhost:8000"
echo "🔗 ngrok URL: $NGROK_URL"
echo "📡 Webhook URL: $NGROK_URL/auth/webhook"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the webhook URL above"
echo "2. Go to Clerk Dashboard → Webhooks"
echo "3. Add endpoint with URL: $NGROK_URL/auth/webhook"
echo "4. Select events: user.created, user.updated, user.deleted"
echo "5. Copy the webhook secret and update your .env file"
echo ""
echo "🔗 Clerk Dashboard: https://dashboard.clerk.com"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔍 ngrok Status: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep the script running
wait 