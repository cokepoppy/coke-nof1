import cron from 'node-cron';
import { logger } from '../utils/logger';

export function startTradingJobs() {
  // Market data collection job - every 10 seconds
  cron.schedule('*/10 * * * * *', () => {
    logger.debug('Market data collection job running');
    // TODO: Implement market data collection
  });

  // AI trading decision loop - every 3 minutes
  const tradingInterval = parseInt(process.env.TRADING_INTERVAL_MS || '180000');
  const tradingCronExpression = `*/${Math.floor(tradingInterval / 60000)} * * * *`;

  cron.schedule(tradingCronExpression, () => {
    logger.info('Trading decision job running');
    // TODO: Implement trading decision loop
  });

  // Performance metrics calculation - every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.debug('Performance metrics calculation job running');
    // TODO: Implement performance metrics calculation
  });

  logger.info('Trading jobs scheduled successfully');
}
