import { Router } from 'express';
import authRoutes from './authRoutes';
import modelRoutes from './modelRoutes';
import tradeRoutes from './tradeRoutes';
import positionRoutes from './positionRoutes';
import marketRoutes from './marketRoutes';
import blogRoutes from './blogRoutes';
import tradingRoutes from './tradingRoutes';
import decisionRoutes from './decisionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/models', modelRoutes);
router.use('/trades', tradeRoutes);
router.use('/positions', positionRoutes);
router.use('/market', marketRoutes);
router.use('/blog', blogRoutes);
router.use('/trading', tradingRoutes);
router.use('/decisions', decisionRoutes);

export default router;
