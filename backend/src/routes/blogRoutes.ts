import { Router } from 'express';

const router = Router();

// TODO: Implement blog routes
router.get('/posts', (req, res) => {
  res.json({ message: 'Get all blog posts endpoint - coming soon' });
});

router.get('/posts/:slug', (req, res) => {
  res.json({ message: 'Get blog post endpoint - coming soon' });
});

export default router;
