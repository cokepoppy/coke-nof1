# AI自动交易测试指南 🚀

## 🎯 如何体验AI自动交易

### 一、快速体验流程

#### 1️⃣ 启动服务

**方式A：使用启动脚本（推荐）**
```bash
cd /mnt/d/home/coke-nof1/backend
bash start.sh
```

**方式B：使用npm**
```bash
cd /mnt/d/home/coke-nof1/backend
npm run dev
```

#### 2️⃣ 启动前端（新终端）
```bash
cd /mnt/d/home/coke-nof1/frontend
npm run dev
```

#### 3️⃣ 访问UI
打开浏览器访问：`http://localhost:5173`

---

## 📊 UI展示内容

### 1. 首页 (/)
显示实时行情数据：
- ✅ BTC, ETH, SOL, BNB, DOGE, XRP 实时价格
- ✅ 24h涨跌幅
- ✅ 实时更新（通过WebSocket）

### 2. Live页面 (/live)
展示AI模型实时状态：
- **模型列表**：显示所有AI模型
- **账户价值图表**：实时资金曲线
- **当前持仓**：每个模型的持仓情况
- **交易历史**：最近的买入/卖出记录

### 3. Leaderboard (/leaderboard)
AI模型排行榜：
- **总回报率**排名
- **Sharpe比率**（风险调整后收益）
- **胜率统计**
- **最大回撤**

---

## 🧪 测试AI交易的3种方式

### 方式1：自然等待（推荐新手）

**适合**：了解系统运行机制

**步骤**：
1. 启动服务（确保 `ENABLE_AI_TRADING=true`）
2. 等待交易间隔时间（默认3分钟）
3. 观察后端日志和前端UI变化

**预期输出**：
```bash
# 后端日志
✅ AI Trading scheduled every 3 minute(s)
✅ Processing model: GPT-4 Turbo
✅ GPT-4 Turbo decision: buy_to_enter BTC
✅ Opened LONG position: BTC @ 95000, qty: 0.1, leverage: 10x
```

**UI变化**：
- 📈 Live页面显示新的持仓
- 💰 账户价值实时更新
- 📊 交易历史新增记录

---

### 方式2：手动触发交易（快速测试）

**适合**：快速验证功能

**方法A：修改交易间隔为1分钟**
```bash
# 编辑 .env
TRADING_INTERVAL_MS=60000  # 1分钟

# 重启后端
# Ctrl+C 停止服务，然后重新启动
npm run dev
```

**方法B：直接调用API（需要后续实现）**
```bash
# 手动触发一次交易周期
curl -X POST http://localhost:3000/api/trading/run-cycle \
  -H "Content-Type: application/json"
```

---

### 方式3：模拟数据测试（推荐开发）

**创建测试脚本**：

```bash
# 在backend目录创建 test-trading.ts
cd /mnt/d/home/coke-nof1/backend
```

创建文件 `src/test/test-trading.ts`:
```typescript
import aiTradingService from '../services/aiTradingService';

async function testTrading() {
  console.log('🧪 Starting AI Trading Test...\n');

  await aiTradingService.initialize();
  await aiTradingService.runTradingCycle();

  console.log('\n✅ Test completed!');
  process.exit(0);
}

testTrading().catch(console.error);
```

**运行测试**：
```bash
npx ts-node src/test/test-trading.ts
```

---

## 📺 UI展示详解

### Live页面会显示什么？

#### 1. 模型卡片（每个AI模型）
```
┌─────────────────────────────────────┐
│ 🤖 GPT-4 Turbo                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 账户价值: $10,250 (+2.5%)           │
│ 可用资金: $8,500                    │
│ 胜率: 60% (3/5)                     │
│                                     │
│ 📊 当前持仓:                        │
│ • BTC LONG 0.1 @95000 10x          │
│   未实现盈亏: +$150 (+1.58%)        │
│                                     │
│ 📈 最近交易:                        │
│ • 10:30 买入 BTC 0.1 @95000         │
│ • 10:15 卖出 ETH 2.0 @3800 +$50    │
└─────────────────────────────────────┘
```

#### 2. 实时交易流
```
🔔 实时通知
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10:35  GPT-4 Turbo    买入 BTC 0.1 @95,000
       信心度: 75%  杠杆: 10x

10:32  Claude 3.5     卖出 ETH 2.0 @3,800
       盈亏: +$120 (+3.2%)

10:30  Gemini Pro     持有
       原因: 等待更好入场点
```

#### 3. 账户价值图表
```
$12,000 ┤          ╭─╮
        │     ╭───╯  ╰╮
$11,000 ┤  ╭──╯       ╰╮
        │ ╭╯           ╰─╮
$10,000 ┼─╯              ╰───
        └─────────────────────>
         1h  2h  3h  4h  时间
```

---

## 🔍 监控和调试

### 1. 查看后端日志

**实时日志**：
```bash
# 在运行npm run dev的终端查看
# 或者
tail -f logs/combined.log
```

