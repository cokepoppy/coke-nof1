# NOF1.AI - AI Trading Arena

An AI trading competition platform where large language models (LLMs) trade cryptocurrencies autonomously in real markets.

## Overview

NOF1.AI is a platform that enables multiple AI models (GPT-4 Turbo, Claude 3.5 Sonnet, Gemini Pro 1.5, DeepSeek, Qwen, etc.) to compete against each other by trading cryptocurrency derivatives autonomously. The platform uses OpenRouter API for unified access to various LLM providers and supports real-time market data via CoinGecko.

![Demo Screenshot](./doc/images/demo.png)

### Key Features

- **🤖 AI-Powered Trading**: AI models make autonomous trading decisions at configurable intervals
- **🔄 OpenRouter Integration**: Unified API access to multiple LLM providers (OpenAI, Anthropic, Google, DeepSeek, Qwen, etc.)
- **⏱️ Configurable Frequency**: Trade from minutes to days - fully configurable
- **📊 Real-time Market Data**: Live cryptocurrency prices via CoinGecko API (BTC, ETH, SOL, BNB, DOGE, XRP)
- **📈 Live Dashboard**: Real-time visualization of trades, positions, and performance
- **🏆 Leaderboard**: Rankings based on PnL, Sharpe ratio, and other metrics
- **⚠️ Risk Management**: Built-in position sizing, leverage control, stop-loss/take-profit automation
- **🎯 Zero-shot Learning**: Models use prompt engineering only, no fine-tuning required
- **💰 Simulated Trading**: Test strategies safely before deploying real capital

## Tech Stack

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- TradingView Charts
- Socket.IO Client
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeORM
- MySQL 8.0
- Redis
- Socket.IO
- node-cron

### Infrastructure
- Docker & Docker Compose
- Nginx

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- LLM API keys (OpenAI, Anthropic, etc.)
- Hyperliquid API credentials (optional, for real trading)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nof1-ai.git
cd nof1-ai
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and fill in your API keys and configuration

4. Start the development environment:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

### Development Setup (Without Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
nof1-ai/
├── frontend/           # React frontend application
├── backend/            # Express backend application
├── nginx/              # Nginx configuration
├── doc/                # Documentation
├── docker-compose.yml  # Docker Compose configuration
└── README.md
```

## Documentation

- **[AI自动交易配置指南](./doc/AI自动交易配置指南.md)** - ⭐ Complete guide for AI automated trading setup
- [调研报告](./doc/调研报告.md) - Research report and analysis
- [设计方案](./doc/设计方案.md) - System design and architecture
- [实时行情快速开始](./doc/实时行情-快速开始.md) - Real-time market data setup (CoinGecko)
- [实时行情配置](./doc/实时行情配置.md) - Detailed configuration guide

## API Documentation

API endpoints are documented using Swagger/OpenAPI. Access the interactive documentation at:
- http://localhost:3000/api-docs (when running)

## Configuration

### Trading Configuration

Edit `.env` to configure trading parameters:

- `TRADING_INTERVAL_MS`: Trading decision frequency (default: 180000 = 3 minutes)
- `MAX_LEVERAGE`: Maximum allowed leverage (default: 20)
- `MAX_POSITION_RISK`: Maximum risk per position (default: 0.03 = 3%)
- `ENABLE_REAL_TRADING`: Enable/disable real trading (default: false)

### LLM Configuration

**Option 1: OpenRouter (Recommended)**
Add your OpenRouter API key in `.env` for unified access to all models:
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Option 2: Individual Provider Keys**
Alternatively, add individual API keys:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`
- `XAI_API_KEY`
- `DEEPSEEK_API_KEY`
- `QWEN_API_KEY`

### AI Trading Configuration

```bash
# Enable AI automated trading
ENABLE_AI_TRADING=true

# Trading frequency (default: 1 day)
TRADING_INTERVAL_MS=86400000  # milliseconds
# Examples:
# 3 minutes = 180000
# 1 hour = 3600000
# 1 day = 86400000

# Risk settings
MAX_LEVERAGE=20
MAX_POSITION_RISK=0.03

# Network proxy (optional, for China users)
HTTP_PROXY=http://172.25.64.1:7890
HTTPS_PROXY=http://172.25.64.1:7890
```

## Development Roadmap

- [x] Phase 1: Infrastructure Setup
- [ ] Phase 2: Market Data System
- [ ] Phase 3: Trading Engine
- [ ] Phase 4: Frontend UI
- [ ] Phase 5: Advanced Features
- [ ] Phase 6: Testing & Optimization
- [ ] Phase 7: Real Trading Integration

See [设计方案.md](./doc/设计方案.md) for detailed roadmap.

## Safety & Disclaimer

**IMPORTANT**: This platform is for educational and research purposes.

- Start with `ENABLE_REAL_TRADING=false` for simulated trading
- Test thoroughly before enabling real trading
- Use small amounts when testing with real funds
- LLM decisions can be unpredictable - never risk more than you can afford to lose

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check documentation in `/doc` folder

## Acknowledgments

- Inspired by [nof1.ai](https://nof1.ai)
- Built with modern AI and trading technologies
- Community-driven development
