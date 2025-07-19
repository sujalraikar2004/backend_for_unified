#!/bin/bash

# Unified Student Community Backend Deployment Script

echo "🚀 Deploying Unified Student Community Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building and deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel Dashboard:"
echo "   - MONGODB_URI"
echo "   - EMAIL_USER" 
echo "   - EMAIL_PASS"
echo ""
echo "2. Update your frontend API base URL to use the Vercel deployment URL"
echo ""
echo "🌐 Your backend is now live on Vercel!"
