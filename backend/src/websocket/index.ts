import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger';
import coinGeckoService from '../services/coinGeckoService';

let io: Server;

export function initializeWebSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Listen to market data updates from CoinGecko
  coinGeckoService.on('priceUpdate', (priceData) => {
    if (io) {
      io.to('prices').emit('price:update', priceData);
      logger.debug(`Price update emitted: ${priceData.symbol} = $${priceData.price}`);
    }
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.emit('connected', { message: 'Connected to NOF1.AI' });

    socket.on('subscribe:prices', () => {
      socket.join('prices');
      logger.info(`Client ${socket.id} subscribed to prices`);

      // Send current prices immediately upon subscription
      const allPrices = coinGeckoService.getAllPrices();
      socket.emit('price:initial', allPrices);
    });

    socket.on('unsubscribe:prices', () => {
      socket.leave('prices');
      logger.info(`Client ${socket.id} unsubscribed from prices`);
    });

    socket.on('subscribe:model', (data: { modelId: number }) => {
      socket.join(`model:${data.modelId}`);
      logger.info(`Client ${socket.id} subscribed to model ${data.modelId}`);
    });

    socket.on('unsubscribe:model', (data: { modelId: number }) => {
      socket.leave(`model:${data.modelId}`);
      logger.info(`Client ${socket.id} unsubscribed from model ${data.modelId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
}

// Emit events
export function emitPriceUpdate(data: any) {
  if (io) {
    io.to('prices').emit('price:update', data);
  }
}

export function emitModelUpdate(modelId: number, data: any) {
  if (io) {
    io.to(`model:${modelId}`).emit('model:update', data);
  }
}

export function emitTrade(modelId: number, trade: any) {
  if (io) {
    io.to(`model:${modelId}`).emit('model:trade', trade);
  }
}
