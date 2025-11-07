import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { DecisionLog } from '../models/DecisionLog';
import { logger } from '../utils/logger';

const router = Router();
const decisionLogRepository = AppDataSource.getRepository(DecisionLog);

/**
 * GET /api/decisions
 * Get all decision logs with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { modelId, limit = 50 } = req.query;

    const queryBuilder = decisionLogRepository
      .createQueryBuilder('decision')
      .leftJoinAndSelect('decision.model', 'model')
      .orderBy('decision.timestamp', 'DESC')
      .take(Number(limit));

    if (modelId) {
      queryBuilder.where('decision.modelId = :modelId', { modelId: Number(modelId) });
    }

    const decisions = await queryBuilder.getMany();

    res.json(decisions);
  } catch (error: any) {
    logger.error(`Error fetching decision logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch decision logs' });
  }
});

/**
 * GET /api/decisions/model/:modelId
 * Get decision logs for a specific model
 */
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { limit = 50 } = req.query;

    const decisions = await decisionLogRepository.find({
      where: { modelId: Number(modelId) },
      relations: ['model'],
      order: { timestamp: 'DESC' },
      take: Number(limit),
    });

    res.json(decisions);
  } catch (error: any) {
    logger.error(`Error fetching decision logs for model: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch decision logs' });
  }
});

/**
 * GET /api/decisions/:id
 * Get a specific decision log by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const decision = await decisionLogRepository.findOne({
      where: { id: Number(id) },
      relations: ['model'],
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision log not found' });
    }

    res.json(decision);
  } catch (error: any) {
    logger.error(`Error fetching decision log: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch decision log' });
  }
});

export default router;
