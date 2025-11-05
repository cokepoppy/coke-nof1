import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/database';
import { logger } from './utils/logger';
import { initializeWebSocket } from './websocket';
import { startTradingJobs } from './jobs';
import http from 'http';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Try to initialize database connection (optional)
    try {
      await AppDataSource.initialize();
      logger.info('Database connection established');
    } catch (dbError) {
      logger.warn('Database connection failed, starting without database:', dbError);
      logger.warn('API will work but database-dependent features will be unavailable');
    }

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    initializeWebSocket(server);
    logger.info('WebSocket initialized');

    // Start trading jobs
    if (process.env.ENABLE_TRADING_JOBS === 'true') {
      startTradingJobs();
      logger.info('Trading jobs started');
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
