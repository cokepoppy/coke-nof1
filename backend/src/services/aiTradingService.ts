import { AppDataSource } from '../config/database';
import { AIModel } from '../models/AIModel';
import { Position } from '../models/Position';
import { Trade } from '../models/Trade';
import { DecisionLog } from '../models/DecisionLog';
import openRouterService, { TradingDecision } from './openRouterService';
import promptBuilderService from './promptBuilderService';
import coinGeckoService from './coinGeckoService';
import { logger } from '../utils/logger';
import { emitModelUpdate, emitTrade } from '../websocket';

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

class AITradingService {
  private modelRepository = AppDataSource.getRepository(AIModel);
  private positionRepository = AppDataSource.getRepository(Position);
  private tradeRepository = AppDataSource.getRepository(Trade);
  private decisionLogRepository = AppDataSource.getRepository(DecisionLog);
  private startTime = new Date();
  private isRunning = false;

  /**
   * Initialize the AI trading service
   */
  async initialize() {
    logger.info('Initializing AI Trading Service...');
    this.startTime = new Date();
  }

  /**
   * Run trading cycle for all active AI models
   */
  async runTradingCycle() {
    if (this.isRunning) {
      logger.warn('Trading cycle already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      logger.info('Starting AI trading cycle...');

      // Get all active AI models
      const activeModels = await this.modelRepository.find({
        where: { status: 'active' },
      });

      if (activeModels.length === 0) {
        logger.info('No active AI models found');
        return;
      }

      logger.info(`Running trading cycle for ${activeModels.length} models`);

      // Process each model sequentially to avoid overwhelming APIs
      for (const model of activeModels) {
        try {
          await this.processModel(model);
        } catch (error: any) {
          logger.error(`Error processing model ${model.name}: ${error.message}`);
        }
      }

      logger.info('Trading cycle completed');

    } catch (error: any) {
      logger.error(`Error in trading cycle: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single AI model's trading decision
   */
  private async processModel(model: AIModel) {
    logger.info(`Processing model: ${model.name} (${model.modelId})`);

    try {
      // Get current positions
      const positions = await this.positionRepository.find({
        where: { modelId: model.id },
      });

      // Update position prices
      const updatedPositions = await this.updatePositionPrices(positions);

      // Calculate account metrics
      const accountData = this.calculateAccountMetrics(model, updatedPositions);

      // Build prompt
      const systemPrompt = model.systemPrompt || promptBuilderService.getSystemPrompt();
      const userPrompt = promptBuilderService.buildUserPrompt(accountData);

      logger.debug(`User prompt for ${model.name}:\n${userPrompt.substring(0, 500)}...`);

      // Get trading decision from AI
      const decision = await openRouterService.getTradingDecision(
        model.modelId,
        systemPrompt,
        userPrompt
      );

      if (!decision) {
        logger.warn(`No valid decision from ${model.name}`);
        return;
      }

      logger.info(`${model.name} decision: ${decision.signal} ${decision.coin || ''}`);

      // Save decision log
      const decisionLog = this.decisionLogRepository.create({
        modelId: model.id,
        timestamp: new Date(),
        decisionType: decision.signal === 'buy_to_enter' ? 'LONG' :
                     decision.signal === 'sell_to_enter' ? 'SHORT' :
                     decision.signal === 'close' ? 'CLOSE' : 'HOLD',
        symbol: decision.coin || null,
        reasoning: decision.justification || 'No reasoning provided',
        marketContext: {
          prices: accountData.positions.map(p => ({ symbol: p.symbol, price: p.currentPrice })),
        },
        accountContext: {
          currentBalance: accountData.currentBalance,
          availableCash: accountData.availableCash,
          positionCount: accountData.positions.length,
        },
        outputJson: decision,
        executionStatus: 'pending',
      });
      await this.decisionLogRepository.save(decisionLog);

      // Execute the trading decision
      await this.executeTradingDecision(model, decision, accountData);

      // Update decision log status
      decisionLog.executionStatus = 'executed';
      await this.decisionLogRepository.save(decisionLog);

      // Update model's current balance in database
      model.currentBalance = accountData.currentBalance.toString();
      await this.modelRepository.save(model);

      // Emit update via WebSocket
      emitModelUpdate(model.id, {
        decision,
        accountValue: accountData.currentBalance,
        positions: updatedPositions,
      });

    } catch (error: any) {
      logger.error(`Error in processModel for ${model.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update prices for all positions
   */
  private async updatePositionPrices(positions: Position[]): Promise<PositionData[]> {
    return positions.map(pos => {
      const marketData = coinGeckoService.getPrice(pos.symbol);
      const currentPrice = marketData?.price || pos.currentPrice;

      // Calculate unrealized PnL
      const priceDiff = pos.side === 'LONG'
        ? (currentPrice - pos.entryPrice)
        : (pos.entryPrice - currentPrice);
      const unrealizedPnl = priceDiff * pos.quantity;

      // Update position in database
      pos.currentPrice = currentPrice;
      pos.unrealizedPnl = unrealizedPnl;
      pos.unrealizedPnlPct = (priceDiff / pos.entryPrice) * 100;

      return {
        symbol: pos.symbol,
        side: pos.side as 'LONG' | 'SHORT',
        quantity: Number(pos.quantity),
        entryPrice: Number(pos.entryPrice),
        currentPrice: Number(currentPrice),
        leverage: pos.leverage,
        unrealizedPnl: Number(unrealizedPnl),
        liquidationPrice: Number(pos.liquidationPrice || 0),
        profitTarget: pos.profitTarget ? Number(pos.profitTarget) : undefined,
        stopLoss: pos.stopLoss ? Number(pos.stopLoss) : undefined,
        invalidationCondition: pos.invalidationCondition,
        confidence: pos.confidence ? Number(pos.confidence) : undefined,
        entryReason: pos.entryReason,
      };
    });
  }

  /**
   * Calculate account metrics
   */
  private calculateAccountMetrics(model: AIModel, positions: PositionData[]) {
    const initialBalance = Number(model.initialBalance);
    const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);

    // For now, use current balance or calculate from initial + PnL
    let currentBalance = model.currentBalance ? Number(model.currentBalance) : initialBalance;
    currentBalance = initialBalance + totalUnrealizedPnl;

    const totalReturn = ((currentBalance - initialBalance) / initialBalance) * 100;

    // Calculate available cash (simplified - assuming positions are margined)
    const usedMargin = positions.reduce((sum, pos) => {
      return sum + (pos.quantity * pos.entryPrice / pos.leverage);
    }, 0);
    const availableCash = currentBalance - usedMargin;

    // Calculate trading duration
    const tradingMinutes = Math.floor((Date.now() - this.startTime.getTime()) / 60000);

    return {
      currentBalance,
      initialBalance,
      totalReturn,
      availableCash: Math.max(0, availableCash),
      positions,
      tradingMinutes,
    };
  }

  /**
   * Execute a trading decision
   */
  private async executeTradingDecision(
    model: AIModel,
    decision: TradingDecision,
    accountData: any
  ) {
    try {
      switch (decision.signal) {
        case 'buy_to_enter':
          await this.openLongPosition(model, decision, accountData);
          break;

        case 'sell_to_enter':
          await this.openShortPosition(model, decision, accountData);
          break;

        case 'close':
          await this.closePosition(model, decision.coin);
          break;

        case 'hold':
          logger.info(`${model.name} decided to hold`);
          break;

        default:
          logger.warn(`Unknown signal: ${decision.signal}`);
      }

      // Save updated positions
      await this.positionRepository.save(
        await this.positionRepository.find({ where: { modelId: model.id } })
      );

    } catch (error: any) {
      logger.error(`Error executing decision: ${error.message}`);
      throw error;
    }
  }

  /**
   * Open a long position
   */
  private async openLongPosition(model: AIModel, decision: TradingDecision, accountData: any) {
    const marketData = coinGeckoService.getPrice(decision.coin);
    if (!marketData) {
      logger.error(`No market data for ${decision.coin}`);
      return;
    }

    const entryPrice = marketData.price;

    // Validate position size and risk
    const maxRisk = accountData.currentBalance * 0.03; // 3% max risk
    if (decision.risk_usd > maxRisk) {
      logger.warn(`Risk ${decision.risk_usd} exceeds max ${maxRisk}, adjusting...`);
      decision.risk_usd = maxRisk;
    }

    // Calculate liquidation price for long
    const margin = (decision.quantity * entryPrice) / decision.leverage;
    const liquidationPrice = entryPrice * (1 - 0.9 / decision.leverage);

    // Create position
    const position = this.positionRepository.create({
      modelId: model.id,
      symbol: decision.coin,
      side: 'LONG',
      entryPrice,
      currentPrice: entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
      margin,
      liquidationPrice,
      profitTarget: decision.profit_target,
      stopLoss: decision.stop_loss,
      invalidationCondition: decision.invalidation_condition,
      confidence: decision.confidence,
      entryReason: decision.justification,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      openedAt: new Date(),
    });

    await this.positionRepository.save(position);

    // Create trade record
    const trade = this.tradeRepository.create({
      modelId: model.id,
      symbol: decision.coin,
      side: 'LONG',
      entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
      entryTime: new Date(),
      status: 'open',
      profitTarget: decision.profit_target,
      stopLoss: decision.stop_loss,
      invalidationCondition: decision.invalidation_condition,
      confidence: decision.confidence,
      entryReason: decision.justification,
    });

    await this.tradeRepository.save(trade);

    logger.info(`Opened LONG position: ${decision.coin} @ ${entryPrice}, qty: ${decision.quantity}, leverage: ${decision.leverage}x`);

    // Emit trade event
    emitTrade(model.id, {
      type: 'open',
      symbol: decision.coin,
      side: 'LONG',
      price: entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
    });
  }

  /**
   * Open a short position
   */
  private async openShortPosition(model: AIModel, decision: TradingDecision, accountData: any) {
    const marketData = coinGeckoService.getPrice(decision.coin);
    if (!marketData) {
      logger.error(`No market data for ${decision.coin}`);
      return;
    }

    const entryPrice = marketData.price;

    // Validate position size and risk
    const maxRisk = accountData.currentBalance * 0.03;
    if (decision.risk_usd > maxRisk) {
      logger.warn(`Risk ${decision.risk_usd} exceeds max ${maxRisk}, adjusting...`);
      decision.risk_usd = maxRisk;
    }

    // Calculate liquidation price for short
    const margin = (decision.quantity * entryPrice) / decision.leverage;
    const liquidationPrice = entryPrice * (1 + 0.9 / decision.leverage);

    // Create position
    const position = this.positionRepository.create({
      modelId: model.id,
      symbol: decision.coin,
      side: 'SHORT',
      entryPrice,
      currentPrice: entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
      margin,
      liquidationPrice,
      profitTarget: decision.profit_target,
      stopLoss: decision.stop_loss,
      invalidationCondition: decision.invalidation_condition,
      confidence: decision.confidence,
      entryReason: decision.justification,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      openedAt: new Date(),
    });

    await this.positionRepository.save(position);

    // Create trade record
    const trade = this.tradeRepository.create({
      modelId: model.id,
      symbol: decision.coin,
      side: 'SHORT',
      entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
      entryTime: new Date(),
      status: 'open',
      profitTarget: decision.profit_target,
      stopLoss: decision.stop_loss,
      invalidationCondition: decision.invalidation_condition,
      confidence: decision.confidence,
      entryReason: decision.justification,
    });

    await this.tradeRepository.save(trade);

    logger.info(`Opened SHORT position: ${decision.coin} @ ${entryPrice}, qty: ${decision.quantity}, leverage: ${decision.leverage}x`);

    // Emit trade event
    emitTrade(model.id, {
      type: 'open',
      symbol: decision.coin,
      side: 'SHORT',
      price: entryPrice,
      quantity: decision.quantity,
      leverage: decision.leverage,
    });
  }

  /**
   * Close a position
   */
  private async closePosition(model: AIModel, symbol: string) {
    const position = await this.positionRepository.findOne({
      where: { modelId: model.id, symbol },
    });

    if (!position) {
      logger.warn(`No position found for ${symbol}`);
      return;
    }

    const marketData = coinGeckoService.getPrice(symbol);
    if (!marketData) {
      logger.error(`No market data for ${symbol}`);
      return;
    }

    const exitPrice = marketData.price;
    const pnl = Number(position.unrealizedPnl);

    // Update trade record
    const trades = await this.tradeRepository.find({
      where: { modelId: model.id, symbol, status: 'open' },
      order: { entryTime: 'DESC' },
    });

    if (trades.length > 0) {
      const trade = trades[0];
      trade.exitPrice = exitPrice;
      trade.exitTime = new Date();
      trade.status = 'closed';
      trade.profitLoss = pnl;
      trade.profitLossPct = Number(position.unrealizedPnlPct);
      await this.tradeRepository.save(trade);
    }

    // Remove position
    await this.positionRepository.remove(position);

    logger.info(`Closed position: ${symbol} @ ${exitPrice}, PnL: ${pnl.toFixed(2)}`);

    // Emit trade event
    emitTrade(model.id, {
      type: 'close',
      symbol,
      side: position.side,
      price: exitPrice,
      pnl,
    });
  }

  /**
   * Check and execute stop loss / take profit
   */
  async checkStopLossTakeProfit() {
    try {
      const positions = await this.positionRepository.find();

      for (const position of positions) {
        const marketData = coinGeckoService.getPrice(position.symbol);
        if (!marketData) continue;

        const currentPrice = marketData.price;
        const shouldClose = this.shouldClosePosition(position, currentPrice);

        if (shouldClose) {
          const model = await this.modelRepository.findOne({
            where: { id: position.modelId },
          });

          if (model) {
            logger.info(`Auto-closing position ${position.symbol} for ${model.name}: ${shouldClose}`);
            await this.closePosition(model, position.symbol);
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error checking stop loss/take profit: ${error.message}`);
    }
  }

  /**
   * Determine if position should be closed
   */
  private shouldClosePosition(position: Position, currentPrice: number): string | null {
    if (position.side === 'LONG') {
      if (position.profitTarget && currentPrice >= position.profitTarget) {
        return 'Take profit hit';
      }
      if (position.stopLoss && currentPrice <= position.stopLoss) {
        return 'Stop loss hit';
      }
      if (position.liquidationPrice && currentPrice <= position.liquidationPrice) {
        return 'Liquidation';
      }
    } else {
      if (position.profitTarget && currentPrice <= position.profitTarget) {
        return 'Take profit hit';
      }
      if (position.stopLoss && currentPrice >= position.stopLoss) {
        return 'Stop loss hit';
      }
      if (position.liquidationPrice && currentPrice >= position.liquidationPrice) {
        return 'Liquidation';
      }
    }
    return null;
  }
}

export default new AITradingService();
