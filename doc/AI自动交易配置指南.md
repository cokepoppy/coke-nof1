# AI自动交易配置指南

## 概述

本系统实现了基于大语言模型(LLM)的自动加密货币交易功能,参考了[NOF1.ai的Alpha Arena](https://nof1.ai/blog/TechPost1)设计理念。

### 核心特性

- **多模型支持**: 通过OpenRouter API统一访问多个AI模型
- **可配置交易频率**: 支持从分钟级到天级的灵活配置
- **风险管理**: 内置仓位管理、杠杆控制、止损止盈机制
- **实时监控**: WebSocket实时推送交易决策和仓位变化
- **模拟/实盘切换**: 支持模拟交易测试和实盘交易

## 系统架构

```
AI模型 (通过OpenRouter)
    ↓
市场数据收集 (CoinGecko)
    ↓
提示词生成 (PromptBuilder)
    ↓
交易决策 (AI Trading Service)
    ↓
交易执行 & 仓位管理
    ↓
WebSocket 实时推送
```

## 快速开始

### 1. 环境配置

编辑 `.env` 文件:

```bash
# OpenRouter API密钥 (必需)
OPENROUTER_API_KEY=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

# 交易配置
TRADING_INTERVAL_MS=86400000  # 交易频率: 1天 (86400000ms)
                              # 3分钟 = 180000ms
                              # 1小时 = 3600000ms
                              # 6小时 = 21600000ms
                              # 12小时 = 43200000ms

MAX_LEVERAGE=20               # 最大杠杆倍数
MAX_POSITION_RISK=0.03        # 单笔最大风险 (3%)

# 启用AI自动交易 (重要!)
ENABLE_AI_TRADING=true        # 设置为true启用自动交易
ENABLE_REAL_TRADING=false     # 设置为true启用实盘交易

# 网络代理 (可选,如果访问OpenRouter有问题)
HTTP_PROXY=http://172.25.64.1:7890
HTTPS_PROXY=http://172.25.64.1:7890
```

### 2. 数据库配置

确保数据库连接配置正确:

```bash
DB_HOST=mysql
DB_PORT=3306
DB_USER=nof1_user
DB_PASSWORD=your_db_password
DB_NAME=nof1_db
```

### 3. 启动服务

```bash
# 方式1: 使用Docker Compose (推荐)
docker-compose up -d

# 方式2: 本地开发
cd backend
npm install
npm run dev
```

### 4. 配置AI模型

通过API或数据库直接插入AI模型配置:

```sql
INSERT INTO ai_models (name, provider, model_id, system_prompt, initial_balance, status, season)
VALUES (
  'GPT 5',
  'openrouter',
  'openai/gpt-5',  -- 最新GPT-5模型
  NULL,  -- 将使用默认系统提示词
  10000,  -- 初始资金 $10,000
  'active',  -- 状态: active, paused, stopped
  1
);
```

支持的模型ID (OpenRouter) - **2025年11月最新**:
- `openai/gpt-5` ⭐ **最新旗舰** (对应前端: GPT 5)
- `anthropic/claude-sonnet-4.5` ⭐ **最新Sonnet** (对应前端: CLAUDE SONNET 4.5)
- `google/gemini-2.5-pro` ⭐ **最新Pro** (对应前端: GEMINI 2.5 PRO)
- `x-ai/grok-4` ⭐ **最新Grok** (对应前端: GROK 4)
- `deepseek/deepseek-chat-v3.1` ⭐ **最新版本** (对应前端: DEEPSEEK CHAT V3.1)
- `qwen/qwen3-max` ⭐ **最新旗舰** (对应前端: QWEN3 MAX)

其他可用模型:
- `openai/gpt-5-pro` (GPT-5 Pro版本)
- `anthropic/claude-opus-4.1` (Claude Opus 4.1)
- `google/gemini-2.5-flash` (Gemini Flash版本)
- `x-ai/grok-4-fast` (Grok快速版本)

### 5. 监控运行

查看日志:
```bash
# Docker
docker-compose logs -f backend

# 本地
# 日志会输出到控制台
```

## 交易逻辑说明

### 提示词格式

系统会向AI模型提供以下信息:

1. **市场数据**
   - 当前价格、24h涨跌、24h成交量
   - 支持的币种: BTC, ETH, SOL, BNB, DOGE, XRP

2. **账户信息**
   - 当前余额和总回报率
   - 可用现金
   - 当前持仓(如有)
   - Sharpe比率

3. **交易指令**
   - 允许的操作: 开多、开空、持有、平仓
   - 风险管理规则
   - 仓位要求

### AI决策格式

AI模型需要返回JSON格式的决策:

```json
{
  "signal": "buy_to_enter",
  "coin": "BTC",
  "quantity": 0.5,
  "leverage": 10,
  "profit_target": 110000,
  "stop_loss": 95000,
  "invalidation_condition": "如果BTC跌破90000则平仓",
  "justification": "市场显示强劲上涨趋势...",
  "confidence": 0.75,
  "risk_usd": 500
}
```

### 风险控制

- **最大单笔风险**: 账户价值的3%
- **杠杆限制**: 1-20倍
- **止损监控**: 每30秒检查一次止损/止盈条件
- **清算价格计算**: 自动计算并监控清算风险

## OpenRouter模型配置

### 支持的模型列表

| 前端显示名称 | Model ID | 特点 |
|------------|----------|------|
| **GPT 5** ⭐ | `openai/gpt-5` | OpenAI最新旗舰,最强推理 |
| GPT 5 Pro | `openai/gpt-5-pro` | GPT-5 Pro版本 |
| **CLAUDE SONNET 4.5** ⭐ | `anthropic/claude-sonnet-4.5` | Anthropic最新Sonnet |
| Claude Opus 4.1 | `anthropic/claude-opus-4.1` | 最强Claude模型 |
| **GEMINI 2.5 PRO** ⭐ | `google/gemini-2.5-pro` | Google最新Pro模型 |
| Gemini 2.5 Flash | `google/gemini-2.5-flash` | 速度优化版本 |
| **GROK 4** ⭐ | `x-ai/grok-4` | xAI最新Grok |
| Grok 4 Fast | `x-ai/grok-4-fast` | Grok快速版本 |
| **DEEPSEEK V3.1** ⭐ | `deepseek/deepseek-chat-v3.1` | DeepSeek最新,性价比高 |
| **QWEN3 MAX** ⭐ | `qwen/qwen3-max` | Qwen最新旗舰 |

⭐ = 推荐使用 (与前端页面显示一致)

### 配置多个模型

可以配置多个AI模型同时运行,互相竞争:

```sql
-- GPT-5 (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('GPT 5', 'openrouter', 'openai/gpt-5', 10000, 'active');

-- Claude Sonnet 4.5 (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('CLAUDE SONNET 4.5', 'openrouter', 'anthropic/claude-sonnet-4.5', 10000, 'active');

-- Gemini 2.5 Pro (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('GEMINI 2.5 PRO', 'openrouter', 'google/gemini-2.5-pro', 10000, 'active');

-- Grok 4 (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('GROK 4', 'openrouter', 'x-ai/grok-4', 10000, 'active');

-- DeepSeek v3.1 (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('DEEPSEEK CHAT V3.1', 'openrouter', 'deepseek/deepseek-chat-v3.1', 10000, 'active');

-- Qwen3 Max (最新)
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('QWEN3 MAX', 'openrouter', 'qwen/qwen3-max', 10000, 'active');
```

## 交易频率配置

根据策略需求配置交易频率:

### 预设配置

```bash
# 高频交易 (3分钟)
TRADING_INTERVAL_MS=180000

# 中频交易 (1小时)
TRADING_INTERVAL_MS=3600000

# 日内交易 (6小时)
TRADING_INTERVAL_MS=21600000

# 日线交易 (1天) - 推荐新手使用
TRADING_INTERVAL_MS=86400000
```

### 注意事项

- **API调用成本**: 频率越高,API调用成本越高
- **市场噪音**: 过高频率可能受市场噪音影响
- **模型响应时间**: 某些模型响应较慢,需考虑超时
- **风险管理**: 高频交易需要更严格的风险控制

## 监控与调试

### WebSocket事件

前端可以监听以下事件:

```javascript
// 模型更新事件
socket.on('model:update', (data) => {
  console.log('模型决策:', data.decision);
  console.log('账户价值:', data.accountValue);
  console.log('持仓:', data.positions);
});

// 交易事件
socket.on('model:trade', (trade) => {
  console.log('交易类型:', trade.type);
  console.log('币种:', trade.symbol);
  console.log('方向:', trade.side);
  console.log('价格:', trade.price);
});
```

### 日志级别

修改日志级别以获取更详细信息:

```typescript
// backend/src/utils/logger.ts
level: process.env.LOG_LEVEL || 'debug'  // info, debug, warn, error
```

### 常见问题排查

1. **AI模型无响应**
   - 检查OpenRouter API密钥是否正确
   - 查看网络连接,必要时配置代理
   - 检查模型ID是否正确

2. **交易未执行**
   - 确认 `ENABLE_AI_TRADING=true`
   - 检查模型状态是否为 `active`
   - 查看日志中的错误信息

3. **市场数据缺失**
   - 确认CoinGecko服务正常运行
   - 检查网络连接
   - 查看价格缓存是否更新

## 安全建议

### 模拟交易测试

在启用实盘交易前,务必进行充分测试:

```bash
# 1. 使用模拟模式
ENABLE_REAL_TRADING=false

# 2. 使用小额资金测试
initial_balance = 100  # 而非10000

# 3. 降低杠杆
MAX_LEVERAGE=2  # 而非20

# 4. 缩短测试周期
TRADING_INTERVAL_MS=300000  # 5分钟测试
```

### 风险控制建议

1. **分散投资**: 配置多个模型分散风险
2. **小仓位**: 初期使用小仓位测试
3. **严格止损**: 始终设置止损保护
4. **监控告警**: 设置账户异常告警
5. **定期复盘**: 分析交易记录,优化策略

## API参考

### 手动触发交易周期

```bash
POST /api/trading/run-cycle
Authorization: Bearer <token>
```

### 获取模型状态

```bash
GET /api/models/:id
```

### 更新模型配置

```bash
PUT /api/models/:id
Content-Type: application/json

{
  "status": "paused",
  "systemPrompt": "自定义系统提示词..."
}
```

### 获取交易历史

```bash
GET /api/trades?modelId=1&limit=50
```

## 性能优化

### 减少API调用

```bash
# 增加交易间隔
TRADING_INTERVAL_MS=21600000  # 6小时

# 使用缓存的市场数据
# (已在CoinGeckoService中实现)
```

### 提高响应速度

```typescript
// 使用更快的模型
model_id: 'openai/gpt-4o'  // 而非 gpt-4-turbo

// 减少max_tokens
max_tokens: 2000  // 而非 4000
```

## 更新日志

### v1.0.0 (2025-01-06)
- ✅ OpenRouter API集成
- ✅ 可配置交易频率
- ✅ 自动止损/止盈监控
- ✅ WebSocket实时推送
- ✅ 多模型支持
- ✅ 风险管理系统

## 下一步计划

- [ ] 技术指标集成 (MACD, RSI, EMA)
- [ ] 高级回测系统
- [ ] 自定义策略DSL
- [ ] 性能分析仪表板
- [ ] 移动端推送通知
- [ ] Hyperliquid实盘交易集成

## 参考资源

- [NOF1.ai Alpha Arena Blog](https://nof1.ai/blog/TechPost1)
- [OpenRouter文档](https://openrouter.ai/docs)
- [CoinGecko API](https://www.coingecko.com/en/api)
- [Hyperliquid文档](https://hyperliquid.gitbook.io/)

## 技术支持

如遇问题,请:
1. 查看日志输出
2. 检查配置文件
3. 参考本文档排查
4. 提交Issue到GitHub

---

**免责声明**: 本系统仅供研究和教育用途。加密货币交易存在高风险,可能导致资金损失。使用本系统进行实盘交易前,请充分了解风险并做好资金管理。
