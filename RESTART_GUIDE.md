# 🔄 服务重启指南

## 当前问题
测试脚本显示数据库可以连接，但API没有响应。这说明服务需要完全重启以加载：
- ✅ 新的 `.env` 配置
- ✅ 新的路由（/api/trading/*）
- ✅ AI交易服务

---

## 🚀 完整重启步骤

### 步骤1：停止所有旧进程

**在你的终端执行：**

```bash
# 杀掉所有Node进程（如果有多个在运行）
pkill -f "ts-node-dev"

# 或者找到进程ID并杀掉
ps aux | grep ts-node-dev
# 然后 kill -9 <进程ID>
```

### 步骤2：清理并重启

**方式A：使用npm（推荐）**

```bash
cd /mnt/d/home/coke-nof1/backend

# 确认在正确目录
pwd

# 启动服务
npm run dev
```

**方式B：使用启动脚本**

```bash
cd /mnt/d/home/coke-nof1/backend
bash start.sh
```

### 步骤3：验证启动成功

**预期看到的日志：**

```
✅ Database connection established
✅ WebSocket initialized
✅ Server running on port 3000
✅ Initializing AI Trading Service...
✅ AI Trading scheduled every 3 minute(s)
✅ Stop loss/take profit monitoring scheduled
✅ Started price polling (every 60 seconds)
✅ CoinGecko service initialized
```

**不应该看到：**

```
❌ Access denied for user 'root'
❌ Database connection failed
```

### 步骤4：运行测试验证

```bash
# 等待3秒让服务完全启动
sleep 3

# 运行测试脚本
bash test-ai-trading.sh
```

**应该看到：**
- ✅ 后端服务运行中
- ✅ 交易系统状态（JSON格式）
- ✅ 4个活跃的AI模型
- ✅ 可以选择手动触发交易

---

## 🧪 快速验证命令

### 1. 检查API是否响应

```bash
curl http://localhost:3000/api/trading/status
```

**预期输出：**
```json
{
  "aiTradingEnabled": true,
  "tradingInterval": 180000,
  "maxLeverage": 20,
  "maxPositionRisk": 0.03,
  "realTradingEnabled": false
}
```

### 2. 检查数据库连接

```bash
curl http://localhost:3000/api/models
```

应该返回模型列表（不是空数组）

### 3. 手动触发一次交易

```bash
curl -X POST http://localhost:3000/api/trading/run-cycle
```

**预期输出：**
```json
{
  "success": true,
  "message": "Trading cycle executed successfully",
  "timestamp": "2025-11-06T..."
}
```

---

## ⚠️ 常见问题

### Q1: 端口3000已被占用

**解决：**
```bash
# 找到占用端口的进程
lsof -i :3000

# 杀掉该进程
kill -9 <PID>
```

### Q2: npm命令不工作（ENOENT错误）

**解决：**
```bash
# 重新进入目录
cd /mnt/d/home && cd coke-nof1/backend

# 或关闭终端重新打开
```

### Q3: 数据库连接失败

**检查：**
```bash
# 确认MySQL运行
docker ps | grep mysql

# 测试连接
docker exec -it nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db -e "SELECT 1;"
```

---

## 📝 完整测试流程

**一旦服务启动成功：**

1. **自然等待测试**（3分钟）
   - 打开 http://localhost:5173/live
   - 等待AI自动做出决策
   - 观察实时更新

2. **手动触发测试**（立即）
   ```bash
   bash test-ai-trading.sh
   # 选择 'y' 手动触发交易
   ```

3. **查看结果**
   ```bash
   # 查看持仓
   docker exec -it nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db \
     -e "SELECT * FROM positions;"

   # 查看交易记录
   docker exec -it nof1-mysql mysql -u nof1_user -pnof1_pass_123 nof1_db \
     -e "SELECT * FROM trades ORDER BY entry_time DESC LIMIT 5;"
   ```

---

## 🎯 确认服务正常的标志

- [x] `curl http://localhost:3000/api/trading/status` 返回JSON
- [x] 后端日志显示 "Database connection established"
- [x] 后端日志显示 "AI Trading scheduled"
- [x] 测试脚本显示交易系统状态
- [x] 可以手动触发交易周期
- [x] 数据库中有AI模型数据

如果以上都满足，说明系统运行正常！🎉
