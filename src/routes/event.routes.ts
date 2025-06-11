import { Router } from 'express';
import { body, query } from 'express-validator';
import { trackEvent, getUserEvents, getEventStats } from '../controllers/event.controller';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Track event
router.post(
  '/track',
  [
    body('eventName').notEmpty().withMessage('Event name is required'),
    body('properties').optional().isObject(),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  trackEvent
);

// Get user events
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('eventName').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  getUserEvents
);

// Get event stats
router.get(
  '/stats',
  [
    query('eventName').notEmpty().withMessage('Event name is required'),
    query('startDate').notEmpty().isISO8601().withMessage('Start date is required'),
    query('endDate').notEmpty().isISO8601().withMessage('End date is required'),
  ],
  validateRequest,
  getEventStats
);

export default router; 