import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Get user's referral code
router.get('/code', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      message: 'Get referral code endpoint'
    }
  });
});

// Get referral statistics
router.get(
  '/stats',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Referral stats endpoint'
      }
    });
  }
);

// Get referral tree (admin only)
router.get(
  '/tree',
  authorize([UserRole.ADMIN]),
  [
    query('userId').optional().isInt(),
    query('depth').optional().isInt({ min: 1, max: 10 })
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Referral tree endpoint'
      }
    });
  }
);

// Claim referral reward
router.post(
  '/claim-reward',
  [
    body('referralId').isInt()
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Claim reward endpoint'
      }
    });
  }
);

router.get('/', authorize([UserRole.ADMIN, UserRole.USER]), async (req, res) => {
  res.json({ message: 'Get referrals' });
});

router.post('/', authorize([UserRole.USER]), async (req, res) => {
  res.json({ message: 'Create referral' });
});

export default router; 