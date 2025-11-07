# 决策日志功能 - 调试指南

## 已完成的修复

### 1. **修复了验证逻辑** ✅
`backend/src/services/openRouterService.ts:160-197`

**修复前的问题：**
- 所有决策都要求有 `signal` 和 `coin` 字段
- 当AI决定 `hold`（持有）时，没有 `coin` 字段，导致验证失败

**修复后：**
- `hold` 信号不再要求 `coin` 字段
- 其他信号（`buy_to_enter`, `sell_to_enter`, `close`）仍然要求 `coin`
- 添加了详细的debug日志，显示AI的原始响应和解析结果

### 2. **添加了详细日志** ✅
现在会记录：
- AI模型的原始响应内容
- 解析后的决策对象
- 具体的验证失败原因

## 启用调试日志

要查看详细的AI响应和调试信息，需要启用debug日志级别：

### 方法1：环境变量（推荐）
在 `backend/.env` 文件中添加：
```bash
LOG_LEVEL=debug
```

### 方法2：临时启用
启动后端时设置环境变量：
```bash
LOG_LEVEL=debug npm run dev
```

## 重启后端

**重要：** 由于您是手动启动的后端，需要重启来加载更新的代码：

1. 停止当前的 `npm run dev` 进程（Ctrl+C）
2. 重新运行：
   ```bash
   cd backend
   LOG_LEVEL=debug npm run dev
   ```

## 测试决策日志

重启后端后，触发一次交易周期：

```bash
curl --noproxy localhost -X POST http://localhost:3000/api/trading/run-cycle -H "Content-Type: application/json"
```

## 查看日志

### 控制台日志
直接在运行 `npm run dev` 的终端查看实时日志

### 文件日志
```bash
# 查看所有日志
tail -f backend/logs/combined.log

# 查看错误日志
tail -f backend/logs/error.log

# 搜索特定模型的决策
grep "Gemini" backend/logs/combined.log | grep "decision"
```

## 决策日志API

重启后端后，以下API端点将可用：

```bash
# 获取最近50条决策日志
curl http://localhost:3000/api/decisions?limit=50

# 获取特定模型的决策日志
curl http://localhost:3000/api/decisions/model/18

# 在前端查看
# 访问 http://localhost:5173 → 点击右侧 "MODELCHAT" 标签
```

## 预期的日志输出

启用debug后，每次AI决策都会看到类似这样的日志：

```
info: Calling OpenRouter with model: google/gemini-2.5-pro
info: OpenRouter response received. Tokens used: 2695
debug: Parsed decision: {"signal":"hold","justification":"当前市场...","confidence":60}
info: Gemini 2.5 Pro decision: hold
```

或者如果有问题：

```
info: Calling OpenRouter with model: google/gemini-2.5-pro
info: OpenRouter response received. Tokens used: 2695
warn: Invalid trading decision format: buy_to_enter signal requires coin
debug: Decision object: {"signal":"buy_to_enter","quantity":100,...}
warn: No valid decision from Gemini 2.5 Pro
```

## 常见问题

### Q: 为什么某些模型总是返回 "Invalid trading decision format"？

**可能原因：**
1. AI模型返回的JSON格式不正确
2. 缺少必需字段（signal, coin, quantity等）
3. 字段名称不匹配（如返回 `action` 而不是 `signal`）

**解决方法：**
启用debug日志查看AI的原始响应，然后：
- 调整system prompt，明确要求返回特定格式
- 或修改 `parseTradingDecision()` 方法来适配该模型的响应格式

### Q: 日志中看到 "No JSON found in model response"

AI可能返回了纯文本而不是JSON。检查：
1. System prompt是否明确要求返回JSON格式
2. 模型是否支持结构化输出

### Q: MODELCHAT标签页显示 "Route not found"

后端还没有加载新的决策日志路由，需要重启后端。

---

**最后更新：** 2025-11-07
**相关文件：**
- `backend/src/services/openRouterService.ts` - AI响应解析
- `backend/src/services/aiTradingService.ts` - 决策日志保存
- `backend/src/routes/decisionRoutes.ts` - 决策日志API
- `frontend/src/pages/Live.tsx` - MODELCHAT标签页UI
