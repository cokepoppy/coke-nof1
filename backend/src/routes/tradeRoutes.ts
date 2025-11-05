import { Router } from 'express';

const router = Router();

// TODO: Implement trade routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all trades endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get trade details endpoint - coming soon' });
});

export default router;
