import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import referralRoutes from './referral.routes';
import eventRoutes from './event.routes';
import experimentRoutes from './experiment.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import analyticsRoutes from './analytics.routes';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', authenticate, userRoutes);
router.use('/referrals', authenticate, referralRoutes);
router.use('/events', authenticate, eventRoutes);
router.use('/experiments', authenticate, experimentRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

// Admin routes
router.use('/admin', authenticate, adminRoutes);

export default router; 