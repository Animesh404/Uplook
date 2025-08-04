#!/bin/bash

echo "🔧 Setting up ngrok authentication"
echo "=================================="

echo "📋 Steps to set up ngrok:"
echo ""
echo "1. 🌐 Go to https://dashboard.ngrok.com/signup"
echo "   - Sign up for a free account"
echo "   - Verify your email"
echo ""
echo "2. 🔑 Get your authtoken:"
echo "   - Go to https://dashboard.ngrok.com/get-started/your-authtoken"
echo "   - Copy your authtoken (starts with '2...')"
echo ""
echo "3. ⚙️  Configure ngrok:"
echo "   - Run the command below with your actual token"
echo ""

read -p "Enter your ngrok authtoken: " NGROK_TOKEN

if [ -z "$NGROK_TOKEN" ]; then
    echo "❌ No token provided. Please run this script again with your token."
    exit 1
fi

echo ""
echo "🔧 Adding authtoken to ngrok..."
ngrok config add-authtoken "$NGROK_TOKEN"

if [ $? -eq 0 ]; then
    echo "✅ ngrok authentication successful!"
    echo ""
    echo "🚀 You can now run: ./start-dev.sh"
else
    echo "❌ Failed to add authtoken. Please check your token and try again."
    exit 1
fi 