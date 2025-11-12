#!/usr/bin/env bash
set -euo pipefail

# Usage: ./setup_nginx.sh [domain]
# Example: ./setup_nginx.sh nof1.coke-twitter.com

DOMAIN="${1:-nof1.coke-twitter.com}"
APP_DIR="/opt/nof1-app"
BACKEND_PORT="${PORT:-3001}"

echo "============================================"
echo "Setting up Nginx for ${DOMAIN}"
echo "============================================"

# Create Nginx configuration
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

echo "Creating Nginx configuration at ${NGINX_CONF}..."

sudo tee "${NGINX_CONF}" > /dev/null <<-'NGINXCONF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    # Frontend - serve static files
    root /opt/nof1-app/frontend/dist;
    index index.html;

    # Logging
    access_log /var/log/nginx/nof1-access.log;
    error_log /var/log/nginx/nof1-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # API proxy
    location /api {
        proxy_pass http://localhost:BACKEND_PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:BACKEND_PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Frontend routing - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXCONF

# Replace placeholders
sudo sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "${NGINX_CONF}"
sudo sed -i "s/BACKEND_PORT_PLACEHOLDER/${BACKEND_PORT}/g" "${NGINX_CONF}"

# Enable the site
echo "Enabling site..."
sudo ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}"

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

# Ensure Nginx is enabled and started
sudo systemctl enable nginx
sudo systemctl start nginx || true

echo "============================================"
echo "HTTP setup complete for ${DOMAIN}"
echo "============================================"

# Setup HTTPS with Let's Encrypt
echo ""
echo "Setting up HTTPS with Let's Encrypt..."
echo "⚠️  Make sure DNS is pointing to this server before continuing!"
read -p "Press Enter to continue with SSL setup, or Ctrl+C to cancel..."

# Obtain SSL certificate
sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email || {
    echo "⚠️  Certbot failed. You may need to:"
    echo "    1. Ensure DNS is properly configured"
    echo "    2. Run manually: sudo certbot --nginx -d ${DOMAIN}"
    exit 1
}

# Test automatic renewal
sudo certbot renew --dry-run

echo "============================================"
echo "HTTPS setup complete!"
echo "============================================"
echo "Your site should now be accessible at:"
echo "  https://${DOMAIN}"
echo ""
echo "Nginx configuration: ${NGINX_CONF}"
echo "SSL certificate auto-renewal is configured"
echo "============================================"
