import { Router } from 'express';
import authRoutes from './authRoutes';
import modelRoutes from './modelRoutes';
import tradeRoutes from './tradeRoutes';
import marketRoutes from './marketRoutes';
import blogRoutes from './blogRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/models', modelRoutes);
router.use('/trades', tradeRoutes);
router.use('/market', marketRoutes);
router.use('/blog', blogRoutes);

export default router;
