import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - coming soon' });
});

router.get('/me', (req, res) => {
  res.json({ message: 'Get current user endpoint - coming soon' });
});

export default router;
