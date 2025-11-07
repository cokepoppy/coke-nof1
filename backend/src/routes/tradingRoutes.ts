import { Router } from 'express';
import aiTradingService from '../services/aiTradingService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/trading/run-cycle
 * 手动触发一次AI交易周期（用于测试）
 */
router.post('/run-cycle', async (req, res) => {
  try {
    logger.info('Manual trading cycle triggered via API');

    // 执行交易周期
    await aiTradingService.runTradingCycle();

    res.json({
      success: true,
      message: 'Trading cycle executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Error in manual trading cycle: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/trading/check-stop-loss
 * 手动检查止损止盈（用于测试）
 */
router.post('/check-stop-loss', async (req, res) => {
  try {
    logger.info('Manual stop-loss check triggered via API');

    await aiTradingService.checkStopLossTakeProfit();

    res.json({
      success: true,
      message: 'Stop-loss check completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Error in stop-loss check: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trading/status
 * 获取交易系统状态
 */
router.get('/status', (req, res) => {
  const status = {
    aiTradingEnabled: process.env.ENABLE_AI_TRADING === 'true',
    tradingInterval: parseInt(process.env.TRADING_INTERVAL_MS || '180000'),
    maxLeverage: parseInt(process.env.MAX_LEVERAGE || '20'),
    maxPositionRisk: parseFloat(process.env.MAX_POSITION_RISK || '0.03'),
    realTradingEnabled: process.env.ENABLE_REAL_TRADING === 'true',
  };

  res.json(status);
});

export default router;
