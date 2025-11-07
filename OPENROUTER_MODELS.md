# OpenRouter 正确的模型ID列表

## 🎯 最新模型 (2025年11月 - 与前端页面一致)

### 推荐配置 (对应前端显示的模型名称)

| 前端显示名称 | OpenRouter 模型ID | 说明 |
|-------------|------------------|------|
| **GPT 5** | `openai/gpt-5` | ✅ OpenAI最新旗舰模型 |
| **CLAUDE SONNET 4.5** | `anthropic/claude-sonnet-4.5` | ✅ Anthropic最新Sonnet |
| **GEMINI 2.5 PRO** | `google/gemini-2.5-pro` | ✅ Google最新Pro模型 |
| **GROK 4** | `x-ai/grok-4` | ✅ xAI最新Grok |
| **DEEPSEEK CHAT V3.1** | `deepseek/deepseek-chat-v3.1` | ✅ DeepSeek最新版本 |
| **QWEN3 MAX** | `qwen/qwen3-max` | ✅ Qwen最新旗舰模型 |

---

## 📋 完整可用模型列表

### OpenAI 模型系列
- `openai/gpt-5` ✅ **最新旗舰**
- `openai/gpt-5-pro` ✅ **Pro版本**
- `openai/gpt-5-mini` ✅ (轻量版)
- `openai/gpt-5-nano` ✅ (超轻量)
- `openai/gpt-5-chat` ✅ (对话优化)
- `openai/gpt-5-codex` ✅ (编程优化)
- `openai/gpt-4o` ✅ (上一代)
- `openai/gpt-4-turbo` ✅

### Anthropic Claude 模型系列
- `anthropic/claude-sonnet-4.5` ✅ **最新Sonnet**
- `anthropic/claude-opus-4.1` ✅ **最新Opus**
- `anthropic/claude-haiku-4.5` ✅ **最新Haiku**
- `anthropic/claude-3.5-sonnet` ✅ (上一代)
- `anthropic/claude-3-opus` ✅
- `anthropic/claude-3-haiku` ✅

### Google Gemini 模型系列
- `google/gemini-2.5-pro` ✅ **最新Pro**
- `google/gemini-2.5-flash` ✅ **最新Flash**
- `google/gemini-2.5-flash-lite` ✅ (轻量版)
- `google/gemini-2.0-flash-001` ✅
- **❌ 错误: `google/gemini-pro-1.5` - 此ID不存在**

### xAI Grok 模型系列
- `x-ai/grok-4` ✅ **最新主模型**
- `x-ai/grok-4-fast` ✅ **快速版本**
- `x-ai/grok-3` ✅
- `x-ai/grok-3-mini` ✅
- `x-ai/grok-code-fast-1` ✅ (编程优化)
- **❌ 错误: `x-ai/grok-beta` - 已废弃**
- **❌ 错误: `xai/grok-beta` - 格式错误**

### DeepSeek 模型系列
- `deepseek/deepseek-chat-v3.1` ✅ **最新版本**
- `deepseek/deepseek-v3.2-exp` ✅ (实验版)
- `deepseek/deepseek-v3.1-terminus` ✅
- `deepseek/deepseek-chat-v3.1:free` ✅ (免费版)

### Qwen 模型系列
- `qwen/qwen3-max` ✅ **最新旗舰**
- `qwen/qwen3-coder-plus` ✅ (编程优化)
- `qwen/qwen3-coder` ✅ (编程专用)
- `qwen/qwen-2.5-72b-instruct` ✅ (上一代)

### Meta LLaMA 模型
- `meta-llama/llama-3.1-70b-instruct` ✅
- `meta-llama/llama-3.1-405b-instruct` ✅

### 其他推荐模型
- `mistralai/mistral-large` ✅
- `microsoft/phi-3-medium-128k-instruct` ✅
- `cohere/command-r-plus` ✅

## 🔧 修复建议

### 1. 更新到最新模型 (推荐)
```sql
-- 更新为最新的旗舰模型
UPDATE ai_models SET model_id = 'openai/gpt-5' WHERE name LIKE '%GPT%5%';
UPDATE ai_models SET model_id = 'anthropic/claude-sonnet-4.5' WHERE name LIKE '%CLAUDE%4.5%';
UPDATE ai_models SET model_id = 'google/gemini-2.5-pro' WHERE name LIKE '%GEMINI%2.5%';
UPDATE ai_models SET model_id = 'x-ai/grok-4' WHERE name LIKE '%GROK%4%';
UPDATE ai_models SET model_id = 'deepseek/deepseek-chat-v3.1' WHERE name LIKE '%DEEPSEEK%3.1%';
UPDATE ai_models SET model_id = 'qwen/qwen3-max' WHERE name LIKE '%QWEN3%MAX%';
```

### 2. 修复旧的错误ID
```sql
-- 修复 Gemini 旧ID
UPDATE ai_models SET model_id = 'google/gemini-2.5-pro'
WHERE model_id = 'google/gemini-pro-1.5';

-- 修复 Grok 旧ID
UPDATE ai_models SET model_id = 'x-ai/grok-4'
WHERE model_id IN ('x-ai/grok-beta', 'xai/grok-beta', 'x-ai/grok-2-1212');
```

## 验证方法

使用 OpenRouter API 测试:
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```
