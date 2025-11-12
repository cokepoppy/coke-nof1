#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "Initializing MySQL database for NOF1.AI"
echo "============================================"

# Database credentials (match those in backend/.env for production)
DB_NAME="nof1_db"
DB_USER="nof1_user"
DB_PASSWORD="nof1_pass_prod_2024"  # Change this in production!

echo "Creating database '$DB_NAME' and user '$DB_USER'..."

# Create database and user
sudo mysql -u root <<-EOSQL
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show databases
SHOW DATABASES LIKE '${DB_NAME}';
EOSQL

echo "============================================"
echo "MySQL initialization complete!"
echo "============================================"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASSWORD}"
echo ""
echo "IMPORTANT: Update backend/.env with these credentials:"
echo "  DB_NAME=${DB_NAME}"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASSWORD=${DB_PASSWORD}"
echo "  DB_HOST=localhost"
echo "  DB_PORT=3306"
echo "============================================"
