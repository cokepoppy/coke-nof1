import coinGeckoService from './coinGeckoService';
import { logger } from '../utils/logger';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface PositionData {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  unrealizedPnl: number;
  liquidationPrice: number;
  profitTarget?: number;
  stopLoss?: number;
  invalidationCondition?: string;
  confidence?: number;
  entryReason?: string;
}

interface AccountData {
  currentBalance: number;
  initialBalance: number;
  totalReturn: number;
  availableCash: number;
  positions: PositionData[];
  sharpeRatio?: number;
  tradingMinutes: number;
}

class PromptBuilderService {
  private symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP'];

  /**
   * Build user prompt with market data and account state
   * Following NOF1.ai's format from their blog post
   */
  buildUserPrompt(account: AccountData): string {
    const marketData = this.getMarketData();

    let prompt = `It has been ${account.tradingMinutes} minutes since you started trading.\n\n`;
    prompt += `Below, we are providing you with market data, price data, and signals so you can make informed trading decisions.\n\n`;
    prompt += `**ALL PRICE AND SIGNAL DATA IS ORDERED: OLDEST → NEWEST**\n\n`;
    prompt += `---\n\n`;

    // Current market state for all coins
    prompt += `### CURRENT MARKET STATE FOR ALL COINS\n\n`;
    marketData.forEach(data => {
      prompt += `**${data.symbol}**: `;
      prompt += `Price = $${data.price.toFixed(data.symbol === 'DOGE' ? 4 : 2)}, `;
      prompt += `24h Change = ${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%, `;
      prompt += `24h Volume = $${this.formatLargeNumber(data.volume24h)}\n`;
    });

    prompt += `\n---\n\n`;

    // Account information
    prompt += `### YOUR ACCOUNT INFORMATION & PERFORMANCE\n\n`;
    prompt += `Current Total Return: ${account.totalReturn.toFixed(2)}%\n\n`;
    prompt += `Available Cash: $${account.availableCash.toFixed(2)}\n\n`;
    prompt += `**Current Account Value:** $${account.currentBalance.toFixed(2)}\n\n`;

    // Current positions
    if (account.positions.length > 0) {
      prompt += `Current live positions & performance:\n`;
      account.positions.forEach(pos => {
        const notional = pos.quantity * pos.currentPrice;
        prompt += `{\n`;
        prompt += `  'symbol': '${pos.symbol}',\n`;
        prompt += `  'side': '${pos.side}',\n`;
        prompt += `  'quantity': ${pos.quantity},\n`;
        prompt += `  'entry_price': ${pos.entryPrice},\n`;
        prompt += `  'current_price': ${pos.currentPrice},\n`;
        prompt += `  'liquidation_price': ${pos.liquidationPrice || 0},\n`;
        prompt += `  'unrealized_pnl': ${pos.unrealizedPnl.toFixed(2)},\n`;
        prompt += `  'leverage': ${pos.leverage},\n`;
        if (pos.profitTarget) {
          prompt += `  'exit_plan': {\n`;
          prompt += `    'profit_target': ${pos.profitTarget},\n`;
          prompt += `    'stop_loss': ${pos.stopLoss},\n`;
          prompt += `    'invalidation_condition': '${pos.invalidationCondition || 'None'}'\n`;
          prompt += `  },\n`;
        }
        if (pos.confidence) {
          prompt += `  'confidence': ${pos.confidence},\n`;
        }
        prompt += `  'notional_usd': ${notional.toFixed(2)}\n`;
        prompt += `}\n\n`;
      });
    } else {
      prompt += `No current positions.\n\n`;
    }

    if (account.sharpeRatio !== undefined) {
      prompt += `Sharpe Ratio: ${account.sharpeRatio.toFixed(3)}\n`;
    }

    prompt += `\n---\n\n`;

    // Trading instructions
    prompt += this.getTradingInstructions();

    return prompt;
  }

  /**
   * Get current market data for all symbols
   */
  private getMarketData(): MarketData[] {
    return this.symbols.map(symbol => {
      const data = coinGeckoService.getPrice(symbol);
      return {
        symbol,
        price: data?.price || 0,
        change24h: data?.change24h || 0,
        volume24h: data?.volume24h || 0,
      };
    });
  }

  /**
   * Format large numbers in readable format
   */
  private formatLargeNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  /**
   * Get trading instructions for the model
   */
  private getTradingInstructions(): string {
    return `### TRADING INSTRUCTIONS

**Your Goal:** Maximize profit and loss (PnL) through systematic cryptocurrency trading.

**Action Space:**
- buy_to_enter: Open a LONG position (bet on price rising)
- sell_to_enter: Open a SHORT position (bet on price falling)
- hold: Do nothing, maintain current positions
- close: Close an existing position

**Tradable Assets:** BTC, ETH, SOL, BNB, DOGE, XRP

**Position Requirements:**
You must return a JSON object with your decision. For buy_to_enter or sell_to_enter:

{
  "signal": "buy_to_enter" | "sell_to_enter" | "hold" | "close",
  "coin": "BTC" | "ETH" | "SOL" | "BNB" | "DOGE" | "XRP",
  "quantity": <number>,
  "leverage": <1-20>,
  "profit_target": <price>,
  "stop_loss": <price>,
  "invalidation_condition": "<specific condition that voids this trade>",
  "justification": "<2-3 sentence explanation>",
  "confidence": <0.0-1.0>,
  "risk_usd": <USD amount at risk>
}

**Risk Management:**
- Maximum leverage: 20x
- Maximum position risk: 3% of account value per trade
- Always set profit targets and stop losses
- Consider liquidation prices carefully
- Account for trading fees (~0.05% per trade)

**Position Sizing:**
- Calculate position size based on available cash and leverage
- Risk amount should be: (entry_price - stop_loss) * quantity
- Ensure total exposure doesn't exceed account balance * max_leverage

**Important Notes:**
- You are trading perpetual futures (derivatives with leverage)
- Leverage amplifies both gains and losses
- Set clear invalidation conditions (e.g., "BTC breaks below $105,000")
- Always provide justification for your decisions
- Consider market conditions and your existing positions
- Don't over-trade - quality over quantity
- Use your Sharpe ratio to normalize for risk

**Response Format:**
Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.
`;
  }

  /**
   * Get system prompt defining the AI's role and behavior
   */
  getSystemPrompt(): string {
    return `You are an expert cryptocurrency trader managing a portfolio with the goal of maximizing risk-adjusted returns.

You will receive:
1. Current market data (prices, volume, changes)
2. Your account balance and performance metrics
3. Current open positions (if any)

You must:
1. Analyze the market data carefully
2. Consider your existing positions
3. Make ONE trading decision per call
4. Follow strict risk management rules
5. Provide clear justification for your decisions

Trading Philosophy:
- Use systematic, data-driven decision making
- Manage risk carefully with position sizing and stop losses
- Consider both technical signals and market context
- Don't over-leverage or take excessive risk
- Quality setups over frequent trading
- Always have clear entry, exit, and invalidation criteria

Risk Management Rules:
- Never risk more than 3% of account value on a single trade
- Always set stop losses and profit targets
- Consider liquidation prices when using leverage
- Account for fees in your calculations
- Diversify across assets when appropriate

Output Format:
You must respond with a valid JSON object containing your trading decision.
For "hold" or "close" signals, still provide the full object structure but the action fields can be minimal.

Remember: You are trading with real capital. Be disciplined, patient, and systematic.`;
  }
}

export default new PromptBuilderService();
