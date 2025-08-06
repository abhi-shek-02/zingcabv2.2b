#!/bin/bash

# 🚗 ZingCab Deployment Script
# This script automates the deployment process for ZingCab

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="zingcab"
BACKEND_PORT=3001
FRONTEND_PORT=5173
NODE_ENV=${NODE_ENV:-production}

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18+ is required. Current version: $(node -v)"
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    log "Prerequisites check passed ✓"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install backend dependencies
    if [ -f "package.json" ]; then
        npm ci --only=production
        log "Backend dependencies installed ✓"
    else
        warn "No package.json found in current directory"
    fi
    
    # Install frontend dependencies if exists
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        npm ci --only=production
        cd ..
        log "Frontend dependencies installed ✓"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Build frontend if exists
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log "Building frontend..."
        cd frontend
        npm run build
        cd ..
        log "Frontend built successfully ✓"
    fi
    
    # Build backend if build script exists
    if [ -f "package.json" ] && grep -q "\"build\"" package.json; then
        log "Building backend..."
        npm run build
        log "Backend built successfully ✓"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
        npm test
        log "Tests passed ✓"
    else
        warn "No test script found, skipping tests"
    fi
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    # Required environment variables
    REQUIRED_VARS=("NODE_ENV")
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            warn "Environment variable $var is not set"
        fi
    done
    
    # Optional but recommended
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        warn "Supabase environment variables not set. Database features may not work."
    fi
    
    log "Environment check completed ✓"
}

# Start application
start_application() {
    log "Starting application..."
    
    # Check if port is available
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        warn "Port $BACKEND_PORT is already in use. Stopping existing process..."
        pkill -f "node.*server.js" || true
        sleep 2
    fi
    
    # Start the application
    if [ "$NODE_ENV" = "production" ]; then
        log "Starting in production mode..."
        npm start &
    else
        log "Starting in development mode..."
        npm run dev &
    fi
    
    # Wait for application to start
    sleep 5
    
    # Check if application is running
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
        log "Application started successfully ✓"
        log "Backend running on http://localhost:$BACKEND_PORT"
        if [ -d "frontend" ]; then
            log "Frontend available on http://localhost:$FRONTEND_PORT"
        fi
    else
        error "Failed to start application"
    fi
}

# Setup PM2 (if available)
setup_pm2() {
    if command -v pm2 &> /dev/null; then
        log "Setting up PM2 process manager..."
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '$NODE_ENV',
      PORT: $BACKEND_PORT
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: $BACKEND_PORT
    }
  }]
};
EOF
        
        # Start with PM2
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
        
        log "PM2 setup completed ✓"
    else
        warn "PM2 not found. Install with: npm install -g pm2"
    fi
}

# Setup Nginx (if available)
setup_nginx() {
    if command -v nginx &> /dev/null; then
        log "Setting up Nginx reverse proxy..."
        
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
        root /var/www/$APP_NAME/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
        sudo nginx -t
        sudo systemctl reload nginx
        
        log "Nginx setup completed ✓"
    else
        warn "Nginx not found. Install with: sudo apt-get install nginx"
    fi
}

# Setup SSL with Let's Encrypt (if available)
setup_ssl() {
    if command -v certbot &> /dev/null; then
        log "Setting up SSL certificate..."
        
        # Replace localhost with your domain
        DOMAIN=${DOMAIN:-"your-domain.com"}
        
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        log "SSL setup completed ✓"
    else
        warn "Certbot not found. Install with: sudo apt-get install certbot python3-certbot-nginx"
    fi
}

# Main deployment function
deploy() {
    log "Starting ZingCab deployment..."
    
    check_prerequisites
    install_dependencies
    run_tests
    check_environment
    build_application
    
    # Choose deployment method
    if [ "$1" = "pm2" ]; then
        setup_pm2
    elif [ "$1" = "nginx" ]; then
        start_application
        setup_nginx
    elif [ "$1" = "ssl" ]; then
        start_application
        setup_nginx
        setup_ssl
    else
        start_application
    fi
    
    log "Deployment completed successfully! 🎉"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    if command -v pm2 &> /dev/null; then
        pm2 stop $APP_NAME-backend || true
        pm2 delete $APP_NAME-backend || true
    fi
    
    pkill -f "node.*server.js" || true
    
    log "Rollback completed ✓"
}

# Health check function
health_check() {
    log "Performing health check..."
    
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
        log "Health check passed ✓"
        return 0
    else
        error "Health check failed"
        return 1
    fi
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy [method]  Deploy the application"
    echo "                   Methods: basic, pm2, nginx, ssl"
    echo "  rollback         Rollback the deployment"
    echo "  health           Perform health check"
    echo "  test             Run tests only"
    echo "  build            Build application only"
    echo ""
    echo "Examples:"
    echo "  $0 deploy        # Basic deployment"
    echo "  $0 deploy pm2    # Deploy with PM2"
    echo "  $0 deploy nginx  # Deploy with Nginx"
    echo "  $0 deploy ssl    # Deploy with SSL"
    echo "  $0 health        # Health check"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy "${2:-basic}"
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "test")
        check_prerequisites
        install_dependencies
        run_tests
        ;;
    "build")
        check_prerequisites
        install_dependencies
        build_application
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        error "Unknown command: $1"
        usage
        ;;
esac 