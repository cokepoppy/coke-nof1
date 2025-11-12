import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { Position } from '../models/Position';

const router = Router();

// Get all positions
router.get('/', async (req, res) => {
  try {
    const { modelId } = req.query;

    const positionRepository = AppDataSource.getRepository(Position);
    const query = positionRepository.createQueryBuilder('position');

    if (modelId) {
      query.andWhere('position.modelId = :modelId', { modelId: Number(modelId) });
    }

    const positions = await query
      .orderBy('position.openedAt', 'DESC')
      .getMany();

    // Transform to match frontend expectations
    const formattedPositions = positions.map(position => ({
      id: position.id,
      model_id: position.modelId,
      symbol: position.symbol,
      side: position.side,
      entry_price: Number(position.entryPrice),
      current_price: Number(position.currentPrice),
      quantity: Number(position.quantity),
      leverage: position.leverage,
      unrealized_pnl: position.unrealizedPnl ? Number(position.unrealizedPnl) : 0,
      liquidation_price: position.liquidationPrice ? Number(position.liquidationPrice) : null,
      stop_loss: position.stopLoss ? Number(position.stopLoss) : null,
      take_profit: position.profitTarget ? Number(position.profitTarget) : null,
      opened_at: position.openedAt,
    }));

    res.json(formattedPositions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch positions' });
  }
});

// Get positions by model
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;

    const positionRepository = AppDataSource.getRepository(Position);
    const positions = await positionRepository.find({
      where: { modelId: Number(modelId) },
      order: { openedAt: 'DESC' },
    });

    const formattedPositions = positions.map(position => ({
      id: position.id,
      model_id: position.modelId,
      symbol: position.symbol,
      side: position.side,
      entry_price: Number(position.entryPrice),
      current_price: Number(position.currentPrice),
      quantity: Number(position.quantity),
      leverage: position.leverage,
      unrealized_pnl: position.unrealizedPnl ? Number(position.unrealizedPnl) : 0,
      liquidation_price: position.liquidationPrice ? Number(position.liquidationPrice) : null,
      stop_loss: position.stopLoss ? Number(position.stopLoss) : null,
      take_profit: position.profitTarget ? Number(position.profitTarget) : null,
      opened_at: position.openedAt,
    }));

    res.json(formattedPositions);
  } catch (error) {
    console.error('Error fetching positions for model:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch positions' });
  }
});

// Get position by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const positionRepository = AppDataSource.getRepository(Position);
    const position = await positionRepository.findOne({ where: { id: Number(id) } });

    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }

    const formattedPosition = {
      id: position.id,
      model_id: position.modelId,
      symbol: position.symbol,
      side: position.side,
      entry_price: Number(position.entryPrice),
      current_price: Number(position.currentPrice),
      quantity: Number(position.quantity),
      leverage: position.leverage,
      unrealized_pnl: position.unrealizedPnl ? Number(position.unrealizedPnl) : 0,
      liquidation_price: position.liquidationPrice ? Number(position.liquidationPrice) : null,
      stop_loss: position.stopLoss ? Number(position.stopLoss) : null,
      take_profit: position.profitTarget ? Number(position.profitTarget) : null,
      opened_at: position.openedAt,
    };

    res.json(formattedPosition);
  } catch (error) {
    console.error('Error fetching position:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch position' });
  }
});

export default router;
