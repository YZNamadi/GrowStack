import { Request, Response, NextFunction } from 'express';
import { createEvent, getUserEvents as fetchUserEvents, getEventStats as fetchEventStats } from '../services/event.service';
import { AppError } from '../middleware/errorHandler';

interface TrackEventBody {
  eventName: string;
  properties?: Record<string, any>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    platform?: string;
  };
}

export const trackEvent = async (
  req: Request<{}, {}, TrackEventBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventName, properties, metadata } = req.body;

    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const event = await createEvent({
      userId: req.user.id,
      eventName,
      properties,
      metadata: {
        ...metadata,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { limit, offset, eventName, startDate, endDate } = req.query;

    const events = await fetchUserEvents(req.user.id, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      eventName: eventName as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      status: 'success',
      data: {
        events: events.rows,
        total: events.count,
      },
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
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { eventName, startDate, endDate } = req.query;

    if (!eventName || !startDate || !endDate) {
      throw new AppError('Missing required parameters', 400);
    }

    const stats = await fetchEventStats(
      req.user.id,
      eventName as string,
      {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      }
    );

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