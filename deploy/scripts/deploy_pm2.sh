#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "Deploying NOF1.AI to /opt/nof1-app"
echo "============================================"

# Configuration
APP_DIR="/opt/nof1-app"
PM2_APP_NAME="nof1-service"
BACKEND_PORT="${PORT:-3001}"

# Get the script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "Project root: ${PROJECT_ROOT}"
echo "Target directory: ${APP_DIR}"

# Create app directory if it doesn't exist
if [ ! -d "${APP_DIR}" ]; then
  echo "Creating ${APP_DIR}..."
  sudo mkdir -p "${APP_DIR}"
fi

# Copy project files to deployment directory
echo "Copying project files..."
sudo rsync -av --delete \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'logs' \
  --exclude 'db' \
  "${PROJECT_ROOT}/" "${APP_DIR}/"

# Set ownership
sudo chown -R $USER:$USER "${APP_DIR}"

cd "${APP_DIR}"

# ============================================
# Backend setup
# ============================================
echo "Setting up backend..."
cd "${APP_DIR}/backend"

# Create production .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating backend/.env for production..."
  cat > .env <<-'ENVFILE'
# Database
DB_USER=nof1_user
DB_PASSWORD=nof1_pass_prod_2024
DB_NAME=nof1_db
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET=nof1_jwt_secret_key_production_change_this
JWT_EXPIRES_IN=7d

# OpenRouter API
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Exchange API (Hyperliquid)
HYPERLIQUID_API_KEY=
HYPERLIQUID_SECRET=
HYPERLIQUID_TESTNET=true

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://nof1.coke-twitter.com
CORS_ORIGIN=https://nof1.coke-twitter.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Trading Configuration
TRADING_INTERVAL_MS=86400000
MAX_LEVERAGE=20
MAX_POSITION_RISK=0.03
ENABLE_REAL_TRADING=false
ENABLE_TRADING_JOBS=false
ENABLE_AI_TRADING=true

# CoinGecko API
COINGECKO_POLL_INTERVAL_MS=60000

# Logging
LOG_LEVEL=info
ENVFILE
  echo "⚠️  Backend .env created with default values. Please review and update!"
else
  echo "Backend .env already exists, skipping..."
fi

# Install dependencies (including dev dependencies for TypeScript compilation)
echo "Installing backend dependencies..."
npm install

# Build backend
echo "Building backend..."
npm run build

# Create logs directory
mkdir -p logs

# ============================================
# Frontend setup
# ============================================
echo "Setting up frontend..."
cd "${APP_DIR}/frontend"

# Create production .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating frontend/.env for production..."
  cat > .env <<-'ENVFILE'
VITE_API_URL=https://nof1.coke-twitter.com/api
VITE_WS_URL=wss://nof1.coke-twitter.com
ENVFILE
  echo "⚠️  Frontend .env created with default values. Please review and update!"
else
  echo "Frontend .env already exists, skipping..."
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# ============================================
# PM2 setup
# ============================================
echo "Configuring PM2..."
cd "${APP_DIR}/backend"

# Stop existing PM2 process if running
if pm2 describe "${PM2_APP_NAME}" > /dev/null 2>&1; then
  echo "Stopping existing ${PM2_APP_NAME}..."
  pm2 stop "${PM2_APP_NAME}"
  pm2 delete "${PM2_APP_NAME}"
fi

# Start the backend with PM2
echo "Starting ${PM2_APP_NAME} with PM2..."
pm2 start dist/server.js \
  --name "${PM2_APP_NAME}" \
  --cwd "${APP_DIR}/backend" \
  --log "/var/log/pm2/${PM2_APP_NAME}.log" \
  --error "/var/log/pm2/${PM2_APP_NAME}-error.log" \
  --time

# Create log directory for PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot (run only once)
if ! sudo systemctl is-enabled pm2-$USER > /dev/null 2>&1; then
  echo "Setting up PM2 startup on boot..."
  sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
  pm2 save
else
  echo "PM2 startup already configured"
fi

echo "============================================"
echo "Deployment complete!"
echo "============================================"
echo "App location: ${APP_DIR}"
echo "PM2 process name: ${PM2_APP_NAME}"
echo "Backend port: ${BACKEND_PORT}"
echo ""
echo "Useful commands:"
echo "  pm2 logs ${PM2_APP_NAME}      # View logs"
echo "  pm2 restart ${PM2_APP_NAME}   # Restart service"
echo "  pm2 status                     # Check status"
echo "============================================"
