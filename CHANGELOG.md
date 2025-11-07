# Changelog

All notable changes to NOF1.AI will be documented in this file.

## [1.1.0] - 2025-01-06

### Added - AI Automated Trading System

#### Core Features
- **OpenRouter Integration**: Unified API access to multiple LLM providers
  - Support for GPT-4 Turbo, Claude 3.5 Sonnet, Gemini Pro 1.5, DeepSeek, Qwen, and more
  - Automatic proxy support for network restrictions
  - Configurable temperature and token limits

- **AI Trading Service** (`backend/src/services/aiTradingService.ts`)
  - Autonomous trading decision loop
  - Position management (open, close, monitor)
  - Account metrics calculation
  - Real-time PnL tracking
  - Stop-loss and take-profit automation (checks every 30 seconds)

- **Prompt Builder Service** (`backend/src/services/promptBuilderService.ts`)
  - NOF1.ai-style market data formatting
  - Account state serialization
  - Trading instructions generation
  - Support for 6 cryptocurrencies (BTC, ETH, SOL, BNB, DOGE, XRP)

- **OpenRouter Service** (`backend/src/services/openRouterService.ts`)
  - Unified API client for all LLM providers
  - Automatic JSON response parsing
  - Error handling and retry logic
  - Network proxy support

- **Scheduled Jobs** (Updated `backend/src/jobs/index.ts`)
  - Configurable trading frequency (minutes to days)
  - Automatic stop-loss/take-profit monitoring
  - Smart cron scheduling based on interval

#### Configuration
- **New Environment Variables**:
  - `OPENROUTER_API_KEY`: OpenRouter API key (required)
  - `ENABLE_AI_TRADING`: Enable/disable AI trading
  - `TRADING_INTERVAL_MS`: Configurable trading frequency (default: 1 day = 86400000ms)
  - `HTTP_PROXY` / `HTTPS_PROXY`: Network proxy support for restricted networks

- **Database Setup Script**: `backend/scripts/setup-ai-models.sql`
  - Quick setup for multiple AI models
  - Pre-configured with sensible defaults
  - Easy model activation/deactivation

#### Documentation
- **AI自动交易配置指南.md**: Comprehensive Chinese guide (15+ sections)
  - System architecture overview
  - Quick start guide (5 minutes)
  - Configuration reference
  - Model selection guide
  - Risk management guidelines
  - Troubleshooting section
  - Performance optimization tips

- **QUICK_START.md**: Fast 5-minute setup guide
  - Step-by-step instructions
  - Common issues and solutions
  - Command reference
  - FAQ section

#### Risk Management
- Maximum position risk: 3% of account value per trade
- Leverage control: 1-20x configurable
- Automatic liquidation price calculation
- Position sizing validation
- Stop-loss/take-profit automation
- Real-time monitoring every 30 seconds

#### Real-time Features
- WebSocket events for model trading decisions
- Live position updates
- Trade execution notifications
- Account value tracking

### Changed
- Updated README.md with AI trading features and emojis
- Enhanced `.env.example` with comprehensive configuration options
- Modified system to use OpenRouter instead of individual API clients
- Updated documentation structure

### Technical Implementation
- **Language**: TypeScript
- **New Services**: 3 major services added
  - OpenRouterService: API client
  - PromptBuilderService: Data formatting
  - AITradingService: Main trading logic
- **New Configuration**: 6+ environment variables
- **Database**: Leverages existing AIModel, Position, Trade entities
- **Integration**: CoinGecko for real-time market data
- **Job Scheduling**: Node-cron for flexible scheduling
- **Architecture**: Inspired by NOF1.ai's Alpha Arena design

---

## [Unreleased]

### Added
- Real-time cryptocurrency market data integration via CoinGecko API
  - Support for BTC, ETH, SOL, BNB, DOGE, XRP
  - Price updates every 10 seconds
  - 24-hour change percentage
  - 24-hour trading volume
- WebSocket real-time push to frontend
  - Price updates broadcast to all connected clients
  - Auto-reconnection on connection loss
- Frontend price display component
  - Color-coded price changes (green for up, red for down)
  - Real-time updates without page refresh
- Custom `useWebSocket` React hook for WebSocket management
- CoinGecko service with automatic retry mechanism
- Comprehensive documentation:
  - Quick start guide (`doc/实时行情-快速开始.md`)
  - Detailed configuration (`doc/实时行情配置.md`)

### Changed
- Switched from Binance US API to CoinGecko API for better global accessibility
- No API key required (using CoinGecko public API)
- Updated Live page to display real-time market data

### Technical Details
- **Backend**:
  - New `CoinGeckoService` for market data fetching
  - REST API polling every 10 seconds
  - Socket.IO integration for real-time push
- **Frontend**:
  - Redux state management for prices
  - Custom WebSocket hook for connection management
  - Real-time price updates in top status bar

## [2025-11-06] - Initial Release

### Added
- Account value chart with realistic trading data visualization
- All models start at $10,000 with fluctuations between $4,000-$25,000
- Horizontal grid lines at $10,000 and $20,000
- Model names and values displayed at line endpoints
- Sharp, realistic price movements using curveLinear
- Demo screenshot in README

### Infrastructure
- Docker Compose setup
- MySQL 8.0 database
- Redis cache
- Nginx reverse proxy

### Frontend
- React 18 + TypeScript
- Redux Toolkit for state management
- Visx charts for data visualization
- Socket.IO client for real-time updates

### Backend
- Node.js + Express + TypeScript
- TypeORM for database
- WebSocket support via Socket.IO
- Structured logging with Winston

---

## Release Notes Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements
