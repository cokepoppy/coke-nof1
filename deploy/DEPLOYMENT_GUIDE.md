# Deployment Guide for nof1.coke-twitter.com

## Overview
- Runs the Node.js backend (Express + TypeScript) behind Nginx with HTTPS
- Serves React frontend (Vite build) as static files
- Uses MySQL and Redis on the VPS for persistence
- Uses PM2 for process management and auto-start on boot

## Prerequisites
- **Domain**: `nof1.coke-twitter.com` with A record pointing to your server IP: `107.174.39.191`
- **VPS OS**: Ubuntu 20.04/22.04
- **Existing Services**: MySQL and Redis are already installed and running
- **Other Sites**: Don't modify existing Nginx configs for other domains

## VPS Access
```bash
ssh root@107.174.39.191
# Password: [your-vps-password]
```

## Quick Start Deployment

### 1. Upload Project to VPS
First, from your local machine, upload the project files to the VPS:

```bash
# Option A: Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@107.174.39.191:/root/coke-nof1/

# Option B: Using scp
scp -r ./ root@107.174.39.191:/root/coke-nof1/
```

### 2. SSH into VPS
```bash
ssh root@107.174.39.191
cd /root/coke-nof1
```

### 3. Run Deployment Scripts

#### Step 1: Install basic dependencies (Node.js, PM2, Nginx, Certbot)
**Note**: MySQL and Redis are already installed, this script will skip them.

```bash
sudo bash deploy/scripts/install_basics_ubuntu.sh
```

#### Step 2: Initialize MySQL database
Creates the `nof1_db` database and `nof1_user` user:

```bash
sudo bash deploy/scripts/init_mysql.sh
```

**Important**: Note the database credentials output by this script and update them in the next step if needed.

#### Step 3: Deploy application with PM2
This will:
- Copy files to `/opt/nof1-app`
- Install dependencies for backend and frontend
- Build both backend and frontend
- Configure and start PM2 service

```bash
sudo bash deploy/scripts/deploy_pm2.sh
```

**Important**: After running this script:
1. Review and update `/opt/nof1-app/backend/.env` with your production values
2. Review and update `/opt/nof1-app/frontend/.env` if needed
3. Restart the service: `pm2 restart nof1-service`

#### Step 4: Configure Nginx and setup HTTPS
**Before running this**: Ensure DNS for `nof1.coke-twitter.com` is pointing to `107.174.39.191`

```bash
sudo bash deploy/scripts/setup_nginx.sh nof1.coke-twitter.com
```

This script will:
- Create Nginx configuration for the domain
- Enable the site
- Obtain Let's Encrypt SSL certificate
- Configure auto-renewal

### 4. Verify Deployment

Check the backend is running:
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok"} or similar
```

Check PM2 status:
```bash
pm2 status
pm2 logs nof1-service
```

Access your site:
- HTTP: http://nof1.coke-twitter.com (should redirect to HTTPS)
- HTTPS: https://nof1.coke-twitter.com

## Application Configuration

### Backend Configuration
Edit `/opt/nof1-app/backend/.env`:

```bash
sudo nano /opt/nof1-app/backend/.env
```

Key settings to review:
- `DB_PASSWORD`: Change from default
- `JWT_SECRET`: Change to a secure random string
- `OPENROUTER_API_KEY`: Add your API key
- `HYPERLIQUID_API_KEY`: Add if using real trading
- `ENABLE_REAL_TRADING`: Set to `true` only when ready
- `NODE_ENV`: Should be `production`

After changes:
```bash
pm2 restart nof1-service
```

### Frontend Configuration
Edit `/opt/nof1-app/frontend/.env` if needed:

```bash
sudo nano /opt/nof1-app/frontend/.env
```

After changes, rebuild frontend:
```bash
cd /opt/nof1-app/frontend
npm run build
```

## Technical Details

### Ports
- **Backend**: 3001 (configurable via `PORT` in backend/.env)
- **Frontend**: Served as static files by Nginx
- **Database**: MySQL on port 3306 (localhost)
- **Redis**: Port 6379 (localhost)

### File Locations
- **Application**: `/opt/nof1-app/`
- **Backend**: `/opt/nof1-app/backend/`
- **Frontend**: `/opt/nof1-app/frontend/dist/`
- **Nginx Config**: `/etc/nginx/sites-available/nof1.coke-twitter.com`
- **PM2 Logs**: `/var/log/pm2/nof1-service.log`
- **Nginx Logs**: `/var/log/nginx/nof1-*.log`

### Database
- **Database**: `nof1_db`
- **User**: `nof1_user`
- **Password**: `nof1_pass_prod_2024` (default, change in production!)

## Maintenance Commands

### View Logs
```bash
# PM2 logs (backend)
pm2 logs nof1-service

# PM2 logs (follow)
pm2 logs nof1-service --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/nof1-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/nof1-error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart nof1-service

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL (if needed)
sudo systemctl restart mysql

# Restart Redis (if needed)
sudo systemctl restart redis
```

### Update Application
When you have new code changes:

```bash
# From local machine, sync files
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@107.174.39.191:/root/coke-nof1/

# On VPS, redeploy
cd /root/coke-nof1
sudo bash deploy/scripts/deploy_pm2.sh
```

### Check Service Status
```bash
# PM2 processes
pm2 status

# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql

# Redis
sudo systemctl status redis
```

### Database Backup
```bash
# Create backup
mysqldump -u nof1_user -p nof1_db > nof1_db_backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u nof1_user -p nof1_db < nof1_db_backup_20241112.sql
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs nof1-service

# Check .env file
cat /opt/nof1-app/backend/.env

# Try starting manually
cd /opt/nof1-app/backend
node dist/server.js
```

### Frontend not displaying
```bash
# Check if build exists
ls -la /opt/nof1-app/frontend/dist/

# Rebuild frontend
cd /opt/nof1-app/frontend
npm run build

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Database connection errors
```bash
# Test MySQL connection
mysql -u nof1_user -p

# Check if database exists
mysql -u nof1_user -p -e "SHOW DATABASES;"

# Recreate database
sudo bash /root/coke-nof1/deploy/scripts/init_mysql.sh
```

### SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Re-setup SSL
sudo bash /root/coke-nof1/deploy/scripts/setup_nginx.sh nof1.coke-twitter.com
```

### Port conflicts
If port 3001 is already in use:
1. Change `PORT` in `/opt/nof1-app/backend/.env`
2. Update Nginx config: `sudo nano /etc/nginx/sites-available/nof1.coke-twitter.com`
3. Restart: `pm2 restart nof1-service && sudo systemctl reload nginx`

## Uninstall (App Only)

To remove the NOF1.AI application without affecting other services:

```bash
# Stop and remove PM2 process
pm2 stop nof1-service
pm2 delete nof1-service
pm2 save

# Remove application files
sudo rm -rf /opt/nof1-app

# Remove Nginx config
sudo rm /etc/nginx/sites-enabled/nof1.coke-twitter.com
sudo rm /etc/nginx/sites-available/nof1.coke-twitter.com
sudo systemctl reload nginx

# Optionally remove database
mysql -u root -e "DROP DATABASE IF EXISTS nof1_db; DROP USER IF EXISTS 'nof1_user'@'localhost';"
```

## Security Notes

1. **Change default passwords**: Update `DB_PASSWORD` and `JWT_SECRET` in production
2. **API Keys**: Keep your API keys secure in `.env` files
3. **Firewall**: Consider setting up UFW:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular updates**: Keep system packages updated:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

## Additional Resources

- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
