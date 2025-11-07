#!/bin/bash

echo "🤖 AI自动交易快速测试脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查后端服务是否运行（绕过代理）
echo "1️⃣ 检查后端服务..."
if NO_PROXY=localhost curl -s http://localhost:3000/api/trading/status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务运行中${NC}"
else
    echo -e "${RED}❌ 后端服务未运行，请先启动: npm run dev${NC}"
    exit 1
fi

# 显示交易系统状态
echo ""
echo "2️⃣ 交易系统状态:"
NO_PROXY=localhost curl -s http://localhost:3000/api/trading/status | jq '.'

# 检查数据库中的AI模型
echo ""
echo "3️⃣ 活跃的AI模型:"
docker exec nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db -se \
  "SELECT id, name, status, initial_balance, current_balance FROM ai_models WHERE status='active';" \
  2>/dev/null | column -t

# 询问是否手动触发交易
echo ""
read -p "是否手动触发一次AI交易周期? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "4️⃣ 触发AI交易周期..."
    response=$(NO_PROXY=localhost curl -s -X POST http://localhost:3000/api/trading/run-cycle)

    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 交易周期执行成功！${NC}"
        echo "$response" | jq '.'

        echo ""
        echo "5️⃣ 等待3秒后查看最新持仓..."
        sleep 3

        echo ""
        echo "📊 当前持仓:"
        docker exec nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db -se \
          "SELECT m.name, p.symbol, p.side, p.quantity, p.entry_price, p.leverage, p.unrealized_pnl \
           FROM positions p JOIN ai_models m ON p.model_id = m.id;" \
          2>/dev/null | column -t

        echo ""
        echo "📝 最近5笔交易:"
        docker exec nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db -se \
          "SELECT m.name, t.symbol, t.side, t.entry_price, t.quantity, t.leverage, t.status, t.entry_time \
           FROM trades t JOIN ai_models m ON t.model_id = m.id \
           ORDER BY t.entry_time DESC LIMIT 5;" \
          2>/dev/null | column -t
    else
        echo -e "${RED}❌ 交易周期执行失败${NC}"
        echo "$response"
    fi
fi

echo ""
echo "================================"
echo "💡 提示："
echo "  - 查看后端日志: tail -f backend/logs/combined.log"
echo "  - 访问UI: http://localhost:5173"
echo "  - 数据库: docker exec -it nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db"
echo ""
echo "🎯 测试完成！"
