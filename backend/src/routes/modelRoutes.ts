import { Router } from 'express';

const router = Router();

// TODO: Implement model routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all models endpoint - coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get model details endpoint - coming soon' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create model endpoint - coming soon' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update model endpoint - coming soon' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete model endpoint - coming soon' });
});

export default router;
