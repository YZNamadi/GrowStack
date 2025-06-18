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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

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