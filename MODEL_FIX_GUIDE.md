# 🚀 模型ID修复快速指南

## ❌ 您遇到的错误

```
error: OpenRouter API error: 400 - xai/grok-beta is not a valid model ID
error: OpenRouter API error: 404 - No endpoints found for google/gemini-pro-1.5
```

## ✅ 解决方案

### 方法1: 一键修复脚本 (推荐)

```bash
cd backend
./fix-models.sh
```

这将自动升级所有模型到最新版本。

### 方法2: 手动执行SQL

```bash
cd backend
docker-compose exec -T mysql mysql -u nof1_user -p你的密码 nof1_db < fix-model-ids.sql
```

### 方法3: 直接在数据库中执行

```sql
-- 修复所有模型为最新版本
UPDATE ai_models SET model_id = 'openai/gpt-5' WHERE name LIKE '%GPT%5%';
UPDATE ai_models SET model_id = 'anthropic/claude-sonnet-4.5' WHERE name LIKE '%CLAUDE%4.5%';
UPDATE ai_models SET model_id = 'google/gemini-2.5-pro' WHERE name LIKE '%GEMINI%2.5%';
UPDATE ai_models SET model_id = 'x-ai/grok-4' WHERE name LIKE '%GROK%4%';
UPDATE ai_models SET model_id = 'deepseek/deepseek-chat-v3.1' WHERE name LIKE '%DEEPSEEK%3.1%';
UPDATE ai_models SET model_id = 'qwen/qwen3-max' WHERE name LIKE '%QWEN3%MAX%';

-- 修复旧的错误ID
UPDATE ai_models SET model_id = 'google/gemini-2.5-pro' WHERE model_id = 'google/gemini-pro-1.5';
UPDATE ai_models SET model_id = 'x-ai/grok-4' WHERE model_id IN ('x-ai/grok-beta', 'xai/grok-beta');
```

---

## 📋 正确的模型ID对照表

| 前端页面显示 | ❌ 错误的ID | ✅ 正确的ID |
|------------|-----------|-----------|
| **GPT 5** | - | `openai/gpt-5` |
| **CLAUDE SONNET 4.5** | - | `anthropic/claude-sonnet-4.5` |
| **GEMINI 2.5 PRO** | `google/gemini-pro-1.5` | `google/gemini-2.5-pro` |
| **GROK 4** | `xai/grok-beta`<br>`x-ai/grok-beta`<br>`x-ai/grok-2-1212` | `x-ai/grok-4` |
| **DEEPSEEK V3.1** | `deepseek/deepseek-chat` | `deepseek/deepseek-chat-v3.1` |
| **QWEN3 MAX** | `qwen/qwen-2.5-72b-instruct` | `qwen/qwen3-max` |

---

## 🔍 验证修复

执行修复后,运行以下命令验证:

```bash
# 查看当前数据库中的模型
cd backend
docker-compose exec mysql mysql -u nof1_user -p你的密码 nof1_db \
  -e "SELECT id, name, model_id, status FROM ai_models;"

# 重启后端服务
docker-compose restart backend

# 查看日志,确认没有错误
docker-compose logs -f backend
```

---

## 📚 相关文档

- **完整模型列表**: 查看 `OPENROUTER_MODELS.md`
- **配置指南**: 查看 `doc/AI自动交易配置指南.md`
- **SQL脚本**: `backend/fix-model-ids.sql`
- **修复脚本**: `backend/fix-models.sh`

---

## 💡 常见问题

### Q: 为什么模型ID会变化?

A: OpenRouter会不断更新和升级模型。旧的模型ID可能被废弃或重命名。

### Q: 修复后需要重启服务吗?

A: 是的,建议重启backend服务: `docker-compose restart backend`

### Q: 如何验证模型ID是否正确?

A: 可以访问 https://openrouter.ai/models 查看官方模型列表,或使用以下命令:

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq -r '.data[].id' | grep -i gpt
```

### Q: 我的OpenRouter API密钥在哪里配置?

A: 在 `backend/.env` 文件中配置 `OPENROUTER_API_KEY`

---

## 🎯 下一步

修复完成后:

1. ✅ 重启backend服务
2. ✅ 查看日志确认无错误
3. ✅ 访问前端页面,查看模型是否正常运行
4. ✅ 监控AI交易决策是否正常执行

---

**最后更新**: 2025-11-07
