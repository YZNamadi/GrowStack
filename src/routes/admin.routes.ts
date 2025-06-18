import { Router } from 'express';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminDashboard:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *           description: Total number of users in the system
 *         activeUsers:
 *           type: integer
 *           description: Number of active users in the last 30 days
 *         totalRevenue:
 *           type: number
 *           description: Total revenue generated
 *         recentActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of activity
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: When the activity occurred
 *         systemHealth:
 *           type: object
 *           properties:
 *             cpu:
 *               type: number
 *               description: CPU usage percentage
 *             memory:
 *               type: number
 *               description: Memory usage percentage
 *             uptime:
 *               type: number
 *               description: System uptime in seconds
 *         recentErrors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 description: Error message
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: When the error occurred
 */

// All admin routes require admin authorization
router.use(authorize([UserRole.ADMIN]));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     description: Retrieve comprehensive dashboard data including user statistics, system health, and recent activities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AdminDashboard'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */

// Admin dashboard stats
router.get('/dashboard', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Admin dashboard endpoint'
    }
  });
});

export default router; 