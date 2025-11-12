# Deployment Checklist for nof1.coke-twitter.com

## Pre-Deployment Checklist

- [ ] DNS A record for `nof1.coke-twitter.com` points to `107.174.39.191`
- [ ] Can SSH into VPS: `ssh root@107.174.39.191`
- [ ] MySQL is running on VPS: `sudo systemctl status mysql`
- [ ] Redis is running on VPS: `sudo systemctl status redis`
- [ ] Check existing sites won't conflict (binance.nof1.coke-twitter.com, etc.)

## Deployment Steps

### 1. Upload Project Files
From your local machine:
```bash
cd /mnt/d/home/coke-nof1
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' --exclude 'logs' \
  ./ root@107.174.39.191:/root/coke-nof1/
```
- [ ] Files uploaded successfully

### 2. SSH into VPS
```bash
ssh root@107.174.39.191
cd /root/coke-nof1
```
- [ ] Connected to VPS

### 3. Run Quick Deployment
```bash
sudo bash deploy/quick-deploy.sh
```

**Or run each step manually:**

#### 3a. Install Dependencies
```bash
sudo bash deploy/scripts/install_basics_ubuntu.sh
```
- [ ] Node.js 20 installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Certbot installed

#### 3b. Setup Database
```bash
sudo bash deploy/scripts/init_mysql.sh
```
- [ ] Database `nof1_db` created
- [ ] User `nof1_user` created
- [ ] Credentials noted

#### 3c. Deploy Application
```bash
sudo bash deploy/scripts/deploy_pm2.sh
```
- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] PM2 process started
- [ ] Check PM2 status: `pm2 status`

#### 3d. Configure Nginx
```bash
sudo bash deploy/scripts/setup_nginx.sh nof1.coke-twitter.com
```
- [ ] Nginx configured
- [ ] SSL certificate obtained
- [ ] HTTPS working

## Post-Deployment Configuration

### 4. Update Backend Configuration
```bash
sudo nano /opt/nof1-app/backend/.env
```

Update these values:
- [ ] `DB_PASSWORD` - Change from default
- [ ] `JWT_SECRET` - Change to secure random string
- [ ] `OPENROUTER_API_KEY` - Verify/update
- [ ] `NODE_ENV=production` - Verify
- [ ] `PORT=3001` - Verify
- [ ] `FRONTEND_URL=https://nof1.coke-twitter.com` - Verify
- [ ] `CORS_ORIGIN=https://nof1.coke-twitter.com` - Verify

After changes:
```bash
pm2 restart nof1-service
```
- [ ] Service restarted

### 5. Verify Frontend Configuration
```bash
cat /opt/nof1-app/frontend/.env
```

Should contain:
```
VITE_API_URL=https://nof1.coke-twitter.com/api
VITE_WS_URL=wss://nof1.coke-twitter.com
```
- [ ] Frontend env verified

## Testing

### 6. Backend Health Check
```bash
# From VPS
curl http://localhost:3001/api/health

# From outside
curl https://nof1.coke-twitter.com/api/health
```
- [ ] Backend responding on localhost
- [ ] Backend responding through Nginx
- [ ] Returns valid JSON

### 7. Check Logs
```bash
pm2 logs nof1-service --lines 50
```
- [ ] No critical errors
- [ ] Server started successfully
- [ ] Database connected

### 8. Access Website
Open in browser:
- [ ] http://nof1.coke-twitter.com (should redirect to HTTPS)
- [ ] https://nof1.coke-twitter.com (should load frontend)
- [ ] SSL certificate valid (green padlock)

### 9. Test Frontend Functionality
- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard loads
- [ ] API calls working

### 10. Verify Other Sites Still Working
- [ ] binance.nof1.coke-twitter.com still accessible
- [ ] Other existing services not affected

## Service Management

### View Logs
```bash
# Backend logs
pm2 logs nof1-service

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
```

### Check Status
```bash
# PM2
pm2 status

# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql

# Redis
sudo systemctl status redis
```

## Troubleshooting

### If backend fails to start:
```bash
pm2 logs nof1-service
cd /opt/nof1-app/backend
cat .env
node dist/server.js  # Test manually
```

### If frontend doesn't load:
```bash
ls -la /opt/nof1-app/frontend/dist/
sudo nginx -t
sudo systemctl reload nginx
```

### If database connection fails:
```bash
mysql -u nof1_user -p  # Test connection
# Password: nof1_pass_prod_2024 (or your custom password)
```

### If SSL fails:
```bash
sudo certbot certificates
sudo certbot renew
```

## Rollback Plan

If something goes wrong:
```bash
# Stop the service
pm2 stop nof1-service
pm2 delete nof1-service

# Remove Nginx config
sudo rm /etc/nginx/sites-enabled/nof1.coke-twitter.com
sudo systemctl reload nginx

# Remove app
sudo rm -rf /opt/nof1-app
```

## Success Criteria

- [ ] Website accessible at https://nof1.coke-twitter.com
- [ ] SSL certificate valid
- [ ] Backend API responding
- [ ] Frontend loads and works
- [ ] Users can register and login
- [ ] No errors in logs
- [ ] Existing services still working
- [ ] PM2 configured for auto-restart on boot

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs regularly
   - Monitor PM2 status
   - Check error rates

2. **Set up monitoring** (optional)
   - Consider PM2 Plus for monitoring
   - Set up log rotation
   - Configure alerts

3. **Backup strategy**
   - Schedule database backups
   - Document backup/restore procedures

4. **Security hardening**
   - Review firewall rules
   - Update passwords regularly
   - Keep system packages updated

## Contact Info

- VPS IP: 107.174.39.191
- Domain: nof1.coke-twitter.com
- SSH: root@107.174.39.191
- PM2 Process: nof1-service
- App Location: /opt/nof1-app
