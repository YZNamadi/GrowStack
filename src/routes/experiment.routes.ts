import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createExperiment,
  getExperimentResults,
} from '../controllers/experiment.controller';

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

// Get experiment results
router.get('/:id/results', getExperimentResults);

export default router; 