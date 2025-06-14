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

// Get experiment results
router.get('/:id/results', getExperimentResults);

export default router; 