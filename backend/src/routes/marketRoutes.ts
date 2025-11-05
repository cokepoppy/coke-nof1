import { Router } from 'express';

const router = Router();

// TODO: Implement market data routes
router.get('/prices', (req, res) => {
  res.json({ message: 'Get current prices endpoint - coming soon' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Get historical data endpoint - coming soon' });
});

export default router;
