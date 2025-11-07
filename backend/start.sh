#!/bin/bash
cd /mnt/d/home/coke-nof1/backend
export NODE_ENV=development
export PORT=3000
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=nof1_user
export DB_PASSWORD=nof1_pass_123
export DB_NAME=nof1_db
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=nof1_jwt_secret_key_dev_only_change_in_production
export JWT_EXPIRES_IN=7d
export OPENROUTER_API_KEY=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
export TRADING_INTERVAL_MS=180000
export MAX_LEVERAGE=20
export MAX_POSITION_RISK=0.03
export ENABLE_REAL_TRADING=false
export ENABLE_AI_TRADING=true
export HTTP_PROXY=http://172.25.64.1:7890
export HTTPS_PROXY=http://172.25.64.1:7890
export CORS_ORIGIN=http://localhost:5173
export FRONTEND_URL=http://localhost:5173

/home/user/.nvm/versions/node/v20.19.5/bin/npx ts-node-dev --respawn --transpile-only src/server.ts
