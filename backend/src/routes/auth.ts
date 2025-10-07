import { Router } from 'express';
import {
  login,
  register,
  refresh,
  getProfile,
  updateProfile
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateLogin, validateUser } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/register', validateUser, register);
router.post('/refresh', refresh);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
