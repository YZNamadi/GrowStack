import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import {
  getOnboardingAnalytics,
  getReferralAnalytics,
  getEventAnalytics,
  getNotificationAnalytics,
  getUserRetentionAnalytics,
} from '../services/analytics.service';

export const getOnboardingStats = async (
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

    const stats = await getOnboardingAnalytics(timeRange);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getReferralStats = async (
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

    const stats = await getReferralAnalytics(timeRange);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventStats = async (
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

    const stats = await getEventAnalytics(timeRange);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationStats = async (
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

    const stats = await getNotificationAnalytics(timeRange);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getRetentionStats = async (
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

    const stats = await getUserRetentionAnalytics(timeRange);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}; 