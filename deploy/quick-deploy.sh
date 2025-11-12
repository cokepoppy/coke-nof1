#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "NOF1.AI Quick Deployment Script"
echo "Domain: nof1.coke-twitter.com"
echo "============================================"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Check if running on VPS
if [ ! -f /etc/os-release ]; then
    echo "❌ This script should be run on the VPS server"
    exit 1
fi

echo "This script will:"
echo "  1. Install Node.js, PM2, Nginx, and Certbot (if needed)"
echo "  2. Initialize MySQL database (nof1_db)"
echo "  3. Deploy and build the application"
echo "  4. Configure Nginx and setup HTTPS"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Step 1: Install basics
echo ""
echo "============================================"
echo "Step 1/4: Installing dependencies..."
echo "============================================"
bash scripts/install_basics_ubuntu.sh

# Step 2: Initialize database
echo ""
echo "============================================"
echo "Step 2/4: Initializing MySQL database..."
echo "============================================"
bash scripts/init_mysql.sh

# Step 3: Deploy application
echo ""
echo "============================================"
echo "Step 3/4: Deploying application..."
echo "============================================"
bash scripts/deploy_pm2.sh

# Step 4: Setup Nginx
echo ""
echo "============================================"
echo "Step 4/4: Configuring Nginx and HTTPS..."
echo "============================================"
bash scripts/setup_nginx.sh nof1.coke-twitter.com

echo ""
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo ""
echo "Your application is now running at:"
echo "  🌐 https://nof1.coke-twitter.com"
echo ""
echo "Next steps:"
echo "  1. Review configuration:"
echo "     sudo nano /opt/nof1-app/backend/.env"
echo ""
echo "  2. Update sensitive values:"
echo "     - DB_PASSWORD"
echo "     - JWT_SECRET"
echo "     - API keys"
echo ""
echo "  3. Restart after config changes:"
echo "     pm2 restart nof1-service"
echo ""
echo "  4. Monitor logs:"
echo "     pm2 logs nof1-service"
echo ""
echo "For more information, see: deploy/DEPLOYMENT_GUIDE.md"
echo "============================================"
