#!/bin/bash

echo "🚀 Starting Uplook Development Environment"
echo "=========================================="

# ------------------------------
# 1️⃣ Check virtual environment
# ------------------------------
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-local.sh first."
    exit 1
fi

# ------------------------------
# 2️⃣ Check Python
# ------------------------------
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# ------------------------------
# 3️⃣ Set cloudflared executable
# ------------------------------
# Update this path if your installation location is different
CLOUDFLARED_EXE="C:\Program Files (x86)\cloudflared\cloudflared.exe"

if [ ! -f "$CLOUDFLARED_EXE" ]; then
    echo "❌ cloudflared not found at $CLOUDFLARED_EXE"
    exit 1
fi

# ------------------------------
# 4️⃣ Cleanup function
# ------------------------------
cleanup() {
    echo ""
    echo "🛑 Shutting down development environment..."
    kill $FASTAPI_PID $CLOUDFLARED_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# ------------------------------
# 5️⃣ Start FastAPI
# ------------------------------
echo "📡 Starting FastAPI server with virtual environment..."
if [[ "$OS" == "Windows_NT" ]]; then
    echo "💻 Detected Windows OS"
    source venv/Scripts/activate
else
    echo "💻 Detected Unix-like OS"
    source venv/bin/activate
fi
python main.py &
FASTAPI_PID=$!

# Wait a few seconds for server to start
sleep 3

# ------------------------------
# 6️⃣ Start Cloudflare Quick Tunnel
# ------------------------------
echo "🌐 Starting Cloudflare Tunnel..."
"$CLOUDFLARED_EXE" tunnel --url http://localhost:8000 --no-autoupdate > cloudflared.log 2>&1 &
CLOUDFLARED_PID=$!

# Wait for tunnel to initialize
sleep 10

# ------------------------------
# 7️⃣ Detect public URL
# ------------------------------
CLOUDFLARE_URL=$(grep -Po "https://[0-9a-zA-Z.-]+trycloudflare\.com" cloudflared.log | head -1)

if [ -z "$CLOUDFLARE_URL" ]; then
    echo "❌ Failed to get Cloudflare URL. Check cloudflared.log for errors:"
    echo "---------------------------------"
    tail -n 20 cloudflared.log
    cleanup
fi

# ------------------------------
# 8️⃣ Show info
# ------------------------------
echo ""
echo "✅ Development environment started!"
echo "=================================="
echo "🌐 FastAPI Server: http://localhost:8000"
echo "🔗 Cloudflare URL: $CLOUDFLARE_URL"
echo "📡 Webhook URL:   $CLOUDFLARE_URL/auth/webhook"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the webhook URL above"
echo "2. Go to Clerk Dashboard → Webhooks"
echo "3. Add endpoint with URL: $CLOUDFLARE_URL/auth/webhook"
echo "4. Select events: user.created, user.updated, user.deleted"
echo "5. Copy the webhook secret and update your .env file"
echo ""
echo "🔗 Clerk Dashboard: https://dashboard.clerk.com"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# ------------------------------
# 9️⃣ Keep script running
# ------------------------------
wait
