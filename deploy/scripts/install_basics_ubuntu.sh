#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "Installing basics for nof1.coke-twitter.com deployment"
echo "============================================"

# Update package lists
echo "Updating package lists..."
sudo apt-get update -y

# Install Node.js 20 LTS (via NodeSource)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "Node.js already installed: $(node -v)"
fi

# Install build essentials (needed for some npm packages)
echo "Installing build essentials..."
sudo apt-get install -y build-essential

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
else
  echo "PM2 already installed: $(pm2 -v)"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt-get install -y nginx
else
  echo "Nginx already installed"
fi

# Install Certbot for Let's Encrypt SSL
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  sudo apt-get install -y certbot python3-certbot-nginx
else
  echo "Certbot already installed"
fi

# Note: MySQL and Redis are already installed on this VPS, skipping their installation

echo "============================================"
echo "Basic installation complete!"
echo "============================================"
echo "Installed versions:"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo "  PM2: $(pm2 -v)"
echo "  Nginx: $(nginx -v 2>&1 | grep -o 'nginx/[0-9.]*')"
echo "  Certbot: $(certbot --version 2>&1 | head -n1)"
echo "============================================"