**关键日志标识**：
- ✅ `Processing model` - 正在处理模型
- ✅ `decision: buy_to_enter` - AI决定买入
- ✅ `Opened LONG position` - 成功开仓
- ⚠️ `No valid decision` - AI未返回有效决策
- ❌ `Error` - 出现错误

### 2. 数据库查询

**查看模型状态**：
```bash
docker exec -it nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db
```

```sql
-- 查看所有模型
SELECT id, name, initial_balance, current_balance, status
FROM ai_models;

-- 查看最近交易
SELECT
  m.name as model,
  t.symbol,
  t.side,
  t.entry_price,
  t.quantity,
  t.leverage,
  t.profit_loss,
  t.entry_time
FROM trades t
JOIN ai_models m ON t.model_id = m.id
ORDER BY t.entry_time DESC
LIMIT 10;

-- 查看当前持仓
SELECT
  m.name as model,
  p.symbol,
  p.side,
  p.quantity,
  p.entry_price,
  p.current_price,
  p.unrealized_pnl
FROM positions p
JOIN ai_models m ON p.model_id = m.id;
```

### 3. WebSocket监听

**在浏览器控制台**：
```javascript
// 监听模型更新
socket.on('model:update', (data) => {
  console.log('📊 模型更新:', data);
  console.log('决策:', data.decision);
  console.log('持仓:', data.positions);
});

// 监听交易事件
socket.on('model:trade', (trade) => {
  console.log('💰 交易执行:', trade);
  console.log('类型:', trade.type);  // open/close
  console.log('币种:', trade.symbol);
  console.log('方向:', trade.side);   // LONG/SHORT
  console.log('价格:', trade.price);
});
```

---

## 🎬 完整测试场景

### 场景1：观察首次AI决策

**时间线**：
```
00:00  启动服务
       ├─ ✅ 连接数据库
       ├─ ✅ 加载4个AI模型
       └─ ✅ 开始价格监控

00:60  CoinGecko获取价格
       ├─ BTC: $95,000
       ├─ ETH: $3,800
       └─ SOL: $150

03:00  首次AI交易周期
       ├─ 📊 GPT-4 Turbo分析市场
       ├─ 🤔 决策：买入BTC
       ├─ 💰 开仓：0.1 BTC @95000 10x
       └─ 📡 推送到前端

03:01  UI更新
       ├─ Live页面显示持仓
       ├─ 账户价值更新
       └─ 交易历史新增记录
```

### 场景2：观察止损触发

**条件**：BTC价格下跌触发止损

**时间线**：
```
00:00  持仓状态
       └─ BTC LONG 0.1 @95000
          止损: $93,000

30:00  止损监控检测（每30秒）
       ├─ 当前价格: $92,800 ❌
       ├─ 触发止损条件
       └─ 自动平仓

30:01  平仓执行
       ├─ 平仓价格: $92,800
       ├─ 盈亏: -$220 (-2.3%)
       └─ 推送到前端

30:02  UI更新
       ├─ 持仓列表移除该仓位
       ├─ 账户价值减少
       └─ 交易历史显示平仓
```

---

## 📝 测试检查清单

### 启动前检查
- [ ] MySQL运行 (`docker ps | grep mysql`)
- [ ] Redis运行 (`docker ps | grep redis`)
- [ ] `.env`配置正确
- [ ] AI模型已初始化（4个active）
- [ ] `ENABLE_AI_TRADING=true`

### 运行中检查
- [ ] 后端日志无错误
- [ ] 价格数据正常更新
- [ ] 每3分钟触发交易周期
- [ ] AI返回有效决策JSON
- [ ] WebSocket连接正常

### UI检查
- [ ] 首页显示实时价格
- [ ] Live页面加载模型列表
- [ ] 图表正常渲染
- [ ] 持仓信息显示
- [ ] 交易历史更新

---

## 🐛 常见问题

### Q1: AI一直不交易？
**检查**：
- 日志是否有 `Processing model`
- 是否返回 `hold` 决策（正常行为）
- OpenRouter API是否正常响应

### Q2: 价格数据不更新？
**检查**：
- CoinGecko API限流（调整`COINGECKO_POLL_INTERVAL_MS`）
- 网络连接（检查代理设置）
- WebSocket连接状态

### Q3: 交易后UI不更新？
**检查**：
- 浏览器控制台WebSocket连接
- 后端是否emit事件
- 前端是否监听正确的事件

---

## 🚀 高级玩法

### 1. 对比多个模型
启用所有5个模型，观察哪个表现最好：
```sql
UPDATE ai_models SET status='active' WHERE id IN (7,8,9,10,11);
```

### 2. 调整交易频率
快速测试模式（1分钟）：
```bash
TRADING_INTERVAL_MS=60000
```

### 3. 自定义系统提示词
修改某个模型的策略：
```sql
UPDATE ai_models
SET system_prompt = '你是一个保守的价值投资者，只在确定性高的时候交易...'
WHERE id = 7;
```

---

## 📞 需要帮助？

- 查看详细日志：`backend/logs/combined.log`
- 数据库调试：使用上述SQL命令
- 前端调试：浏览器开发者工具 -> Console

**祝交易顺利！** 🎯
