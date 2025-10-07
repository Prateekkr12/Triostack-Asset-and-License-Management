import { Router } from 'express';
import authRoutes from './auth';
import assetRoutes from './assets';
import userRoutes from './users';
import allocationRoutes from './allocations';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);
router.use('/users', userRoutes);
router.use('/allocations', allocationRoutes);

export default router;
