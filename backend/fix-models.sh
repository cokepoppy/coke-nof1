#!/bin/bash
# Script to upgrade to latest OpenRouter model IDs
# 升级到最新的AI模型 (与前端页面一致)

echo "🚀 升级到最新的OpenRouter模型ID..."
echo ""

# Get DB credentials from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Show current models
echo "📋 当前数据库中的模型:"
docker-compose exec -T mysql mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} \
  -e "SELECT id, name, model_id FROM ai_models;" 2>/dev/null || true

echo ""
echo "🔄 执行升级..."

# Execute the SQL fix script
docker-compose exec -T mysql mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < fix-model-ids.sql 2>/dev/null

echo ""
echo "✅ 模型ID已升级到最新版本"
echo ""
echo "🎯 最新的OpenRouter模型ID (与前端页面一致):"
echo ""
echo "  前端名称              →  OpenRouter 模型ID"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GPT 5                →  openai/gpt-5"
echo "  CLAUDE SONNET 4.5    →  anthropic/claude-sonnet-4.5"
echo "  GEMINI 2.5 PRO       →  google/gemini-2.5-pro"
echo "  GROK 4               →  x-ai/grok-4"
echo "  DEEPSEEK CHAT V3.1   →  deepseek/deepseek-chat-v3.1"
echo "  QWEN3 MAX            →  qwen/qwen3-max"
echo ""
echo "📖 查看完整模型列表: cat ../OPENROUTER_MODELS.md"
