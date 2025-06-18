import { Router } from 'express';
import { body, query } from 'express-validator';
import { trackEvent, getUserEvents, getEventStats } from '../controllers/event.controller';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - eventName
 *       properties:
 *         eventName:
 *           type: string
 *           description: Name of the event
 *         properties:
 *           type: object
 *           description: Event-specific properties
 *         metadata:
 *           type: object
 *           description: Additional event metadata
 *         timestamp:
 *           type: string
 *           format: date-time
 *     EventStats:
 *       type: object
 *       properties:
 *         totalOccurrences:
 *           type: integer
 *         uniqueUsers:
 *           type: integer
 *         averagePerUser:
 *           type: number
 *         timeDistribution:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */

/**
 * @swagger
 * /api/events/track:
 *   post:
 *     summary: Track a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event tracked successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

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

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get user's events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of events to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of events to skip
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *         description: Filter by event name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events before this date
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 */

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

/**
 * @swagger
 * /api/events/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the event to get stats for
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventStats'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

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