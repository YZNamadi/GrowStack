import { Op } from 'sequelize';
import Event from '../models/Event';

interface CreateEventParams {
  userId: number;
  eventName: string;
  properties?: Record<string, any>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    platform?: string;
  };
}

export const createEvent = async ({
  userId,
  eventName,
  properties = {},
  metadata = {},
}: CreateEventParams) => {
  return Event.create({
    userId,
    eventName,
    properties,
    metadata,
  });
};

export const getUserEvents = async (
  userId: number,
  options: {
    limit?: number;
    offset?: number;
    eventName?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) => {
  const { limit = 50, offset = 0, eventName, startDate, endDate } = options;

  const where: any = { userId };

  if (eventName) {
    where.eventName = eventName;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = startDate;
    }
    if (endDate) {
      where.createdAt[Op.lte] = endDate;
    }
  }

  return Event.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
};

export const getEventStats = async (
  userId: number,
  eventName: string,
  timeRange: {
    startDate: Date;
    endDate: Date;
  }
) => {
  const { startDate, endDate } = timeRange;

  const events = await Event.findAll({
    where: {
      userId,
      eventName,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  return {
    total: events.length,
    firstOccurrence: events[0]?.createdAt,
    lastOccurrence: events[events.length - 1]?.createdAt,
  };
}; 