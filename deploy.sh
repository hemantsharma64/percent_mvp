#!/bin/bash

# Deployment helper script for Percent MVP
set -e

echo "🚀 Percent MVP Deployment Helper"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed"

# Function to setup project
setup_project() {
    echo "📦 Setting up project..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    print_status "Installing dependencies..."
    npm install
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/percent_mvp

# Development Environment
NODE_ENV=development

# OpenAI API Key (optional for full functionality)
OPENAI_API_KEY=your_openai_api_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here
EOF
        print_warning "Please edit .env file with your actual configuration"
    fi
    
    print_status "Project setup completed"
}

# Function to run development server
run_dev() {
    echo "🔧 Starting development server..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing..."
        npm install
    fi
    
    print_status "Starting development server on http://localhost:3000"
    npm run dev
}

# Function to build project
build_project() {
    echo "🏗️ Building project..."
    
    print_status "Running type check..."
    npm run check || print_warning "Type check failed - continuing with build"
    
    print_status "Building application..."
    npm run build
    
    if [ -d "dist" ]; then
        print_status "Build completed successfully!"
        echo "Build artifacts:"
        ls -la dist/
    else
        print_error "Build failed - no dist directory found"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🌐 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "Building project for production..."
    build_project
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_status "Deployment completed!"
}

# Function to check deployment status
check_deployment() {
    echo "🔍 Checking deployment status..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Please install it first."
        exit 1
    fi
    
    vercel ls
}

# Main menu
show_menu() {
    echo ""
    echo "Please choose an option:"
    echo "1) Setup project (install dependencies, create .env)"
    echo "2) Run development server"
    echo "3) Build project"
    echo "4) Deploy to Vercel"
    echo "5) Check deployment status"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            setup_project
            ;;
        2)
            run_dev
            ;;
        3)
            build_project
            ;;
        4)
            deploy_vercel
            ;;
        5)
            check_deployment
            ;;
        6)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-6."
            show_menu
            ;;
    esac
}

# Check if arguments were passed
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        "setup")
            setup_project
            ;;
        "dev")
            run_dev
            ;;
        "build")
            build_project
            ;;
        "deploy")
            deploy_vercel
            ;;
        "status")
            check_deployment
            ;;
        *)
            echo "Usage: $0 [setup|dev|build|deploy|status]"
            exit 1
            ;;
    esac
fi