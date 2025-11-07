import cron from 'node-cron';
import { logger } from '../utils/logger';
import aiTradingService from '../services/aiTradingService';

export function startTradingJobs() {
  logger.info('Initializing trading jobs...');

  // Check if AI trading is enabled
  const aiTradingEnabled = process.env.ENABLE_AI_TRADING === 'true';

  if (!aiTradingEnabled) {
    logger.warn('AI Trading is DISABLED. Set ENABLE_AI_TRADING=true to enable.');
  }

  // Initialize AI trading service
  aiTradingService.initialize();

  // AI trading decision loop - configurable interval
  const tradingInterval = parseInt(process.env.TRADING_INTERVAL_MS || '86400000'); // Default: 1 day
  const tradingIntervalMinutes = Math.floor(tradingInterval / 60000);

  if (aiTradingEnabled) {
    if (tradingIntervalMinutes >= 60) {
      // For intervals >= 1 hour, use hourly cron
      const hours = Math.floor(tradingIntervalMinutes / 60);
      const cronExpression = `0 */${hours} * * *`;

      cron.schedule(cronExpression, async () => {
        logger.info('AI Trading decision job running (scheduled)');
        try {
          await aiTradingService.runTradingCycle();
        } catch (error: any) {
          logger.error(`Error in trading cycle: ${error.message}`);
        }
      });

      logger.info(`AI Trading scheduled every ${hours} hour(s) (${tradingInterval}ms)`);
    } else if (tradingIntervalMinutes >= 1) {
      // For intervals 1-59 minutes, use minute-based cron
      const cronExpression = `*/${tradingIntervalMinutes} * * * *`;

      cron.schedule(cronExpression, async () => {
        logger.info('AI Trading decision job running (scheduled)');
        try {
          await aiTradingService.runTradingCycle();
        } catch (error: any) {
          logger.error(`Error in trading cycle: ${error.message}`);
        }
      });

      logger.info(`AI Trading scheduled every ${tradingIntervalMinutes} minute(s) (${tradingInterval}ms)`);
    } else {
      // For sub-minute intervals, use setInterval
      setInterval(async () => {
        logger.info('AI Trading decision job running (interval)');
        try {
          await aiTradingService.runTradingCycle();
        } catch (error: any) {
          logger.error(`Error in trading cycle: ${error.message}`);
        }
      }, tradingInterval);

      logger.info(`AI Trading scheduled every ${tradingInterval}ms`);
    }

    // Stop loss / Take profit monitoring - every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await aiTradingService.checkStopLossTakeProfit();
      } catch (error: any) {
        logger.error(`Error checking stop loss/take profit: ${error.message}`);
      }
    });

    logger.info('Stop loss/take profit monitoring scheduled (every 30 seconds)');
  }

  logger.info('Trading jobs initialization completed');
}
