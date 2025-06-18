import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createExperiment,
  getExperimentResults,
} from '../controllers/experiment.controller';
import Experiment, { ExperimentStatus } from '../models/Experiment';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Experiment:
 *       type: object
 *       required:
 *         - name
 *         - variants
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               weight:
 *                 type: number
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, ARCHIVED]
 *     ExperimentResults:
 *       type: object
 *       properties:
 *         totalParticipants:
 *           type: integer
 *         variantDistribution:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *         metrics:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *               confidence:
 *                 type: number
 */

/**
 * @swagger
 * /api/experiments:
 *   post:
 *     summary: Create new experiment (admin only)
 *     tags: [Experiments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Experiment'
 *     responses:
 *       201:
 *         description: Experiment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// Create new experiment (admin only)
router.post(
  '/',
  authorize([UserRole.ADMIN]),
  [
    body('name').isString().notEmpty(),
    body('description').isString(),
    body('variants').isArray(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601()
  ],
  validateRequest,
  createExperiment
);

/**
 * @swagger
 * /api/experiments:
 *   get:
 *     summary: List active experiments
 *     tags: [Experiments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active experiments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     experiments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Experiment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// List experiments
router.get('/', async (req, res) => {
  try {
    const experiments = await Experiment.findAll({
      where: { status: ExperimentStatus.ACTIVE }
    });
    res.json({
      status: 'success',
      data: { experiments }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch experiments'
    });
  }
});

/**
 * @swagger
 * /api/experiments/{id}/results:
 *   get:
 *     summary: Get experiment results
 *     tags: [Experiments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Experiment ID
 *     responses:
 *       200:
 *         description: Experiment results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExperimentResults'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Experiment not found
 */

// Get experiment results
router.get('/:id/results', getExperimentResults);

export default router; 