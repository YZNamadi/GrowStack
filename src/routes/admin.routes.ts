import { Router } from 'express';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// All admin routes require admin authorization
router.use(authorize([UserRole.ADMIN]));

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