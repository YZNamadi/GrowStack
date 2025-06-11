import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { createEvent } from '../services/event.service';
import Experiment, { ExperimentStatus } from '../models/Experiment';

export const createExperiment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, variants, startDate, endDate } = req.body;

    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const experiment = await Experiment.create({
      name,
      description,
      variants,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: ExperimentStatus.ACTIVE,
      createdBy: req.user.id,
      metadata: {
        targetAudience: [],
        successMetrics: [],
      },
    });

    // Track experiment creation
    await createEvent({
      userId: req.user.id,
      eventName: 'experiment_created',
      properties: {
        experimentId: experiment.id,
        name: experiment.name,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        experiment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExperimentResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const experiment = await Experiment.findByPk(id, {
      include: ['creator'],
    });

    if (!experiment) {
      throw new AppError('Experiment not found', 404);
    }

    // Get experiment results logic here
    const results = {
      experimentId: experiment.id,
      name: experiment.name,
      status: experiment.status,
      totalParticipants: 1000, // This would come from your analytics
      variants: experiment.variants.map(variant => ({
        name: variant.name,
        participants: 500, // This would come from your analytics
        conversions: 50, // This would come from your analytics
        conversionRate: '10%', // This would come from your analytics
      })),
      startDate: experiment.startDate,
      endDate: experiment.endDate,
    };

    res.json({
      status: 'success',
      data: {
        results,
      },
    });
  } catch (error) {
    next(error);
  }
}; 