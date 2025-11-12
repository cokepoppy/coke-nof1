# NOF1.AI Deployment Scripts

This directory contains deployment scripts and documentation for deploying the NOF1.AI trading platform to a VPS server.

## Quick Start

### From Local Machine

1. Upload project to VPS:
```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@107.174.39.191:/root/coke-nof1/
```

2. SSH into VPS:
```bash
ssh root@107.174.39.191
cd /root/coke-nof1/deploy
```

3. Run quick deployment:
```bash
sudo bash quick-deploy.sh
```

## Manual Deployment

If you prefer to run each step manually:

```bash
# 1. Install dependencies
sudo bash scripts/install_basics_ubuntu.sh

# 2. Setup database
sudo bash scripts/init_mysql.sh

# 3. Deploy application
sudo bash scripts/deploy_pm2.sh

# 4. Setup Nginx and HTTPS
sudo bash scripts/setup_nginx.sh nof1.coke-twitter.com
```

## Files

### Scripts
- **`quick-deploy.sh`**: One-command deployment script
- **`scripts/install_basics_ubuntu.sh`**: Installs Node.js, PM2, Nginx, Certbot
- **`scripts/init_mysql.sh`**: Creates database and user
- **`scripts/deploy_pm2.sh`**: Deploys app to `/opt/nof1-app` and configures PM2
- **`scripts/setup_nginx.sh`**: Configures Nginx and obtains SSL certificate

### Documentation
- **`DEPLOYMENT_GUIDE.md`**: Complete deployment guide with troubleshooting
- **`README.md`**: This file

## Server Details

- **Domain**: nof1.coke-twitter.com
- **Server IP**: 107.174.39.191
- **Backend Port**: 3001
- **App Directory**: /opt/nof1-app
- **PM2 Process**: nof1-service

## Prerequisites

- Ubuntu 20.04/22.04 VPS
- MySQL and Redis already installed
- Domain DNS pointing to server IP
- SSH access to server

## Post-Deployment

After deployment, remember to:

1. **Update backend configuration**:
   ```bash
   sudo nano /opt/nof1-app/backend/.env
   ```
   - Change `DB_PASSWORD`
   - Change `JWT_SECRET`
   - Add API keys

2. **Restart service**:
   ```bash
   pm2 restart nof1-service
   ```

3. **Check logs**:
   ```bash
   pm2 logs nof1-service
   ```

## Updating Application

To update the application after code changes:

```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@107.174.39.191:/root/coke-nof1/

# On VPS
cd /root/coke-nof1
sudo bash deploy/scripts/deploy_pm2.sh
```

## Useful Commands

```bash
# View logs
pm2 logs nof1-service

# Restart service
pm2 restart nof1-service

# Check status
pm2 status

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Support

For detailed instructions and troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
