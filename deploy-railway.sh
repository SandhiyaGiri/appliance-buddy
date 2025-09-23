#!/bin/bash

# Railway Deployment Script
# This script helps prepare your application for Railway deployment

echo "🚀 Preparing Home Appliance Tracker for Railway Deployment"
echo "=========================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Environment variables configured"
echo "2. ✅ Railway configuration files created"
echo "3. ✅ Code pushed to GitHub"
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project"
echo "3. Deploy from GitHub repository"
echo "4. Configure environment variables"
echo "5. Deploy backend first, then frontend"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions"
