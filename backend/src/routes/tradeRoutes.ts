import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Trade } from '../models/Trade';
import { Position } from '../models/Position';

const router = Router();

// Get all trades
router.get('/', async (req, res) => {
  try {
    const { modelId, status, limit = 100 } = req.query;

    const tradeRepository = AppDataSource.getRepository(Trade);
    const query = tradeRepository.createQueryBuilder('trade');

    if (modelId) {
      query.andWhere('trade.modelId = :modelId', { modelId: Number(modelId) });
    }

    if (status) {
      query.andWhere('trade.status = :status', { status });
    }

    const trades = await query
      .orderBy('trade.entryTime', 'DESC')
      .limit(Number(limit))
      .getMany();

    // Transform to match frontend expectations
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      model_id: trade.modelId,
      symbol: trade.symbol,
      side: trade.side,
      entry_price: Number(trade.entryPrice),
      exit_price: trade.exitPrice ? Number(trade.exitPrice) : null,
      quantity: Number(trade.quantity),
      leverage: trade.leverage,
      entry_time: trade.entryTime,
      exit_time: trade.exitTime || null,
      realized_pnl: trade.profitLoss ? Number(trade.profitLoss) : null,
      status: trade.status.toUpperCase(),
      stop_loss: trade.stopLoss ? Number(trade.stopLoss) : null,
      take_profit: trade.profitTarget ? Number(trade.profitTarget) : null,
    }));

    res.json(formattedTrades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

// Get trades by model
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { limit = 100 } = req.query;

    const tradeRepository = AppDataSource.getRepository(Trade);
    const trades = await tradeRepository.find({
      where: { modelId: Number(modelId) },
      order: { entryTime: 'DESC' },
      take: Number(limit),
    });

    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      model_id: trade.modelId,
      symbol: trade.symbol,
      side: trade.side,
      entry_price: Number(trade.entryPrice),
      exit_price: trade.exitPrice ? Number(trade.exitPrice) : null,
      quantity: Number(trade.quantity),
      leverage: trade.leverage,
      entry_time: trade.entryTime,
      exit_time: trade.exitTime || null,
      realized_pnl: trade.profitLoss ? Number(trade.profitLoss) : null,
      status: trade.status.toUpperCase(),
      stop_loss: trade.stopLoss ? Number(trade.stopLoss) : null,
      take_profit: trade.profitTarget ? Number(trade.profitTarget) : null,
    }));

    res.json(formattedTrades);
  } catch (error) {
    console.error('Error fetching trades for model:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
});

// Get trade by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tradeRepository = AppDataSource.getRepository(Trade);
    const trade = await tradeRepository.findOne({ where: { id: Number(id) } });

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const formattedTrade = {
      id: trade.id,
      model_id: trade.modelId,
      symbol: trade.symbol,
      side: trade.side,
      entry_price: Number(trade.entryPrice),
      exit_price: trade.exitPrice ? Number(trade.exitPrice) : null,
      quantity: Number(trade.quantity),
      leverage: trade.leverage,
      entry_time: trade.entryTime,
      exit_time: trade.exitTime || null,
      realized_pnl: trade.profitLoss ? Number(trade.profitLoss) : null,
      status: trade.status.toUpperCase(),
      stop_loss: trade.stopLoss ? Number(trade.stopLoss) : null,
      take_profit: trade.profitTarget ? Number(trade.profitTarget) : null,
    };

    res.json(formattedTrade);
  } catch (error) {
    console.error('Error fetching trade:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trade' });
  }
});

export default router;
