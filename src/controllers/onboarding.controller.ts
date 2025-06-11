import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { OnboardingStep } from '../models/User';
import {
  updateOnboardingStep,
  getOnboardingStats,
  getOnboardingTimeStats,
} from '../services/onboarding.service';

export const updateStep = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { step, metadata } = req.body;

    if (!Object.values(OnboardingStep).includes(step)) {
      throw new AppError('Invalid onboarding step', 400);
    }

    const user = await updateOnboardingStep(req.user.id, step, metadata);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          onboardingStep: user.onboardingStep,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const timeRange = startDate && endDate
      ? {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string),
        }
      : undefined;

    const stats = await getOnboardingStats(timeRange);

    res.json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const timeStats = await getOnboardingTimeStats();

    res.json({
      status: 'success',
      data: {
        timeStats,
      },
    });
  } catch (error) {
    next(error);
  }
}; 