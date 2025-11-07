# 快速开始 - AI自动交易

本指南将帮助你在5分钟内启动AI自动交易系统。

## 前置要求

- Docker 和 Docker Compose
- OpenRouter API密钥 ([获取地址](https://openrouter.ai/))

## 步骤1: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

**必需配置**:

```bash
# OpenRouter API密钥 (必填)
OPENROUTER_API_KEY=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

# 启用AI自动交易
ENABLE_AI_TRADING=true

# 交易频率 (默认1天)
TRADING_INTERVAL_MS=86400000
```

**可选配置** (如果网络访问有问题):

```bash
# 代理设置
HTTP_PROXY=http://172.25.64.1:7890
HTTPS_PROXY=http://172.25.64.1:7890
```

## 步骤2: 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

## 步骤3: 初始化AI模型

### 方式A: 使用SQL脚本 (推荐)

```bash
# 进入数据库容器
docker-compose exec mysql bash

# 执行初始化脚本
mysql -u nof1_user -p nof1_db < /backend/scripts/setup-ai-models.sql
# 密码: 你在.env中设置的DB_PASSWORD
```

### 方式B: 手动插入

```sql
INSERT INTO ai_models (name, provider, model_id, initial_balance, status)
VALUES ('GPT-4 Turbo', 'openrouter', 'openai/gpt-4-turbo', 10000, 'active');
```

## 步骤4: 验证运行

### 检查服务状态

```bash
# 查看后端日志
docker-compose logs backend

# 应该看到类似输出:
# ✅ AI Trading scheduled every 24 hour(s)
# ✅ Stop loss/take profit monitoring scheduled
```

### 访问前端

打开浏览器访问: `http://localhost:5173`

你应该能看到:
- 实时价格数据
- AI模型列表
- 交易历史 (如有)

## 步骤5: 监控交易

### 查看日志

```bash
# 持续查看日志
docker-compose logs -f backend | grep -i trading
```

### 关键日志

```
[INFO] Processing model: GPT-4 Turbo (openai/gpt-4-turbo)
[INFO] GPT-4 Turbo decision: buy_to_enter BTC
[INFO] Opened LONG position: BTC @ 95000, qty: 0.1, leverage: 10x
```

### WebSocket监听 (浏览器控制台)

```javascript
socket.on('model:update', (data) => {
  console.log('模型决策:', data);
});

socket.on('model:trade', (trade) => {
  console.log('新交易:', trade);
});
```

## 常见问题

### Q: AI模型没有交易?

**检查项**:
1. ✅ `ENABLE_AI_TRADING=true`
2. ✅ 模型状态为 `active`
3. ✅ OpenRouter API密钥正确
4. ✅ 等待到达交易时间 (默认24小时)

**快速测试** (3分钟交易):
```bash
# 修改.env
TRADING_INTERVAL_MS=180000

# 重启服务
docker-compose restart backend
```

### Q: OpenRouter API错误?

**可能原因**:
1. API密钥错误或过期
2. 网络连接问题 (尝试配置代理)
3. API配额不足

**测试连接**:
```bash
curl -H "Authorization: Bearer sk-or-v1-your-key" \
  https://openrouter.ai/api/v1/models
```

### Q: 如何暂停交易?

```bash
# 方式1: 环境变量
ENABLE_AI_TRADING=false
docker-compose restart backend

# 方式2: 数据库
UPDATE ai_models SET status='paused' WHERE id=1;
```

### Q: 如何查看性能?

```sql
-- 查看模型表现
SELECT
  m.name,
  m.initial_balance,
  m.current_balance,
  ((m.current_balance - m.initial_balance) / m.initial_balance * 100) as return_pct,
  COUNT(t.id) as total_trades
FROM ai_models m
LEFT JOIN trades t ON t.model_id = m.id
GROUP BY m.id;

-- 查看最近交易
SELECT * FROM trades
ORDER BY entry_time DESC
LIMIT 10;
```

## 下一步

1. 📖 阅读完整文档: [AI自动交易配置指南](./doc/AI自动交易配置指南.md)
2. ⚙️ 调整交易频率和风险参数
3. 📊 添加更多AI模型进行对比
4. 🧪 使用小额资金测试策略
5. 📈 分析交易数据,优化策略

## 快速命令参考

```bash
# 查看所有服务状态
docker-compose ps

# 重启后端
docker-compose restart backend

# 查看实时日志
docker-compose logs -f backend

# 进入数据库
docker-compose exec mysql mysql -u nof1_user -p nof1_db

# 停止所有服务
docker-compose down

# 完全清理 (包括数据)
docker-compose down -v
```

## 安全提示

⚠️ **重要**: 本系统默认为模拟交易模式。

在启用实盘交易前:
1. 充分测试至少1周
2. 使用小额资金
3. 设置严格的风险限制
4. 持续监控系统运行

---

**需要帮助?**
- 查看详细文档: [AI自动交易配置指南](./doc/AI自动交易配置指南.md)
- GitHub Issues: [提交问题](https://github.com/yourusername/nof1-ai/issues)

**祝交易顺利! 🚀**
